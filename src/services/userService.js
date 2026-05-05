import admin from "firebase-admin";
import Joi from "joi";

/**
 * Helper to log system activities.
 * @param {string} tenantId
 * @param {string} action
 * @param {object} details
 */
const logUserActivity = async (tenantId, action, details) => {
  const db = admin.firestore();
  await db.collection("system_logs").add({
    tenant_id: tenantId,
    module: "USERS",
    action,
    details,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
};

const userSchema = Joi.object({
  firebase_uid: Joi.string().optional(), // In case they already have an account
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().optional(),
  avatar_url: Joi.string().uri().optional(),
  branch_id: Joi.string().required(),
  dept_id: Joi.string().required(),
  role_id: Joi.string().required(),
  password: Joi.string().min(8).optional(), // For generating new auth user
});

/**
 * 3. loadUserPermissions(userId): read role_permissions → map
 * Fetches the role for the user and constructs the permissions map.
 * @param {string} userId - Firestore User ID
 * @returns {Promise<object>} Returns the extracted permissions
 */
export const loadUserPermissions = async (userId) => {
  const db = admin.firestore();
  const userDoc = await db.collection("tenant_users").doc(userId).get();

  if (!userDoc.exists) throw new Error("User not found.");
  const user = userDoc.data();
  const roleId = user.role_id;

  const rolePermDoc = await db.collection("role_permissions").doc(roleId).get();
  const rolePermissions = rolePermDoc.exists ? rolePermDoc.data().modules : {};

  return rolePermissions;
};

/**
 * Helper to construct Firebase custom claims from user context.
 * Uses exact nested structure matching permissionGuard (e.g. { asset_register: { view: true } })
 * @param {string} tenantId
 * @param {string} roleId
 * @returns {Promise<object>}
 */
const buildUserClaims = async (tenantId, roleId) => {
  const db = admin.firestore();
  const roleDoc = await db.collection("tenant_roles").doc(roleId).get();
  const roleName = roleDoc.exists ? roleDoc.data().name : "Unknown";

  const rolePermDoc = await db.collection("role_permissions").doc(roleId).get();
  const permissionsMap = rolePermDoc.exists ? rolePermDoc.data().modules : {};

  return {
    tenant_id: tenantId,
    role_id: roleId,
    role_name: roleName,
    permissions: permissionsMap,
  };
};

/**
 * 1. createUser(tenantId, data): create Firebase Auth user → set custom claims → create Firestore user doc
 * @param {string} tenantId
 * @param {object} data - User input
 * @param {string} createdBy - Admin UID performing the action
 * @returns {Promise<object>}
 */
export const createUser = async (tenantId, data, createdBy) => {
  const { error, value } = userSchema.validate(data);
  if (error)
    throw new Error(`User validation failed: ${error.details[0].message}`);

  let firebaseUid = value.firebase_uid;

  // 1. Create a Firebase Auth user if we don't already have one mapped
  if (!firebaseUid) {
    if (!value.password)
      throw new Error("A password is required for new users.");
    const userRecord = await admin.auth().createUser({
      email: value.email,
      password: value.password,
      displayName: value.name,
    });
    firebaseUid = userRecord.uid;
  }

  // 2. Set Custom Claims
  const customClaims = await buildUserClaims(tenantId, value.role_id);
  await admin.auth().setCustomUserClaims(firebaseUid, customClaims);

  // 3. Create Firestore Document
  const db = admin.firestore();
  const userRef = db.collection("tenant_users").doc();
  const userData = {
    id: userRef.id,
    tenant_id: tenantId,
    firebase_uid: firebaseUid,
    name: value.name,
    email: value.email,
    mobile: value.mobile || null,
    avatar_url: value.avatar_url || null,
    branch_id: value.branch_id,
    dept_id: value.dept_id,
    role_id: value.role_id,
    status: "active",
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    created_by: createdBy || "SYSTEM",
  };

  await userRef.set(userData);
  await logUserActivity(tenantId, "USER_CREATED", {
    user_id: userRef.id,
    email: value.email,
    role_id: value.role_id,
  });

  return userData;
};

/**
 * 2. updateUserRole(userId, roleId): update role + refresh Firebase custom claims via Admin SDK
 * @param {string} userId - Firestore User ID (from tenant_users)
 * @param {string} roleId - New Role ID
 * @returns {Promise<object>}
 */
export const updateUserRole = async (userId, roleId) => {
  const db = admin.firestore();
  const userRef = db.collection("tenant_users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) throw new Error("User not found.");
  const user = userDoc.data();

  // Validate that the role exists within the tenant
  const roleDoc = await db.collection("tenant_roles").doc(roleId).get();
  if (!roleDoc.exists || roleDoc.data().tenant_id !== user.tenant_id) {
    throw new Error("Invalid role specified.");
  }

  // Update Custom Claims
  const newClaims = await buildUserClaims(user.tenant_id, roleId);
  await admin.auth().setCustomUserClaims(user.firebase_uid, newClaims);

  // Update Firestore user document
  await userRef.update({
    role_id: roleId,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await logUserActivity(user.tenant_id, "USER_ROLE_UPDATED", {
    user_id: userId,
    new_role_id: roleId,
  });

  return { success: true, userId, roleId };
};

/**
 * 4. getUsersByBranch(tenantId, branchId): filtered user list
 * @param {string} tenantId
 * @param {string} branchId
 * @returns {Promise<Array>}
 */
export const getUsersByBranch = async (tenantId, branchId) => {
  const db = admin.firestore();
  const snapshot = await db
    .collection("tenant_users")
    .where("tenant_id", "==", tenantId)
    .where("branch_id", "==", branchId)
    .get();

  const users = [];
  snapshot.forEach((doc) => users.push(doc.data()));
  return users;
};

/**
 * 5. deactivateUser(userId): set status=inactive, revoke Firebase sessions
 * @param {string} userId
 * @returns {Promise<void>}
 */
export const deactivateUser = async (userId) => {
  const db = admin.firestore();
  const userRef = db.collection("tenant_users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) throw new Error("User not found.");
  const user = userDoc.data();

  // Update status in Firestore
  await userRef.update({
    status: "inactive",
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Revoke all Firebase Auth sessions (forces re-authentication which checks disabled status)
  await admin.auth().revokeRefreshTokens(user.firebase_uid);

  // Optionally, you can also disable the auth user
  // await admin.auth().updateUser(user.firebase_uid, { disabled: true });

  await logUserActivity(user.tenant_id, "USER_DEACTIVATED", {
    user_id: userId,
    email: user.email,
  });
};

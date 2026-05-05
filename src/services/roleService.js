import admin from "firebase-admin";
import Joi from "joi";

/**
 * Helper to log system activities.
 * @param {string} tenantId
 * @param {string} action
 * @param {object} details
 */
const logRoleActivity = async (tenantId, action, details) => {
  const db = admin.firestore();
  await db.collection("system_logs").add({
    tenant_id: tenantId,
    module: "RBAC",
    action,
    details,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
};

const roleSchema = Joi.object({
  name: Joi.string().required(),
  is_default: Joi.boolean().default(false),
  is_system: Joi.boolean().default(false),
});

// A comprehensive module schema covering the requested bounds
const permissionsSchema = Joi.object({
  asset_register: Joi.object({
    view: Joi.boolean(),
    create: Joi.boolean(),
    edit: Joi.boolean(),
    delete: Joi.boolean(),
    export: Joi.boolean(),
  }),
  transfers: Joi.object({
    view: Joi.boolean(),
    create: Joi.boolean(),
    approve: Joi.boolean(),
    export: Joi.boolean(),
  }),
  maintenance: Joi.object({
    view: Joi.boolean(),
    create: Joi.boolean(),
    edit: Joi.boolean(),
    close: Joi.boolean(),
    export: Joi.boolean(),
  }),
  depreciation: Joi.object({
    view: Joi.boolean(),
    run: Joi.boolean(),
    approve: Joi.boolean(),
    export: Joi.boolean(),
  }),
  audit: Joi.object({
    view: Joi.boolean(),
    create: Joi.boolean(),
    scan: Joi.boolean(),
    complete: Joi.boolean(),
    export: Joi.boolean(),
  }),
  finance: Joi.object({
    view: Joi.boolean(),
    post: Joi.boolean(),
    export: Joi.boolean(),
  }),
  reports: Joi.object({ view: Joi.boolean(), export: Joi.boolean() }),
  users: Joi.object({
    view: Joi.boolean(),
    create: Joi.boolean(),
    edit: Joi.boolean(),
    delete: Joi.boolean(),
  }),
  organization: Joi.object({
    view: Joi.boolean(),
    create: Joi.boolean(),
    edit: Joi.boolean(),
    delete: Joi.boolean(),
  }),
}).unknown(true); // Allow potential future modules gracefully

/**
 * 1. createRole(tenantId, data, permissions): create role + permission matrix
 * @param {string} tenantId
 * @param {object} data - { name, is_default, is_system }
 * @param {object} permissionsMatrix - Matrix corresponding to modules
 * @returns {Promise<object>}
 */
export const createRole = async (tenantId, data, permissionsMatrix) => {
  const { error: dataError, value: roleData } = roleSchema.validate(data);
  if (dataError)
    throw new Error(`Role validation failed: ${dataError.details[0].message}`);

  const { error: permError, value: perms } =
    permissionsSchema.validate(permissionsMatrix);
  if (permError)
    throw new Error(
      `Permissions validation failed: ${permError.details[0].message}`,
    );

  const db = admin.firestore();

  // If new role is marked as default, unset previous defaults
  if (roleData.is_default) {
    const existingDefaults = await db
      .collection("tenant_roles")
      .where("tenant_id", "==", tenantId)
      .where("is_default", "==", true)
      .get();

    const batch = db.batch();
    existingDefaults.forEach((doc) => {
      batch.update(doc.ref, { is_default: false });
    });
    if (!existingDefaults.empty) await batch.commit();
  }

  const roleRef = db.collection("tenant_roles").doc();
  const roleDocData = {
    id: roleRef.id,
    tenant_id: tenantId,
    name: roleData.name,
    is_default: roleData.is_default,
    is_system: roleData.is_system,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  const permRef = db.collection("role_permissions").doc(roleRef.id);
  const permDocData = {
    role_id: roleRef.id,
    tenant_id: tenantId,
    modules: perms,
  };

  const writeBatch = db.batch();
  writeBatch.set(roleRef, roleDocData);
  writeBatch.set(permRef, permDocData);
  await writeBatch.commit();

  await logRoleActivity(tenantId, "ROLE_CREATED", {
    role_id: roleRef.id,
    name: roleData.name,
  });

  return { ...roleDocData, permissions: perms };
};

/**
 * 2. updatePermissions(roleId, permissionsMatrix): update all permission fields
 * @param {string} roleId
 * @param {object} permissionsMatrix
 * @returns {Promise<object>}
 */
export const updatePermissions = async (roleId, permissionsMatrix) => {
  const { error, value: perms } = permissionsSchema.validate(permissionsMatrix);
  if (error)
    throw new Error(
      `Permissions validation failed: ${error.details[0].message}`,
    );

  const db = admin.firestore();
  const roleRef = db.collection("tenant_roles").doc(roleId);
  const roleDoc = await roleRef.get();

  if (!roleDoc.exists) throw new Error("Role not found.");
  const tenantId = roleDoc.data().tenant_id;

  const permRef = db.collection("role_permissions").doc(roleId);
  await permRef.set(
    {
      role_id: roleId,
      tenant_id: tenantId,
      modules: perms,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await logRoleActivity(tenantId, "PERMISSIONS_UPDATED", { role_id: roleId });

  return { success: true, role_id: roleId, modules: perms };
};

/**
 * 3. getPermissionMatrix(roleId): return full matrix
 * @param {string} roleId
 * @returns {Promise<object>}
 */
export const getPermissionMatrix = async (roleId) => {
  const db = admin.firestore();

  const roleDoc = await db.collection("tenant_roles").doc(roleId).get();
  if (!roleDoc.exists) throw new Error("Role not found.");

  const permDoc = await db.collection("role_permissions").doc(roleId).get();

  return {
    ...roleDoc.data(),
    permissions: permDoc.exists ? permDoc.data().modules : {},
  };
};

/**
 * 4. cloneRole(roleId, newName): duplicate role with all permissions
 * @param {string} roleId - Source role to clone
 * @param {string} newName - Clone's new name
 * @returns {Promise<object>}
 */
export const cloneRole = async (roleId, newName) => {
  const matrixData = await getPermissionMatrix(roleId);
  const tenantId = matrixData.tenant_id;

  // Cloned roles shouldn't be default or system automatically
  const roleMeta = {
    name: newName,
    is_default: false,
    is_system: false,
  };

  return createRole(tenantId, roleMeta, matrixData.permissions);
};

/**
 * 5. getRolesWithUserCount(tenantId): list roles + count of users per role
 * @param {string} tenantId
 * @returns {Promise<Array>}
 */
export const getRolesWithUserCount = async (tenantId) => {
  const db = admin.firestore();

  const rolesSnap = await db
    .collection("tenant_roles")
    .where("tenant_id", "==", tenantId)
    .get();
  const roles = [];
  rolesSnap.forEach((doc) =>
    roles.push({ id: doc.id, ...doc.data(), user_count: 0 }),
  );

  if (roles.length === 0) return [];

  // Group by role_id logic utilizing Firestore Aggregate where possible,
  // Or fallback to direct list processing for moderate volumes.
  // In pure Firestore, we might have to count by each role individually or read the full user set and aggregate.

  const usersSnap = await db
    .collection("tenant_users")
    .where("tenant_id", "==", tenantId)
    .where("status", "in", ["active", "inactive", "suspended"]) // Exclude fully deleted if using logical deletion
    .get();

  const counts = {};
  usersSnap.forEach((userDoc) => {
    const roleId = userDoc.data().role_id;
    if (roleId) {
      if (!counts[roleId]) counts[roleId] = 0;
      counts[roleId]++;
    }
  });

  return roles.map((role) => ({
    ...role,
    user_count: counts[role.id] || 0,
  }));
};

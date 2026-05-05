import admin from "firebase-admin";
import Joi from "joi";
import { checkPlanLimit } from "./subscriptionService.js";

const branchSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  country: Joi.string().optional(),
  manager_user_id: Joi.string().optional().allow(null),
  status: Joi.string().valid("active", "inactive").default("active"),
});

const departmentSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  cost_center_code: Joi.string().optional().allow(null),
  head_user_id: Joi.string().optional().allow(null),
  status: Joi.string().valid("active", "inactive").default("active"),
});

const locationSchema = Joi.object({
  branch_id: Joi.string().required(),
  dept_id: Joi.string().optional().allow(null),
  type: Joi.string().valid("building", "floor", "room").required(),
  parent_location_id: Joi.string().optional().allow(null),
  name: Joi.string().required(),
  code: Joi.string().required(),
  description: Joi.string().optional().allow(""),
});

/**
 * Log Org Structure Activity
 */
const logOrgActivity = async (tenantId, action, details) => {
  const db = admin.firestore();
  await db.collection("system_logs").add({
    tenant_id: tenantId,
    module: "ORG_STRUCTURE",
    action,
    details,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * 1. createBranch(tenantId, data): validate unique code, create branch, check branch limit
 */
export const createBranch = async (tenantId, data) => {
  const { error, value } = branchSchema.validate(data);
  if (error)
    throw new Error(`Branch validation failed: ${error.details[0].message}`);

  // Check branch limits
  await checkPlanLimit(tenantId, "max_branches");

  const db = admin.firestore();

  // Validate unique code within tenant
  const codeSnap = await db
    .collection("branches")
    .where("tenant_id", "==", tenantId)
    .where("code", "==", value.code)
    .limit(1)
    .get();

  if (!codeSnap.empty)
    throw new Error("Branch code must be unique within the organization.");

  const branchRef = db.collection("branches").doc();
  const branchData = {
    id: branchRef.id,
    tenant_id: tenantId,
    ...value,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await branchRef.set(branchData);
  await logOrgActivity(tenantId, "BRANCH_CREATED", {
    branch_id: branchRef.id,
    code: value.code,
  });

  return branchData;
};

/**
 * Update Branch
 */
export const updateBranch = async (tenantId, branchId, data) => {
  const db = admin.firestore();
  const branchRef = db.collection("branches").doc(branchId);
  const branchDoc = await branchRef.get();

  if (!branchDoc.exists || branchDoc.data().tenant_id !== tenantId) {
    throw new Error("Branch not found.");
  }

  // If code is being updated, validate uniqueness
  if (data.code && data.code !== branchDoc.data().code) {
    const codeSnap = await db
      .collection("branches")
      .where("tenant_id", "==", tenantId)
      .where("code", "==", data.code)
      .limit(1)
      .get();
    if (!codeSnap.empty)
      throw new Error("Branch code must be unique within the organization.");
  }

  await branchRef.update({
    ...data,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await logOrgActivity(tenantId, "BRANCH_UPDATED", { branch_id: branchId });

  return { success: true, id: branchId };
};

/**
 * Delete Branch validation
 */
export const deleteBranch = async (tenantId, branchId) => {
  const db = admin.firestore();
  const branchRef = db.collection("branches").doc(branchId);
  const branchDoc = await branchRef.get();

  if (!branchDoc.exists || branchDoc.data().tenant_id !== tenantId) {
    throw new Error("Branch not found.");
  }

  // Deleting branch not allowed if assets or users assigned
  const [usersSnap, assetsSnap, deptsSnap] = await Promise.all([
    db
      .collection("tenant_users")
      .where("branch_id", "==", branchId)
      .limit(1)
      .get(),
    db.collection("assets").where("branch_id", "==", branchId).limit(1).get(),
    db
      .collection("departments")
      .where("branch_id", "==", branchId)
      .limit(1)
      .get(),
  ]);

  if (!usersSnap.empty)
    throw new Error(
      "Cannot delete branch: Users are currently assigned to it.",
    );
  if (!assetsSnap.empty)
    throw new Error(
      "Cannot delete branch: Assets are currently assigned to it.",
    );
  if (!deptsSnap.empty)
    throw new Error(
      "Cannot delete branch: Departments are currently assigned to it.",
    );

  await branchRef.delete();
  await logOrgActivity(tenantId, "BRANCH_DELETED", { branch_id: branchId });

  return { success: true, message: "Branch deleted successfully." };
};

export const getBranches = async (tenantId) => {
  const db = admin.firestore();
  const branchSnap = await db
    .collection("branches")
    .where("tenant_id", "==", tenantId)
    .get();
  return branchSnap.docs.map((doc) => doc.data());
};

export const getBranchById = async (tenantId, branchId) => {
  const db = admin.firestore();
  const branchDoc = await db.collection("branches").doc(branchId).get();
  if (!branchDoc.exists || branchDoc.data().tenant_id !== tenantId)
    throw new Error("Branch not found");
  return branchDoc.data();
};

/**
 * 2. createDepartment: validate branch exists and belongs to tenant
 */
export const createDepartment = async (tenantId, branchId, data) => {
  const { error, value } = departmentSchema.validate(data);
  if (error)
    throw new Error(
      `Department validation failed: ${error.details[0].message}`,
    );

  const db = admin.firestore();

  // Validate branch exists and belongs to tenant
  const branchDoc = await db.collection("branches").doc(branchId).get();
  if (!branchDoc.exists || branchDoc.data().tenant_id !== tenantId) {
    throw new Error("Invalid branch specified.");
  }

  // Validate unique department code per tenant
  const codeSnap = await db
    .collection("departments")
    .where("tenant_id", "==", tenantId)
    .where("code", "==", value.code)
    .limit(1)
    .get();

  if (!codeSnap.empty)
    throw new Error("Department code must be unique within the organization.");

  const deptRef = db.collection("departments").doc();
  const deptData = {
    id: deptRef.id,
    tenant_id: tenantId,
    branch_id: branchId,
    ...value,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await deptRef.set(deptData);
  await logOrgActivity(tenantId, "DEPARTMENT_CREATED", {
    dept_id: deptRef.id,
    branch_id: branchId,
  });

  return deptData;
};

export const getDepartmentsByBranch = async (tenantId, branchId) => {
  const db = admin.firestore();
  const snap = await db
    .collection("departments")
    .where("tenant_id", "==", tenantId)
    .where("branch_id", "==", branchId)
    .get();

  return snap.docs.map((doc) => doc.data());
};

/**
 * 3. createLocation(tenantId, data): validate parent_location_id if provided, build breadcrumb path
 */
export const createLocation = async (tenantId, data) => {
  const { error, value } = locationSchema.validate(data);
  if (error)
    throw new Error(`Location validation failed: ${error.details[0].message}`);

  const db = admin.firestore();

  let breadcrumb_path = value.name;

  // Verify branch
  const branchDoc = await db.collection("branches").doc(value.branch_id).get();
  if (!branchDoc.exists || branchDoc.data().tenant_id !== tenantId) {
    throw new Error("Invalid branch specified.");
  }

  if (value.parent_location_id) {
    const parentDoc = await db
      .collection("locations")
      .doc(value.parent_location_id)
      .get();
    if (!parentDoc.exists || parentDoc.data().tenant_id !== tenantId) {
      throw new Error("Invalid parent location specified.");
    }
    const parentData = parentDoc.data();
    if (parentData.branch_id !== value.branch_id) {
      throw new Error("Parent location must belong to the same branch.");
    }

    breadcrumb_path = `${parentData.breadcrumb_path} > ${value.name}`;
  }

  const locRef = db.collection("locations").doc();
  const locData = {
    id: locRef.id,
    tenant_id: tenantId,
    ...value,
    breadcrumb_path,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await locRef.set(locData);
  await logOrgActivity(tenantId, "LOCATION_CREATED", {
    location_id: locRef.id,
  });

  return locData;
};

/**
 * 4. getLocationHierarchy(tenantId, branchId): return nested tree structure
 */
export const getLocationHierarchy = async (tenantId, branchId) => {
  const db = admin.firestore();
  const locationsSnap = await db
    .collection("locations")
    .where("tenant_id", "==", tenantId)
    .where("branch_id", "==", branchId)
    .get();

  const locations = locationsSnap.docs.map((doc) => doc.data());

  // Build tree
  const locMap = new Map(
    locations.map((loc) => [loc.id, { ...loc, children: [] }]),
  );
  const roots = [];

  for (const loc of locMap.values()) {
    if (loc.parent_location_id && locMap.has(loc.parent_location_id)) {
      locMap.get(loc.parent_location_id).children.push(loc);
    } else {
      roots.push(loc);
    }
  }

  return roots;
};

/**
 * 5. getBranchStats(branchId): count assets, users, departments assigned to this branch
 */
export const getBranchStats = async (tenantId, branchId) => {
  const db = admin.firestore();

  const [assetsSnap, usersSnap, deptsSnap] = await Promise.all([
    db
      .collection("assets")
      .where("tenant_id", "==", tenantId)
      .where("branch_id", "==", branchId)
      .count()
      .get(),
    db
      .collection("tenant_users")
      .where("tenant_id", "==", tenantId)
      .where("branch_id", "==", branchId)
      .count()
      .get(),
    db
      .collection("departments")
      .where("tenant_id", "==", tenantId)
      .where("branch_id", "==", branchId)
      .count()
      .get(),
  ]);

  return {
    assets_count: assetsSnap.data().count,
    users_count: usersSnap.data().count,
    departments_count: deptsSnap.data().count,
  };
};

/**
 * Full org structure as tree for dashboard display
 */
export const getOrgOverviewTree = async (tenantId) => {
  const db = admin.firestore();

  const [branchesSnap, deptsSnap, locsSnap] = await Promise.all([
    db.collection("branches").where("tenant_id", "==", tenantId).get(),
    db.collection("departments").where("tenant_id", "==", tenantId).get(),
    db.collection("locations").where("tenant_id", "==", tenantId).get(),
  ]);

  const branches = branchesSnap.docs.map((doc) => ({
    ...doc.data(),
    type: "branch",
    departments: [],
    locations: [],
  }));
  const depts = deptsSnap.docs.map((doc) => ({
    ...doc.data(),
    type: "department",
  }));
  const locs = locsSnap.docs.map((doc) => ({
    ...doc.data(),
    type: "location",
  }));

  // Build location tree per branch
  const locMap = new Map(locs.map((loc) => [loc.id, { ...loc, children: [] }]));
  const branchLocs = {}; // branch_id -> array of root locations

  for (const loc of locMap.values()) {
    if (loc.parent_location_id && locMap.has(loc.parent_location_id)) {
      locMap.get(loc.parent_location_id).children.push(loc);
    } else {
      if (!branchLocs[loc.branch_id]) branchLocs[loc.branch_id] = [];
      branchLocs[loc.branch_id].push(loc);
    }
  }

  // Assign depts and locations to branches
  const tree = branches.map((branch) => {
    branch.departments = depts.filter((d) => d.branch_id === branch.id);
    branch.locations = branchLocs[branch.id] || [];
    return branch;
  });

  return tree;
};

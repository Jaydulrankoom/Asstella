import admin from "firebase-admin";
import Joi from "joi";
import crypto from "crypto";
import { checkPlanLimit } from "./subscriptionService.js";

const categorySchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().max(10).required(),
  parent_category_id: Joi.string().allow(null).optional(),
  depreciation_method: Joi.string()
    .valid("straight_line", "reducing_balance", "units_of_production")
    .optional(),
  useful_life_years: Joi.number().integer().min(1).optional(),
  residual_value_percent: Joi.number().min(0).max(100).optional(),
  description: Joi.string().allow("").optional(),
});

const assetSchema = Joi.object({
  asset_name: Joi.string().required(),
  category_id: Joi.string().required(),
  brand: Joi.string().allow("").optional(),
  model: Joi.string().allow("").optional(),
  serial_no: Joi.string().allow("").optional(),
  purchase_date: Joi.date().iso().required(),
  purchase_value: Joi.number().min(0).required(),
  currency: Joi.string().length(3).default("USD"),
  supplier_id: Joi.string().allow(null).optional(),
  invoice_no: Joi.string().allow("").optional(),
  invoice_url: Joi.string().uri().allow(null, "").optional(),
  branch_id: Joi.string().required(),
  dept_id: Joi.string().required(),
  location_id: Joi.string().allow(null).optional(),
  custodian_user_id: Joi.string().allow(null).optional(),
  warranty_start: Joi.date().iso().allow(null).optional(),
  warranty_end: Joi.date().iso().allow(null).optional(),
  warranty_provider: Joi.string().allow("").optional(),
  warranty_coverage_notes: Joi.string().allow("").optional(),
  depreciation_method: Joi.string()
    .valid("straight_line", "reducing_balance", "units_of_production")
    .optional(),
  useful_life_years: Joi.number().integer().min(1).optional(),
  salvage_value: Joi.number().min(0).optional(),
  barcode: Joi.string().allow("").optional(),
  condition: Joi.string()
    .valid("excellent", "good", "fair", "poor", "damaged")
    .default("good"),
  status: Joi.string()
    .valid(
      "active",
      "assigned",
      "in_transfer",
      "under_maintenance",
      "disposed",
      "archived",
    )
    .default("active"),
  image_urls: Joi.array().items(Joi.string().uri()).optional(),
  notes: Joi.string().allow("").optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

/**
 * Log asset activity
 */
const logAssetActivity = async (tenantId, action, details) => {
  const db = admin.firestore();
  await db.collection("activity_log").add({
    tenant_id: tenantId,
    module: "ASSET_REGISTER",
    action,
    details,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * Creates an Asset Category
 */
export const createCategory = async (tenantId, data) => {
  const { error, value } = categorySchema.validate(data);
  if (error)
    throw new Error(`Category validation failed: ${error.details[0].message}`);

  const db = admin.firestore();
  const categoryRef = db.collection("asset_categories").doc();
  const catData = {
    id: categoryRef.id,
    tenant_id: tenantId,
    ...value,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await categoryRef.set(catData);
  return catData;
};

export const getCategories = async (tenantId) => {
  const db = admin.firestore();
  const snapshot = await db
    .collection("asset_categories")
    .where("tenant_id", "==", tenantId)
    .get();
  return snapshot.docs.map((doc) => doc.data());
};

/**
 * 1. generateAssetCode: GET category prefix + find last sequential number + return IT-000042
 */
export const generateAssetCode = async (tenantId, categoryId) => {
  const db = admin.firestore();
  // We use a transaction or simple increment on a sequence document.
  // For simplicity and to avoid transactions locking the whole collection, we maintain a `tenant_sequences` collection
  const seqRef = db
    .collection("tenant_sequences")
    .doc(`${tenantId}_asset_seq_${categoryId}`);

  const categoryDoc = await db
    .collection("asset_categories")
    .doc(categoryId)
    .get();
  if (!categoryDoc.exists) throw new Error("Category not found.");
  const prefix = categoryDoc.data().code || "AST";

  let nextVal = 1;
  await db.runTransaction(async (t) => {
    const seqDoc = await t.get(seqRef);
    if (!seqDoc.exists) {
      t.set(seqRef, { last_value: 1 });
      nextVal = 1;
    } else {
      nextVal = seqDoc.data().last_value + 1;
      t.update(seqRef, { last_value: nextVal });
    }
  });

  // Pad the number with zeros up to 6 digits
  const paddedSequence = String(nextVal).padStart(6, "0");
  return `${prefix}-${paddedSequence}`;
};

/**
 * 2. createAsset: validate plan limit, generate code, generate QR UUID, set initial book_value, write to Firestore
 */
export const createAsset = async (tenantId, data, userId) => {
  const { error, value } = assetSchema.validate(data);
  if (error)
    throw new Error(`Asset validation failed: ${error.details[0].message}`);

  await checkPlanLimit(tenantId, "max_assets");

  const db = admin.firestore();
  const assetRef = db.collection("assets").doc();

  // If user provided a category but we need to fetch info
  const assetCode = await generateAssetCode(tenantId, value.category_id);
  const qrCode = crypto.randomUUID();

  // Inherit stuff from category if not provided? Optional.
  // We'll trust the incoming payload for depreciation basics or fetch category if missing.

  const assetData = {
    id: assetRef.id,
    tenant_id: tenantId,
    asset_code: assetCode,
    qr_code: qrCode,
    current_book_value: value.purchase_value,
    accumulated_depreciation: 0,
    created_by: userId,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_by: userId,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
    ...value,
  };

  await assetRef.set(assetData);
  await logAssetActivity(tenantId, "ASSET_CREATED", {
    asset_id: assetRef.id,
    asset_code: assetCode,
  });

  return assetData;
};

/**
 * 3. getAssets: paginated query: filter by category, branch, dept, status, condition, search
 */
export const getAssets = async (
  tenantId,
  filters = {},
  cursor = null,
  limit = 20,
) => {
  const db = admin.firestore();
  let query = db.collection("assets").where("tenant_id", "==", tenantId);

  // Apply filters
  if (filters.category_id)
    query = query.where("category_id", "==", filters.category_id);
  if (filters.branch_id)
    query = query.where("branch_id", "==", filters.branch_id);
  if (filters.dept_id) query = query.where("dept_id", "==", filters.dept_id);
  if (filters.status) query = query.where("status", "==", filters.status);
  if (filters.condition)
    query = query.where("condition", "==", filters.condition);
  if (filters.custodian_user_id)
    query = query.where("custodian_user_id", "==", filters.custodian_user_id);

  // Note: Searching by text (name/code/serial) is tricky in native Firestore without an external index like Algolia.
  // We will perform basic equality or string matches, or suggest client-side filtering if search is light.
  // For precise native prefix matching (name):
  if (filters.search) {
    // Only simple prefix search on asset_name is feasible in pure Firestore without extra arrays.
    query = query
      .where("asset_name", ">=", filters.search)
      .where("asset_name", "<=", filters.search + "\uf8ff");
  }

  // Ordering
  query = query.orderBy("asset_name", "asc").orderBy("created_at", "desc");

  if (cursor) {
    const cursorDoc = await db.collection("assets").doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  query = query.limit(limit);
  const snapshot = await query.get();

  const assets = snapshot.docs.map((doc) => doc.data());
  const nextCursor = assets.length > 0 ? assets[assets.length - 1].id : null;

  return { data: assets, nextCursor, hasMore: assets.length === limit };
};

/**
 * 4. getAssetById: full profile with category, branch, dept, location, custodian populated
 */
export const getAssetById = async (tenantId, assetId) => {
  const db = admin.firestore();
  const assetDoc = await db.collection("assets").doc(assetId).get();

  if (!assetDoc.exists || assetDoc.data().tenant_id !== tenantId) {
    throw new Error("Asset not found.");
  }

  const asset = assetDoc.data();

  // Populate references
  const [category, branch, dept, location, custodian] = await Promise.all([
    asset.category_id
      ? db.collection("asset_categories").doc(asset.category_id).get()
      : null,
    asset.branch_id
      ? db.collection("branches").doc(asset.branch_id).get()
      : null,
    asset.dept_id
      ? db.collection("departments").doc(asset.dept_id).get()
      : null,
    asset.location_id
      ? db.collection("locations").doc(asset.location_id).get()
      : null,
    asset.custodian_user_id
      ? db.collection("tenant_users").doc(asset.custodian_user_id).get()
      : null,
  ]);

  return {
    ...asset,
    category: category?.exists ? category.data() : null,
    branch: branch?.exists ? branch.data() : null,
    department: dept?.exists ? dept.data() : null,
    location: location?.exists ? location.data() : null,
    custodian: custodian?.exists ? custodian.data() : null,
  };
};

/**
 * 5. updateAsset: update + log old/new values
 */
export const updateAsset = async (tenantId, assetId, data, userId) => {
  const db = admin.firestore();
  const assetRef = db.collection("assets").doc(assetId);
  const assetDoc = await assetRef.get();

  if (!assetDoc.exists || assetDoc.data().tenant_id !== tenantId) {
    throw new Error("Asset not found.");
  }

  const oldData = assetDoc.data();

  // Filter keys being updated so we only log diff
  const changes = {};
  for (const key of Object.keys(data)) {
    if (data[key] !== oldData[key]) {
      changes[key] = { old: oldData[key], new: data[key] };
    }
  }

  await assetRef.update({
    ...data,
    updated_by: userId,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await logAssetActivity(tenantId, "ASSET_UPDATED", {
    asset_id: assetId,
    changes,
    updated_by: userId,
  });

  return { success: true, id: assetId };
};

/**
 * Soft Delete Asset
 */
export const deleteAsset = async (tenantId, assetId, userId) => {
  const db = admin.firestore();
  const assetRef = db.collection("assets").doc(assetId);
  const assetDoc = await assetRef.get();

  if (!assetDoc.exists || assetDoc.data().tenant_id !== tenantId) {
    throw new Error("Asset not found.");
  }

  await assetRef.update({
    status: "archived", // softer delete
    updated_by: userId,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await logAssetActivity(tenantId, "ASSET_DELETED_SOFT", {
    asset_id: assetId,
    deleted_by: userId,
  });
  return { success: true, message: "Asset archived successfully." };
};

/**
 * 6. scanAsset: find by qr_code field → return asset + current assignment + maintenance_count + warranty_status
 */
export const scanAsset = async (tenantId, qrCode) => {
  const db = admin.firestore();
  const snapshot = await db
    .collection("assets")
    .where("tenant_id", "==", tenantId)
    .where("qr_code", "==", qrCode)
    .limit(1)
    .get();

  if (snapshot.empty) throw new Error("Asset not found for this QR code.");
  const asset = snapshot.docs[0].data();

  // Additional lookups for scan
  const [custodianSnap, maintenanceSnap] = await Promise.all([
    asset.custodian_user_id
      ? db.collection("tenant_users").doc(asset.custodian_user_id).get()
      : null,
    db
      .collection("maintenance_tickets")
      .where("asset_id", "==", asset.id)
      .count()
      .get(),
  ]);

  const warrantyStatus = asset.warranty_end
    ? new Date(asset.warranty_end) > new Date()
      ? "Valid"
      : "Expired"
    : "Unknown";

  return {
    ...asset,
    custodian: custodianSnap?.exists ? custodianSnap.data() : null,
    maintenance_count: maintenanceSnap.data().count,
    warranty_status: warrantyStatus,
  };
};

/**
 * GET Asset history
 */
export const getAssetHistory = async (tenantId, assetId) => {
  const db = admin.firestore();
  // Fetch activity logs, assignments, maintenance related to this asset
  const logsSnap = await db
    .collection("activity_log")
    .where("tenant_id", "==", tenantId)
    .where("details.asset_id", "==", assetId)
    .orderBy("timestamp", "desc")
    .get();

  return logsSnap.docs.map((doc) => doc.data());
};

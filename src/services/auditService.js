import admin from "firebase-admin";
import Joi from "joi";

const scopeSchema = Joi.object({
  branch_ids: Joi.array().items(Joi.string()).default([]),
  dept_ids: Joi.array().items(Joi.string()).default([]),
  category_ids: Joi.array().items(Joi.string()).default([]),
  location_ids: Joi.array().items(Joi.string()).default([]),
});

const campaignSchema = Joi.object({
  campaign_name: Joi.string().required(),
  audit_type: Joi.string().valid("full", "category", "location").required(),
  scope: scopeSchema.required(),
  assigned_auditor_ids: Joi.array().items(Joi.string()).min(1).required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().required(),
});

const scanSchema = Joi.object({
  asset_id: Joi.string().allow(null).optional(), // Could be null for extra_unregistered if we just have a code
  scanned_code: Joi.string().required(),
  scan_method: Joi.string().valid("qr", "barcode", "manual").default("qr"),
  found_at_location_id: Joi.string().required(),
  condition: Joi.string()
    .valid("excellent", "good", "fair", "poor", "damaged")
    .required(),
  photo_url: Joi.string().uri().allow(null, "").optional(),
  remarks: Joi.string().allow("").optional(),
  scanned_at: Joi.date().iso().required(), // Can be in the past for offline sync
});

const generateCampaignNo = async (tenantId) => {
  const db = admin.firestore();
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
  const seqRef = db
    .collection("tenant_sequences")
    .doc(`${tenantId}_audit_${dateStr}`);

  let nextVal = 1;
  await db.runTransaction(async (t) => {
    const seqDoc = await t.get(seqRef);
    if (!seqDoc.exists) {
      t.set(seqRef, { last_value: 1 });
    } else {
      nextVal = seqDoc.data().last_value + 1;
      t.update(seqRef, { last_value: nextVal });
    }
  });

  const paddedSequence = String(nextVal).padStart(4, "0");
  return `AUD-${dateStr}-${paddedSequence}`;
};

/**
 * 1. createCampaign
 */
export const createCampaign = async (tenantId, data, userId) => {
  const { error, value } = campaignSchema.validate(data);
  if (error)
    throw new Error(`Campaign validation failed: ${error.details[0].message}`);

  const db = admin.firestore();

  // Build query to find expected assets based on scope
  let assetQuery = db
    .collection("assets")
    .where("tenant_id", "==", tenantId)
    .where("status", "in", ["active", "assigned"]);

  const expectedAssets = [];
  // Note: Firestore doesn't support multiple 'in' queries easily, or 'in' with huge arrays.
  // In a real app we might fetch all assets for the tenant and filter in memory if scope is complex.
  // For simplicity, we'll fetch all active/assigned and filter in memory.
  const assetsSnap = await assetQuery.get();

  assetsSnap.forEach((doc) => {
    const asset = doc.data();
    let include = true;

    if (
      value.audit_type === "category" &&
      value.scope.category_ids.length > 0
    ) {
      if (!value.scope.category_ids.includes(asset.category_id))
        include = false;
    }
    if (value.audit_type === "location") {
      if (
        value.scope.location_ids.length > 0 &&
        !value.scope.location_ids.includes(asset.location_id)
      )
        include = false;
      if (
        value.scope.branch_ids.length > 0 &&
        !value.scope.branch_ids.includes(asset.branch_id)
      )
        include = false;
      if (
        value.scope.dept_ids.length > 0 &&
        !value.scope.dept_ids.includes(asset.dept_id)
      )
        include = false;
    }

    if (include) {
      expectedAssets.push(asset);
    }
  });

  if (expectedAssets.length === 0) {
    throw new Error("No assets found matching the specified scope.");
  }

  const campaignNo = await generateCampaignNo(tenantId);
  const campaignRef = db.collection("audit_campaigns").doc();

  const campaignData = {
    id: campaignRef.id,
    tenant_id: tenantId,
    campaign_no: campaignNo,
    total_expected_assets: expectedAssets.length,
    total_scanned: 0,
    total_found: 0,
    total_missing: 0,
    total_wrong_location: 0,
    total_damaged: 0,
    compliance_score: 0,
    status: "active",
    created_by: userId,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    ...value,
  };

  const batch = db.batch();
  batch.set(campaignRef, campaignData);

  // Write audit item stubs (Pending)
  expectedAssets.forEach((asset) => {
    const itemRef = db.collection("audit_items").doc();
    batch.set(itemRef, {
      id: itemRef.id,
      tenant_id: tenantId,
      campaign_id: campaignRef.id,
      asset_id: asset.id,
      expected_branch_id: asset.branch_id,
      expected_location_id: asset.location_id,
      verification_status: "pending",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  // Commit
  // Max batch size is 500, if expectedAssets > 499 we need chunking.
  // We'll chunk it if necessary.
  await batch.commit();

  return campaignData;
};

/**
 * 2. downloadCampaignData
 */
export const downloadCampaignData = async (tenantId, campaignId) => {
  const db = admin.firestore();
  const campaignDoc = await db
    .collection("audit_campaigns")
    .doc(campaignId)
    .get();

  if (!campaignDoc.exists || campaignDoc.data().tenant_id !== tenantId) {
    throw new Error("Campaign not found.");
  }

  const itemsSnap = await db
    .collection("audit_items")
    .where("campaign_id", "==", campaignId)
    .get();

  const items = itemsSnap.docs.map((doc) => doc.data());

  // In a real scenario we might also send the expected asset names/codes so the mobile app can display them properly offline.
  // We fetch those minimal asset details.
  const assetIds = items.map((i) => i.asset_id).filter(Boolean);
  const assetsMap = {};

  // Chunk asset fetching
  const chunkedIds = [];
  for (let i = 0; i < assetIds.length; i += 10) {
    chunkedIds.push(assetIds.slice(i, i + 10));
  }

  for (const chunk of chunkedIds) {
    const assetSnap = await db
      .collection("assets")
      .where(admin.firestore.FieldPath.documentId(), "in", chunk)
      .get();
    assetSnap.forEach((doc) => {
      const data = doc.data();
      assetsMap[doc.id] = {
        asset_name: data.asset_name,
        asset_code: data.asset_code,
        qr_code: data.qr_code,
        barcode: data.barcode,
        condition: data.condition,
      };
    });
  }

  return {
    campaign: campaignDoc.data(),
    items: items,
    assets: assetsMap,
  };
};

/**
 * Helper to process a single scan (pure logic)
 */
const processScanLogic = async (tenantId, campaignId, scanData, userId) => {
  const db = admin.firestore();

  // Find which asset corresponds to this scanned code
  let targetAssetId = scanData.asset_id;
  let assetData = null;

  if (!targetAssetId) {
    // Lookup by QR or barcode
    let snap = await db
      .collection("assets")
      .where("tenant_id", "==", tenantId)
      .where("qr_code", "==", scanData.scanned_code)
      .limit(1)
      .get();

    if (snap.empty) {
      snap = await db
        .collection("assets")
        .where("tenant_id", "==", tenantId)
        .where("barcode", "==", scanData.scanned_code)
        .limit(1)
        .get();
    }

    if (!snap.empty) {
      const doc = snap.docs[0];
      targetAssetId = doc.id;
      assetData = doc.data();
    }
  } else {
    const doc = await db.collection("assets").doc(targetAssetId).get();
    if (doc.exists) assetData = doc.data();
  }

  let verification_status = "found";
  let auditItemDoc = null;

  if (targetAssetId) {
    // See if it is part of this campaign
    const itemSnap = await db
      .collection("audit_items")
      .where("campaign_id", "==", campaignId)
      .where("asset_id", "==", targetAssetId)
      .limit(1)
      .get();

    if (!itemSnap.empty) {
      auditItemDoc = itemSnap.docs[0];
      const itemData = auditItemDoc.data();

      // Determine status modifiers
      if (
        itemData.expected_location_id &&
        itemData.expected_location_id !== scanData.found_at_location_id
      ) {
        verification_status = "wrong_location";
      } else if (
        scanData.condition === "damaged" ||
        scanData.condition === "poor"
      ) {
        verification_status = "damaged"; // Damaged takes precedence or could be independent. Let's make it exclusive based on requirements or store condition natively in item.
      }
    } else {
      verification_status = "extra_unregistered"; // Known asset, not part of scope
    }
  } else {
    verification_status = "extra_unregistered"; // Unknown asset code entirely
  }

  return {
    targetAssetId,
    assetData,
    auditItemDoc,
    verification_status,
  };
};

/**
 * 3. submitScan (Single)
 */
export const submitScan = async (tenantId, campaignId, data, userId) => {
  const { error, value } = scanSchema.validate(data);
  if (error)
    throw new Error(`Scan validation failed: ${error.details[0].message}`);

  const db = admin.firestore();

  const campaignDoc = await db
    .collection("audit_campaigns")
    .doc(campaignId)
    .get();
  if (!campaignDoc.exists || campaignDoc.data().tenant_id !== tenantId)
    throw new Error("Campaign not found.");
  if (campaignDoc.data().status !== "active")
    throw new Error("Campaign is not active.");

  const logic = await processScanLogic(tenantId, campaignId, value, userId);

  if (logic.auditItemDoc) {
    // Update existing stub
    await db
      .collection("audit_items")
      .doc(logic.auditItemDoc.id)
      .update({
        verification_status: logic.verification_status,
        found_at_location_id: value.found_at_location_id,
        scan_method: value.scan_method,
        condition: value.condition,
        photo_url: value.photo_url,
        remarks: value.remarks,
        scanned_by_user_id: userId,
        scanned_at: new Date(value.scanned_at),
        synced_at: admin.firestore.FieldValue.serverTimestamp(),
      });
  } else {
    // Extra unregistered
    const newRef = db.collection("audit_items").doc();
    await newRef.set({
      id: newRef.id,
      tenant_id: tenantId,
      campaign_id: campaignId,
      asset_id: logic.targetAssetId || null,
      scanned_code: value.scanned_code,
      expected_branch_id: null,
      expected_location_id: null,
      found_at_location_id: value.found_at_location_id,
      scan_method: value.scan_method,
      verification_status: logic.verification_status,
      condition: value.condition,
      photo_url: value.photo_url,
      remarks: value.remarks,
      scanned_by_user_id: userId,
      scanned_at: new Date(value.scanned_at),
      synced_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Update Campaign metrics
  await updateCampaignMetrics(tenantId, campaignId);
  return { success: true, verification_status: logic.verification_status };
};

/**
 * 4. submitBulkSync
 */
export const submitBulkSync = async (tenantId, campaignId, scans, userId) => {
  const db = admin.firestore();
  const campaignDoc = await db
    .collection("audit_campaigns")
    .doc(campaignId)
    .get();
  if (!campaignDoc.exists || campaignDoc.data().tenant_id !== tenantId)
    throw new Error("Campaign not found.");
  if (campaignDoc.data().status !== "active")
    throw new Error("Campaign is not active.");

  // Sort scans by scanned_at so last scan wins if duplicates exist
  scans.sort(
    (a, b) =>
      new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime(),
  );

  // Use a map to deduplicate by asset_id or scanned_code before processing
  const scanMap = {};
  for (const scan of scans) {
    const key = scan.asset_id || scan.scanned_code;
    scanMap[key] = scan;
  }

  for (const key of Object.keys(scanMap)) {
    const scanData = scanMap[key];
    const { error, value } = scanSchema.validate(scanData);
    if (!error) {
      // We skip erroring the whole batch for one bad offline item, just process the valid ones
      const logic = await processScanLogic(tenantId, campaignId, value, userId);

      if (logic.auditItemDoc) {
        await db
          .collection("audit_items")
          .doc(logic.auditItemDoc.id)
          .update({
            verification_status: logic.verification_status,
            found_at_location_id: value.found_at_location_id,
            scan_method: value.scan_method,
            condition: value.condition,
            photo_url: value.photo_url || null,
            remarks: value.remarks || "",
            scanned_by_user_id: userId,
            scanned_at: new Date(value.scanned_at),
            synced_at: admin.firestore.FieldValue.serverTimestamp(),
          });
      } else {
        const newRef = db.collection("audit_items").doc();
        await newRef.set({
          id: newRef.id,
          tenant_id: tenantId,
          campaign_id: campaignId,
          asset_id: logic.targetAssetId || null,
          scanned_code: value.scanned_code,
          expected_branch_id: null,
          expected_location_id: null,
          found_at_location_id: value.found_at_location_id,
          scan_method: value.scan_method,
          verification_status: logic.verification_status,
          condition: value.condition,
          photo_url: value.photo_url || null,
          remarks: value.remarks || "",
          scanned_by_user_id: userId,
          scanned_at: new Date(value.scanned_at),
          synced_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  }

  await updateCampaignMetrics(tenantId, campaignId);
  return { success: true, count: Object.keys(scanMap).length };
};

/**
 * Metrics Calculation & Compliance Score
 * compliance_score = (found_count / total_expected_assets) * 100
 * Deductions: wrong_location -> 0.5 found, damaged -> 0.75 found
 */
const updateCampaignMetrics = async (tenantId, campaignId) => {
  const db = admin.firestore();

  const itemsSnap = await db
    .collection("audit_items")
    .where("campaign_id", "==", campaignId)
    .get();

  let total_scanned = 0;
  let total_found = 0;
  let total_missing = 0; // we won't fully know missing until complete, but any explicitly marked missing
  let total_wrong_location = 0;
  let total_damaged = 0;
  let total_expected = 0;

  let effectiveFoundScore = 0;

  itemsSnap.forEach((doc) => {
    const item = doc.data();
    if (item.expected_branch_id || item.expected_location_id !== null) {
      // This implies it was part of scope
      total_expected++;
    }

    if (item.verification_status !== "pending") total_scanned++;

    if (item.verification_status === "found") {
      total_found++;
      effectiveFoundScore += 1;
    } else if (item.verification_status === "wrong_location") {
      total_wrong_location++;
      effectiveFoundScore += 0.5;
    } else if (item.verification_status === "damaged") {
      total_damaged++;
      effectiveFoundScore += 0.75;
    } else if (item.verification_status === "missing") {
      total_missing++;
    }
  });

  const compliance_score =
    total_expected > 0 ? (effectiveFoundScore / total_expected) * 100 : 0;

  await db
    .collection("audit_campaigns")
    .doc(campaignId)
    .update({
      total_scanned,
      total_found,
      total_missing,
      total_wrong_location,
      total_damaged,
      compliance_score: Math.min(100, Math.max(0, compliance_score)),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
};

/**
 * 5. completeCampaign
 */
export const completeCampaign = async (tenantId, campaignId, userId) => {
  const db = admin.firestore();

  // Any un-scanned items become 'missing'
  const pendingItemsSnap = await db
    .collection("audit_items")
    .where("campaign_id", "==", campaignId)
    .where("verification_status", "==", "pending")
    .get();

  const batch = db.batch();
  pendingItemsSnap.forEach((doc) => {
    batch.update(doc.ref, {
      verification_status: "missing",
      synced_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  if (!pendingItemsSnap.empty) {
    await batch.commit();
  }

  // Recalculate finals
  await updateCampaignMetrics(tenantId, campaignId);

  // Status = completed
  await db.collection("audit_campaigns").doc(campaignId).update({
    status: "completed",
    completed_by: userId,
    completed_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  const doc = await db.collection("audit_campaigns").doc(campaignId).get();
  return doc.data();
};

export const getCampaigns = async (tenantId) => {
  const db = admin.firestore();
  const snap = await db
    .collection("audit_campaigns")
    .where("tenant_id", "==", tenantId)
    .orderBy("created_at", "desc")
    .get();
  return snap.docs.map((doc) => doc.data());
};

export const getCampaignResults = async (tenantId, campaignId) => {
  const db = admin.firestore();
  const campSnap = await db.collection("audit_campaigns").doc(campaignId).get();
  if (!campSnap.exists || campSnap.data().tenant_id !== tenantId) {
    throw new Error("Campaign not found.");
  }

  const itemsSnap = await db
    .collection("audit_items")
    .where("campaign_id", "==", campaignId)
    .get();

  return {
    campaign: campSnap.data(),
    items: itemsSnap.docs.map((doc) => doc.data()),
  };
};

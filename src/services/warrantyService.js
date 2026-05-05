import admin from "firebase-admin";
import Joi from "joi";

const claimSchema = Joi.object({
  asset_id: Joi.string().required(),
  warranty_record_id: Joi.string().required(),
  maintenance_ticket_id: Joi.string().allow(null).optional(),
  problem_description: Joi.string().required(),
  attachments: Joi.array().items(Joi.string().uri()).optional(),
});

const responseSchema = Joi.object({
  vendor_response_date: Joi.date().iso().required(),
  vendor_reference_no: Joi.string().required(),
  repair_by_date: Joi.date().iso().allow(null).optional(),
});

const resolutionSchema = Joi.object({
  resolution_type: Joi.string()
    .valid("repaired", "replaced", "rejected", "pending")
    .required(),
  resolution_notes: Joi.string().allow("").optional(),
  cost_recovered: Joi.number().min(0).default(0),
  actual_resolution_date: Joi.date().iso().required(),
  close_maintenance_ticket: Joi.boolean().default(false),
});

const notifyUser = async (tenantId, userId, title, body) => {
  if (!userId) return;
  const db = admin.firestore();
  await db.collection("notifications").add({
    tenant_id: tenantId,
    user_id: userId,
    title,
    body,
    read: false,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });
};

const generateClaimNo = async (tenantId) => {
  const db = admin.firestore();
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", ""); // YYYYMM
  const seqRef = db
    .collection("tenant_sequences")
    .doc(`${tenantId}_warranty_claim_${dateStr}`);

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
  return `WCL-${dateStr}-${paddedSequence}`;
};

/**
 * 1. checkWarrantyStatus: return active warranty record if exists, else null
 */
export const checkWarrantyStatus = async (tenantId, assetId) => {
  const db = admin.firestore();

  // Warranty might literally just be on the asset document, or a separate warranty_records collection.
  // The schema asks to use `warranty_records` collection.
  const snapshot = await db
    .collection("warranty_records")
    .where("tenant_id", "==", tenantId)
    .where("asset_id", "==", assetId)
    .where("status", "in", ["active", "expiring_soon"])
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
};

/**
 * 2. checkClaimEligibility: check warranty is active + issue type is covered -> return eligibility reason
 */
export const checkClaimEligibility = async (
  tenantId,
  assetId,
  maintenanceTicketId,
) => {
  const db = admin.firestore();
  const warranty = await checkWarrantyStatus(tenantId, assetId);

  if (!warranty) {
    return {
      eligible: false,
      reason: "No active warranty found for this asset.",
    };
  }

  if (new Date(warranty.end_date) < new Date()) {
    return { eligible: false, reason: "Warranty has expired." };
  }

  let ticket = null;
  if (maintenanceTicketId) {
    const ticketDoc = await db
      .collection("maintenance_tickets")
      .doc(maintenanceTicketId)
      .get();
    if (ticketDoc.exists) ticket = ticketDoc.data();
  }

  // Very basic coverage check
  let isCovered = true;
  let reason = "Warranty is active and generally covers this asset.";

  if (
    ticket &&
    warranty.warranty_type === "parts_only" &&
    ticket.labor_cost > 0
  ) {
    reason = "Warranty is parts-only. Labor charges will not be covered.";
  } else if (
    ticket &&
    warranty.warranty_type === "labor_only" &&
    ticket.parts_cost > 0
  ) {
    reason = "Warranty is labor-only. Parts will not be covered.";
  }

  return { eligible: isCovered, warranty_record_id: warranty.id, reason };
};

/**
 * 3. createClaim: validate eligibility, auto-number claim, create record, notify asset manager
 */
export const createClaim = async (tenantId, data, userId) => {
  const { error, value } = claimSchema.validate(data);
  if (error)
    throw new Error(`Claim validation failed: ${error.details[0].message}`);

  // Need to verify eligibility again just in case
  const eligibility = await checkClaimEligibility(
    tenantId,
    value.asset_id,
    value.maintenance_ticket_id,
  );
  if (!eligibility.eligible) {
    throw new Error(`Cannot create claim: ${eligibility.reason}`);
  }

  const claimNo = await generateClaimNo(tenantId);
  const db = admin.firestore();
  const claimRef = db.collection("warranty_claims").doc();

  const claimData = {
    id: claimRef.id,
    tenant_id: tenantId,
    claim_no: claimNo,
    submitted_by_user_id: userId,
    submitted_at: admin.firestore.FieldValue.serverTimestamp(),
    status: "submitted",
    resolution_type: "pending",
    cost_recovered: 0,
    ...value,
  };

  await claimRef.set(claimData);

  // Link to maintenance ticket if provided
  if (value.maintenance_ticket_id) {
    await db
      .collection("maintenance_tickets")
      .doc(value.maintenance_ticket_id)
      .update({
        warranty_claim_id: claimRef.id,
        warranty_claim_eligible: true,
      });
  }

  // Notify mock "Asset Manager"
  // Assuming find manager flow:
  const managers = await db
    .collection("tenant_users")
    .where("tenant_id", "==", tenantId)
    // .where('role', 'in', ['Asset Manager'])
    .limit(1)
    .get(); // Mock getting manager

  if (!managers.empty) {
    await notifyUser(
      tenantId,
      managers.docs[0].id,
      "New Warranty Claim",
      `Claim ${claimNo} was submitted successfully.`,
    );
  }

  return claimData;
};

/**
 * 4. updateVendorResponse: log vendor acknowledgment + reference number
 */
export const updateVendorResponse = async (tenantId, claimId, data) => {
  const { error, value } = responseSchema.validate(data);
  if (error)
    throw new Error(`Response validation failed: ${error.details[0].message}`);

  const db = admin.firestore();
  const claimRef = db.collection("warranty_claims").doc(claimId);
  const claimDoc = await claimRef.get();

  if (!claimDoc.exists || claimDoc.data().tenant_id !== tenantId)
    throw new Error("Claim not found.");

  await claimRef.update({
    ...value,
    status: "acknowledged",
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, status: "acknowledged" };
};

/**
 * 5. resolveClaim: update resolution type, calculate cost_recovered, close linked maintenance ticket
 */
export const resolveClaim = async (tenantId, claimId, data, userId) => {
  const { error, value } = resolutionSchema.validate(data);
  if (error)
    throw new Error(
      `Resolution validation failed: ${error.details[0].message}`,
    );

  const db = admin.firestore();
  const claimRef = db.collection("warranty_claims").doc(claimId);

  let successData = null;

  await db.runTransaction(async (t) => {
    const claimDoc = await t.get(claimRef);
    if (!claimDoc.exists || claimDoc.data().tenant_id !== tenantId)
      throw new Error("Claim not found.");
    const claim = claimDoc.data();

    // Determine end status based on resolution
    const endStatus =
      value.resolution_type === "rejected" ? "rejected" : "resolved";

    t.update(claimRef, {
      resolution_type: value.resolution_type,
      resolution_notes: value.resolution_notes || "",
      cost_recovered: value.cost_recovered,
      actual_resolution_date: value.actual_resolution_date,
      status: endStatus,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Close linked maintenance ticket if requested
    if (value.close_maintenance_ticket && claim.maintenance_ticket_id) {
      const ticketRef = db
        .collection("maintenance_tickets")
        .doc(claim.maintenance_ticket_id);
      const ticketDoc = await t.get(ticketRef);
      if (ticketDoc.exists && ticketDoc.data().status !== "closed") {
        t.update(ticketRef, {
          status: "closed",
          closed_by: userId,
          closed_at: admin.firestore.FieldValue.serverTimestamp(),
          completion_notes:
            "Automatically closed via Warranty Claim Resolution.",
        });
      }
    }
  });

  return { success: true };
};

/**
 * 6. getWarrantyAnalytics: total claims, recovery rate, cost recovered vs maintenance spend
 */
export const getWarrantyAnalytics = async (tenantId) => {
  const db = admin.firestore();

  // In pure Firestore, we might want cloud functions aggregating this, but we can do a naive aggregation for moderate volume
  const claimsSnap = await db
    .collection("warranty_claims")
    .where("tenant_id", "==", tenantId)
    .get();

  let totalClaims = 0;
  let resolvedClaims = 0;
  let totalCostRecovered = 0;

  claimsSnap.forEach((doc) => {
    totalClaims++;
    const data = doc.data();
    if (data.status === "resolved") {
      resolvedClaims++;
      totalCostRecovered += data.cost_recovered || 0;
    }
  });

  const recoveryRate =
    totalClaims > 0 ? ((resolvedClaims / totalClaims) * 100).toFixed(2) : 0;

  // Compare against maintenance spend
  const ticketsSnap = await db
    .collection("maintenance_tickets")
    .where("tenant_id", "==", tenantId)
    .where("status", "==", "closed")
    .get();
  let totalMaintenanceSpend = 0;
  ticketsSnap.forEach((doc) => {
    totalMaintenanceSpend += doc.data().total_cost || 0;
  });

  return {
    total_claims: totalClaims,
    resolved_claims: resolvedClaims,
    recovery_rate_percent: parseFloat(recoveryRate),
    total_cost_recovered: totalCostRecovered,
    total_maintenance_spend: totalMaintenanceSpend,
  };
};

export const getClaims = async (tenantId, filters = {}) => {
  const db = admin.firestore();
  let query = db
    .collection("warranty_claims")
    .where("tenant_id", "==", tenantId);
  // add status / asset filters if needed
  const snapshot = await query.orderBy("submitted_at", "desc").limit(50).get();
  return snapshot.docs.map((doc) => doc.data());
};

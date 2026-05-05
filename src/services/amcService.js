import admin from "firebase-admin";
import Joi from "joi";

const contractSchema = Joi.object({
  vendor_id: Joi.string().required(),
  contract_name: Joi.string().required(),
  covered_asset_ids: Joi.array().items(Joi.string()).default([]),
  category_ids: Joi.array().items(Joi.string()).default([]),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().required(),
  contract_value: Joi.number().min(0).required(),
  currency: Joi.string().length(3).default("USD"),
  sla_response_hours: Joi.number().min(0).required(),
  sla_resolution_hours: Joi.number().min(0).required(),
  visit_schedule: Joi.object({
    frequency_type: Joi.string()
      .valid("weekly", "monthly", "quarterly", "yearly", "custom")
      .required(),
    frequency_value: Joi.number().min(1).required(),
    total_visits_per_year: Joi.number().min(1).optional(),
  }).optional(),
  penalty_per_hour_breach: Joi.number().min(0).default(0),
  auto_renewal: Joi.boolean().default(false),
  renewal_notice_days: Joi.number().min(0).default(30),
  document_url: Joi.string().uri().allow(null, "").optional(),
});

const visitSchema = Joi.object({
  scheduled_date: Joi.date().iso().required(),
  technician_name: Joi.string().allow("").optional(),
});

const completionSchema = Joi.object({
  actual_date: Joi.date().iso().required(),
  service_description: Joi.string().required(),
  assets_serviced: Joi.array().items(Joi.string()).default([]),
  response_time_hours: Joi.number().min(0).required(),
  resolution_time_hours: Joi.number().min(0).required(),
  vendor_signature_url: Joi.string().uri().allow(null, "").optional(),
  photos: Joi.array().items(Joi.string().uri()).optional(),
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

const generateContractNo = async (tenantId) => {
  const db = admin.firestore();
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", ""); // YYYYMM
  const seqRef = db
    .collection("tenant_sequences")
    .doc(`${tenantId}_amc_${dateStr}`);

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
  return `AMC-${dateStr}-${paddedSequence}`;
};

/**
 * 1. createContract
 */
export const createContract = async (tenantId, data, userId) => {
  const { error, value } = contractSchema.validate(data);
  if (error)
    throw new Error(`Contract validation failed: ${error.details[0].message}`);

  const db = admin.firestore();

  // (Optional) Validate Vendor Exists
  // const vendorDoc = await db.collection('vendors').doc(value.vendor_id).get();
  // if (!vendorDoc.exists) throw new Error('Vendor not found.');

  // Validate Asset Ownership
  if (value.covered_asset_ids.length > 0) {
    // In a real app we might chuck this into batches of 10 if there are many.
    const chunks = [];
    for (let i = 0; i < value.covered_asset_ids.length; i += 10) {
      chunks.push(value.covered_asset_ids.slice(i, i + 10));
    }
    for (const chunk of chunks) {
      const snap = await db
        .collection("assets")
        .where("tenant_id", "==", tenantId)
        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
        .get();
      if (snap.size !== chunk.length) {
        throw new Error(
          "Some assets could not be verified or do not belong to you.",
        );
      }
    }
  }

  const contractNo = await generateContractNo(tenantId);
  const contractRef = db.collection("amc_contracts").doc();

  const startDate = new Date(value.start_date);
  const endDate = new Date(value.end_date);
  let status = "active";

  if (endDate < new Date()) status = "expired";
  else if (
    endDate < new Date(Date.now() + value.renewal_notice_days * 86400000)
  )
    status = "expiring";

  const contractData = {
    id: contractRef.id,
    tenant_id: tenantId,
    contract_no: contractNo,
    created_by: userId,
    status,
    ...value,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await contractRef.set(contractData);
  return contractData;
};

/**
 * 2. scheduleVisit
 */
export const scheduleVisit = async (tenantId, contractId, data) => {
  const { error, value } = visitSchema.validate(data);
  if (error)
    throw new Error(`Visit validation failed: ${error.details[0].message}`);

  const db = admin.firestore();
  const contractDoc = await db
    .collection("amc_contracts")
    .doc(contractId)
    .get();

  if (!contractDoc.exists || contractDoc.data().tenant_id !== tenantId) {
    throw new Error("AMC Contract not found.");
  }

  const contractData = contractDoc.data();

  // Determine visit number
  const visitsSnap = await db
    .collection("amc_visits")
    .where("contract_id", "==", contractId)
    .get();
  const visitNo = visitsSnap.size + 1;

  const visitRef = db.collection("amc_visits").doc();
  const visitData = {
    id: visitRef.id,
    tenant_id: tenantId,
    contract_id: contractId,
    visit_no: visitNo,
    scheduled_date: value.scheduled_date,
    technician_name: value.technician_name || null,
    status: "scheduled",
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await visitRef.set(visitData);

  // Notify e.g. managers
  // notifyUser(tenantId, ... )

  return visitData;
};

/**
 * 3. recordVisitCompletion
 */
export const recordVisitCompletion = async (tenantId, visitId, data) => {
  const { error, value } = completionSchema.validate(data);
  if (error)
    throw new Error(
      `Completion validation failed: ${error.details[0].message}`,
    );

  const db = admin.firestore();

  let successData = null;
  await db.runTransaction(async (t) => {
    const visitRef = db.collection("amc_visits").doc(visitId);
    const visitDoc = await t.get(visitRef);
    if (!visitDoc.exists || visitDoc.data().tenant_id !== tenantId) {
      throw new Error("Visit not found.");
    }

    const visitData = visitDoc.data();
    if (visitData.status === "completed") {
      throw new Error("Visit already completed.");
    }

    const contractRef = db
      .collection("amc_contracts")
      .doc(visitData.contract_id);
    const contractDoc = await t.get(contractRef);
    if (!contractDoc.exists) throw new Error("Contract not found.");

    const contract = contractDoc.data();

    // SLA calculations
    const responseBreach =
      value.response_time_hours > contract.sla_response_hours;
    const resolutionBreach =
      value.resolution_time_hours > contract.sla_resolution_hours;
    const slaMet = !responseBreach && !resolutionBreach;

    let penaltyApplied = false;
    let penaltyAmount = 0;

    if (!slaMet && contract.penalty_per_hour_breach > 0) {
      penaltyApplied = true;
      let extraHours = 0;
      if (responseBreach)
        extraHours += value.response_time_hours - contract.sla_response_hours;
      if (resolutionBreach)
        extraHours +=
          value.resolution_time_hours - contract.sla_resolution_hours;
      penaltyAmount = extraHours * contract.penalty_per_hour_breach;
    }

    t.update(visitRef, {
      ...value,
      sla_met: slaMet,
      penalty_applied: penaltyApplied,
      penalty_amount: penaltyAmount,
      status: "completed",
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    successData = { slaMet, penaltyAmount, status: "completed" };
  });

  return successData;
};

/**
 * 4. calculateSLACompliance
 */
export const calculateSLACompliance = async (tenantId, contractId) => {
  const db = admin.firestore();

  const visitsSnap = await db
    .collection("amc_visits")
    .where("contract_id", "==", contractId)
    .where("status", "==", "completed")
    .get();

  if (visitsSnap.empty)
    return { compliance_rate: 100, sla_met_count: 0, total_visits: 0 };

  let slaMetCount = 0;
  visitsSnap.forEach((doc) => {
    if (doc.data().sla_met) slaMetCount++;
  });

  const totalVisits = visitsSnap.size;
  const complianceRate = (slaMetCount / totalVisits) * 100;

  return {
    compliance_rate: complianceRate,
    sla_met_count: slaMetCount,
    total_visits: totalVisits,
  };
};

/**
 * 5. getVendorScorecard
 */
export const getVendorScorecard = async (tenantId, vendorId) => {
  const db = admin.firestore();

  // Get all contracts for vendor
  const contractsSnap = await db
    .collection("amc_contracts")
    .where("tenant_id", "==", tenantId)
    .where("vendor_id", "==", vendorId)
    .get();

  if (contractsSnap.empty) {
    return {
      overall_rating: 0,
      avg_compliance_rate: 0,
      total_penalties: 0,
      visit_completion_rate: 0,
    };
  }

  const contractIds = contractsSnap.docs.map((doc) => doc.id);

  // Get all visits for these contracts
  const chunkedIds = [];
  for (let i = 0; i < contractIds.length; i += 10) {
    chunkedIds.push(contractIds.slice(i, i + 10));
  }

  let totalVisits = 0;
  let completedVisits = 0;
  let slaMetCount = 0;
  let totalPenalties = 0;

  for (const chunk of chunkedIds) {
    const visitsSnap = await db
      .collection("amc_visits")
      .where("contract_id", "in", chunk)
      .get();

    visitsSnap.forEach((doc) => {
      totalVisits++;
      const data = doc.data();
      if (data.status === "completed") {
        completedVisits++;
        if (data.sla_met) slaMetCount++;
        if (data.penalty_amount) totalPenalties += data.penalty_amount;
      }
    });
  }

  const avgComplianceRate =
    completedVisits > 0 ? (slaMetCount / completedVisits) * 100 : 100;
  const visitCompletionRate =
    totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 100;

  // Mock overall rating out of 5 based on SLA and Completion
  let rating = 5;
  if (avgComplianceRate < 90) rating -= 1;
  if (avgComplianceRate < 70) rating -= 1;
  if (visitCompletionRate < 90) rating -= 1;

  return {
    overall_rating: Math.max(1, rating),
    avg_compliance_rate: avgComplianceRate,
    total_penalties: totalPenalties,
    visit_completion_rate: visitCompletionRate,
    total_contracts: contractIds.length,
  };
};

/**
 * 6. renewContract
 */
export const renewContract = async (tenantId, contractId, newEndDate) => {
  const db = admin.firestore();

  let newContractData = {};
  await db.runTransaction(async (t) => {
    const oldContractRef = db.collection("amc_contracts").doc(contractId);
    const oldDoc = await t.get(oldContractRef);
    if (!oldDoc.exists || oldDoc.data().tenant_id !== tenantId) {
      throw new Error("Contract not found.");
    }

    const oldContract = oldDoc.data();

    const newRef = db.collection("amc_contracts").doc();
    newContractData = {
      ...oldContract,
      id: newRef.id,
      start_date: oldContract.end_date, // Starts when old ends
      end_date: newEndDate,
      status: "active",
      previous_contract_id: contractId,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    t.set(newRef, newContractData);

    // Archive old contract
    t.update(oldContractRef, {
      status: "archived",
      renewed_to_contract_id: newRef.id,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  return newContractData;
};

export const getContracts = async (tenantId, filters = {}) => {
  const db = admin.firestore();
  let query = db.collection("amc_contracts").where("tenant_id", "==", tenantId);

  // Optional filters
  if (filters.status) query = query.where("status", "==", filters.status);

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data());
};

export const getVisits = async (tenantId, contractId) => {
  const db = admin.firestore();
  const snapshot = await db
    .collection("amc_visits")
    .where("tenant_id", "==", tenantId)
    .where("contract_id", "==", contractId)
    .orderBy("visit_no", "asc")
    .get();

  return snapshot.docs.map((doc) => doc.data());
};

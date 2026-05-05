import admin from "firebase-admin";
import Joi from "joi";

const ticketSchema = Joi.object({
  asset_id: Joi.string().required(),
  maintenance_type: Joi.string()
    .valid("breakdown", "preventive", "emergency")
    .required(),
  priority: Joi.string().valid("low", "medium", "high", "critical").required(),
  issue_description: Joi.string().required(),
  assigned_technician_id: Joi.string().allow(null).optional(),
  assigned_vendor_id: Joi.string().allow(null).optional(),
  asset_condition_before: Joi.string().allow("").optional(),
  before_photos: Joi.array().items(Joi.string().uri()).optional(),
});

const progressSchema = Joi.object({
  diagnosis: Joi.string().allow("").optional(),
  repair_details: Joi.string().allow("").optional(),
  parts_used: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        qty: Joi.number().min(1).required(),
        cost: Joi.number().min(0).required(),
      }),
    )
    .optional(),
  labor_cost: Joi.number().min(0).optional(),
  downtime_hours: Joi.number().min(0).optional(),
  status: Joi.string()
    .valid(
      "open",
      "assigned",
      "in_progress",
      "completed",
      "closed",
      "cancelled",
    )
    .optional(),
});

const closeSchema = Joi.object({
  completion_notes: Joi.string().required(),
  asset_condition_after: Joi.string().required(),
  after_photos: Joi.array().items(Joi.string().uri()).optional(),
});

const scheduleSchema = Joi.object({
  asset_id: Joi.string().allow(null).optional(),
  category_id: Joi.string().allow(null).optional(),
  frequency_type: Joi.string()
    .valid("weekly", "monthly", "quarterly", "yearly")
    .required(),
  frequency_value: Joi.number().integer().min(1).required(),
  next_due_date: Joi.date().iso().required(),
  assigned_to: Joi.string().allow(null).optional(),
  task_description: Joi.string().required(),
  estimated_cost: Joi.number().min(0).optional(),
  status: Joi.string().valid("active", "paused").default("active"),
}).or("asset_id", "category_id");

const generateTicketNo = async (tenantId) => {
  const db = admin.firestore();
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", ""); // YYYYMM
  const seqRef = db
    .collection("tenant_sequences")
    .doc(`${tenantId}_maintenance_${dateStr}`);

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
  return `MNT-${dateStr}-${paddedSequence}`;
};

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

/**
 * 1. createTicket
 */
export const createTicket = async (tenantId, data, userId) => {
  const { error, value } = ticketSchema.validate(data);
  if (error)
    throw new Error(`Ticket validation failed: ${error.details[0].message}`);

  const db = admin.firestore();
  const assetDoc = await db.collection("assets").doc(value.asset_id).get();

  if (!assetDoc.exists || assetDoc.data().tenant_id !== tenantId) {
    throw new Error("Asset not found.");
  }

  const asset = assetDoc.data();
  let warrantyEligible = false;

  if (asset.warranty_end) {
    const warrantyEnd = new Date(asset.warranty_end);
    if (warrantyEnd > new Date()) {
      warrantyEligible = true;
    }
  }

  const ticketNo = await generateTicketNo(tenantId);
  const ticketRef = db.collection("maintenance_tickets").doc();

  // Determine initial state based on assignments
  let status = "open";
  if (value.assigned_technician_id || value.assigned_vendor_id) {
    status = "assigned";
  }

  const ticketData = {
    id: ticketRef.id,
    tenant_id: tenantId,
    ticket_no: ticketNo,
    reported_by_user_id: userId,
    reported_at: admin.firestore.FieldValue.serverTimestamp(),
    status,
    warranty_claim_eligible: warrantyEligible,
    warranty_claim_id: null,
    parts_cost: 0,
    labor_cost: 0,
    total_cost: 0,
    ...value,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await ticketRef.set(ticketData);

  // Notify manager / technician
  // (In real scale, we lookup the maintenance manager role and notify them)
  if (value.assigned_technician_id) {
    await notifyUser(
      tenantId,
      value.assigned_technician_id,
      "New Maintenance Ticket",
      `Ticket ${ticketNo} assigned to you.`,
    );
  }

  return ticketData;
};

/**
 * 2. assignTicket
 */
export const assignTicket = async (tenantId, ticketId, assigneeData) => {
  const db = admin.firestore();
  const ticketRef = db.collection("maintenance_tickets").doc(ticketId);

  const ticketDoc = await ticketRef.get();
  if (!ticketDoc.exists || ticketDoc.data().tenant_id !== tenantId) {
    throw new Error("Ticket not found.");
  }

  await ticketRef.update({
    assigned_technician_id: assigneeData.technician_id || null,
    assigned_vendor_id: assigneeData.vendor_id || null,
    status: "assigned",
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (assigneeData.technician_id) {
    await notifyUser(
      tenantId,
      assigneeData.technician_id,
      "Ticket Assigned",
      `Ticket ${ticketDoc.data().ticket_no} has been assigned to you.`,
    );
  }

  return { success: true };
};

/**
 * 3. updateProgress
 */
export const updateProgress = async (tenantId, ticketId, data) => {
  const { error, value } = progressSchema.validate(data);
  if (error)
    throw new Error(`Progress validation failed: ${error.details[0].message}`);

  const db = admin.firestore();
  const ticketRef = db.collection("maintenance_tickets").doc(ticketId);
  const ticketDoc = await ticketRef.get();

  if (!ticketDoc.exists || ticketDoc.data().tenant_id !== tenantId) {
    throw new Error("Ticket not found.");
  }

  const existingData = ticketDoc.data();
  const parts = value.parts_used || existingData.parts_used || [];
  const partsCost = parts.reduce((sum, p) => sum + p.qty * p.cost, 0);
  const laborCost =
    value.labor_cost !== undefined
      ? value.labor_cost
      : existingData.labor_cost || 0;

  const updates = {
    ...value,
    parts_cost: partsCost,
    total_cost: partsCost + laborCost,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (!value.status && existingData.status === "assigned") {
    updates.status = "in_progress";
  }

  await ticketRef.update(updates);
  return { success: true };
};

/**
 * 4. closeTicket
 */
export const closeTicket = async (tenantId, ticketId, closingData, userId) => {
  const { error, value } = closeSchema.validate(closingData);
  if (error)
    throw new Error(`Close validation failed: ${error.details[0].message}`);

  const db = admin.firestore();
  const ticketRef = db.collection("maintenance_tickets").doc(ticketId);

  await db.runTransaction(async (t) => {
    const ticketDoc = await t.get(ticketRef);
    if (!ticketDoc.exists || ticketDoc.data().tenant_id !== tenantId) {
      throw new Error("Ticket not found.");
    }

    const tData = ticketDoc.data();
    if (["closed", "cancelled"].includes(tData.status)) {
      throw new Error("Ticket is already closed or cancelled.");
    }

    t.update(ticketRef, {
      ...value,
      status: "closed",
      closed_by: userId,
      closed_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const assetRef = db.collection("assets").doc(tData.asset_id);
    t.update(assetRef, {
      condition: value.asset_condition_after,
      status: "active", // Assuming it becomes active again after maintenance
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const logRef = db.collection("activity_log").doc();
    t.set(logRef, {
      tenant_id: tenantId,
      module: "ASSET_REGISTER",
      action: "MAINTENANCE_LOGGED",
      details: {
        asset_id: tData.asset_id,
        ticket_no: tData.ticket_no,
        total_cost: tData.total_cost,
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  const ticketData = (await ticketRef.get()).data();
  if (ticketData.reported_by_user_id) {
    await notifyUser(
      tenantId,
      ticketData.reported_by_user_id,
      "Ticket Closed",
      `Maintenance ticket ${ticketData.ticket_no} has been closed.`,
    );
  }

  return { success: true };
};

export const createSchedule = async (tenantId, data) => {
  const { error, value } = scheduleSchema.validate(data);
  if (error)
    throw new Error(`Schedule validation failed: ${error.details[0].message}`);

  const db = admin.firestore();
  const scheduleRef = db.collection("preventive_schedules").doc();

  const scheduleData = {
    id: scheduleRef.id,
    tenant_id: tenantId,
    ...value,
    last_service_date: null,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await scheduleRef.set(scheduleData);
  return scheduleData;
};

export const getTickets = async (tenantId, filters = {}) => {
  const db = admin.firestore();
  let query = db
    .collection("maintenance_tickets")
    .where("tenant_id", "==", tenantId);

  if (filters.status) query = query.where("status", "==", filters.status);
  if (filters.asset_id) query = query.where("asset_id", "==", filters.asset_id);
  if (filters.maintenance_type)
    query = query.where("maintenance_type", "==", filters.maintenance_type);

  const snapshot = await query.orderBy("created_at", "desc").limit(50).get();
  return snapshot.docs.map((doc) => doc.data());
};

export const getSchedules = async (tenantId) => {
  const db = admin.firestore();
  const snapshot = await db
    .collection("preventive_schedules")
    .where("tenant_id", "==", tenantId)
    .get();
  return snapshot.docs.map((doc) => doc.data());
};

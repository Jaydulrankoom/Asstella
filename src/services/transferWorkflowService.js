import admin from "firebase-admin";
import Joi from "joi";

const transferSchema = Joi.object({
  asset_id: Joi.string().required(),
  from_branch_id: Joi.string().required(),
  from_dept_id: Joi.string().required(),
  from_location_id: Joi.string().allow(null).optional(),
  from_custodian_id: Joi.string().allow(null).optional(),
  to_branch_id: Joi.string().required(),
  to_dept_id: Joi.string().required(),
  to_location_id: Joi.string().allow(null).optional(),
  to_custodian_id: Joi.string().allow(null).optional(),
  reason: Joi.string().required(),
});

/**
 * Mock Notification Service
 */
const notifyUser = async (tenantId, userId, title, body) => {
  const db = admin.firestore();
  await db.collection("notifications").add({
    tenant_id: tenantId,
    user_id: userId,
    title,
    body,
    read: false,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });
  // In real life, trigger FCM / Email here
};

const generateTransferNo = async (tenantId) => {
  const db = admin.firestore();
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", ""); // YYYYMM
  const seqRef = db
    .collection("tenant_sequences")
    .doc(`${tenantId}_transfer_${dateStr}`);

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
  return `TRF-${dateStr}-${paddedSequence}`;
};

/**
 * 1. createTransferRequest: validate asset is not already in_transfer, create record, notify approver
 */
export const createTransferRequest = async (tenantId, data, userId) => {
  const { error, value } = transferSchema.validate(data);
  if (error)
    throw new Error(`Transfer validation failed: ${error.details[0].message}`);

  const db = admin.firestore();

  // Validate asset state
  const assetRef = db.collection("assets").doc(value.asset_id);
  const assetDoc = await assetRef.get();

  if (!assetDoc.exists || assetDoc.data().tenant_id !== tenantId) {
    throw new Error("Asset not found.");
  }

  if (assetDoc.data().status === "in_transfer") {
    throw new Error("Asset is already in an active transfer process.");
  }

  const transferNo = await generateTransferNo(tenantId);
  const transferRef = db.collection("asset_transfers").doc();

  const transferData = {
    id: transferRef.id,
    tenant_id: tenantId,
    transfer_no: transferNo,
    requested_by: userId,
    status: "pending",
    ...value,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  const batch = db.batch();
  batch.set(transferRef, transferData);
  // Do NOT update asset status to in_transfer yet, or do we lock it now?
  // Requirements state: "approveTransfer -> mark asset as in_transfer".
  // Actually, keeping it as is until approved might allow concurrent requests, but let's lock it.
  batch.update(assetRef, { status: "in_transfer" });

  await batch.commit();

  // Notify (Mock) - in a real app, find the dept_head or asset_manager
  await notifyUser(
    tenantId,
    "APPROVER_ROLE",
    "New Transfer Request",
    `Transfer ${transferNo} requires approval.`,
  );

  return transferData;
};

/**
 * 2. approveTransfer: change status=approved, mark asset as in_transfer, notify requester
 */
export const approveTransfer = async (tenantId, transferId, approverId) => {
  const db = admin.firestore();
  const transferRef = db.collection("asset_transfers").doc(transferId);

  await db.runTransaction(async (t) => {
    const doc = await t.get(transferRef);
    if (!doc.exists || doc.data().tenant_id !== tenantId)
      throw new Error("Transfer not found.");
    if (doc.data().status !== "pending")
      throw new Error("Transfer is not in pending state.");

    const transferData = doc.data();

    t.update(transferRef, {
      status: "approved",
      approved_by: approverId,
      approved_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const assetRef = db.collection("assets").doc(transferData.asset_id);
    t.update(assetRef, { status: "in_transfer" }); // Ensure it is locked
  });

  const doc = await transferRef.get();
  await notifyUser(
    tenantId,
    doc.data().requested_by,
    "Transfer Approved",
    `Transfer ${doc.data().transfer_no} was approved.`,
  );
  return { success: true, status: "approved" };
};

/**
 * 3. rejectTransfer: status=rejected, unlock asset status, notify requester
 */
export const rejectTransfer = async (
  tenantId,
  transferId,
  approverId,
  reason,
) => {
  const db = admin.firestore();
  const transferRef = db.collection("asset_transfers").doc(transferId);

  await db.runTransaction(async (t) => {
    const doc = await t.get(transferRef);
    if (!doc.exists || doc.data().tenant_id !== tenantId)
      throw new Error("Transfer not found.");
    if (doc.data().status !== "pending")
      throw new Error("Transfer is not in pending state.");

    const transferData = doc.data();

    t.update(transferRef, {
      status: "rejected",
      approved_by: approverId,
      rejection_reason: reason,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const assetRef = db.collection("assets").doc(transferData.asset_id);
    // Revert asset status to active or assigned depending on custodian
    const originalStatus = transferData.from_custodian_id
      ? "assigned"
      : "active";
    t.update(assetRef, { status: originalStatus });
  });

  const doc = await transferRef.get();
  await notifyUser(
    tenantId,
    doc.data().requested_by,
    "Transfer Rejected",
    `Transfer ${doc.data().transfer_no} was rejected.`,
  );
  return { success: true, status: "rejected" };
};

/**
 * 4. confirmDispatch: status=dispatched, record dispatch timestamp
 */
export const confirmDispatch = async (
  tenantId,
  transferId,
  userId,
  conditionAtDispatch,
) => {
  const db = admin.firestore();
  const transferRef = db.collection("asset_transfers").doc(transferId);
  const doc = await transferRef.get();

  if (!doc.exists || doc.data().tenant_id !== tenantId)
    throw new Error("Transfer not found.");
  if (doc.data().status !== "approved")
    throw new Error("Transfer must be approved before dispatch.");

  await transferRef.update({
    status: "dispatched",
    dispatched_at: admin.firestore.FieldValue.serverTimestamp(),
    condition_at_dispatch: conditionAtDispatch,
  });

  // Notify destination custodian
  const destUserId = doc.data().to_custodian_id;
  if (destUserId) {
    await notifyUser(
      tenantId,
      destUserId,
      "Asset Dispatched",
      `Asset for transfer ${doc.data().transfer_no} is incoming.`,
    );
  }

  return { success: true, status: "dispatched" };
};

/**
 * 5. confirmReceipt: status=received, update asset location/custodian, save transfer_history, notify
 */
export const confirmReceipt = async (
  tenantId,
  transferId,
  userId,
  conditionAtReceipt,
  receiverNotes,
) => {
  const db = admin.firestore();
  const transferRef = db.collection("asset_transfers").doc(transferId);

  await db.runTransaction(async (t) => {
    const doc = await t.get(transferRef);
    if (!doc.exists || doc.data().tenant_id !== tenantId)
      throw new Error("Transfer not found.");
    if (doc.data().status !== "dispatched")
      throw new Error("Transfer must be dispatched before receiving.");

    const trf = doc.data();

    // Verify receiving user is the target custodian, unless it's a dept-level transfer
    if (trf.to_custodian_id && trf.to_custodian_id !== userId) {
      throw new Error(
        "Receipt must be confirmed by the destination custodian.",
      );
    }

    t.update(transferRef, {
      status: "received",
      received_at: admin.firestore.FieldValue.serverTimestamp(),
      condition_at_receipt: conditionAtReceipt,
      receiver_notes: receiverNotes || "",
    });

    const assetRef = db.collection("assets").doc(trf.asset_id);
    const newStatus = trf.to_custodian_id ? "assigned" : "active";
    t.update(assetRef, {
      status: newStatus,
      branch_id: trf.to_branch_id,
      dept_id: trf.to_dept_id,
      location_id: trf.to_location_id,
      custodian_user_id: trf.to_custodian_id,
      condition: conditionAtReceipt,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create Assignment record if custodian is set
    if (trf.to_custodian_id) {
      const assignRef = db.collection("asset_assignments").doc();
      t.set(assignRef, {
        id: assignRef.id,
        tenant_id: tenantId,
        asset_id: trf.asset_id,
        assigned_to_user_id: trf.to_custodian_id,
        assigned_to_dept_id: trf.to_dept_id,
        assigned_to_location_id: trf.to_location_id,
        assignment_date: admin.firestore.FieldValue.serverTimestamp(),
        assignment_type: "individual",
        condition_at_assignment: conditionAtReceipt,
        notes: "Auto-assigned from transfer: " + trf.transfer_no,
        acknowledged_by_receiver: true,
        acknowledged_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: userId,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Save Historical log
    const logRef = db.collection("activity_log").doc();
    t.set(logRef, {
      tenant_id: tenantId,
      module: "ASSET_REGISTER",
      action: "TRANSFER_COMPLETED",
      details: {
        asset_id: trf.asset_id,
        transfer_id: transferId,
        transfer_no: trf.transfer_no,
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  const doc = await transferRef.get();
  const trf = doc.data();
  await notifyUser(
    tenantId,
    trf.requested_by,
    "Transfer Completed",
    `Transfer ${trf.transfer_no} receipt confirmed.`,
  );
  if (trf.from_custodian_id) {
    await notifyUser(
      tenantId,
      trf.from_custodian_id,
      "Transfer Completed",
      `Asset transferred from your custody.`,
    );
  }

  return { success: true, status: "received" };
};

/**
 * 6. getTransferHistory(assetId)
 */
export const getTransferHistory = async (tenantId, assetId) => {
  const db = admin.firestore();
  const snapshot = await db
    .collection("asset_transfers")
    .where("tenant_id", "==", tenantId)
    .where("asset_id", "==", assetId)
    .where("status", "==", "received")
    .orderBy("received_at", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data());
};

/**
 * Get active/pending transfers
 */
export const getTransfers = async (tenantId, filters = {}) => {
  const db = admin.firestore();
  let query = db
    .collection("asset_transfers")
    .where("tenant_id", "==", tenantId);

  if (filters.status) query = query.where("status", "==", filters.status);
  if (filters.requested_by)
    query = query.where("requested_by", "==", filters.requested_by);
  if (filters.to_custodian_id)
    query = query.where("to_custodian_id", "==", filters.to_custodian_id);

  const snapshot = await query.orderBy("created_at", "desc").limit(50).get();
  return snapshot.docs.map((doc) => doc.data());
};

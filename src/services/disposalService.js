import admin from "firebase-admin";
import Joi from "joi";
import { generateDisposalJournal } from "./journalEntryService.js";

const disposalSchema = Joi.object({
  asset_id: Joi.string().required(),
  disposal_type: Joi.string()
    .valid("sale", "scrap", "write_off", "lost", "donated", "transferred_out")
    .required(),
  disposal_date: Joi.date().iso().required(),
  disposal_value: Joi.number().min(0).default(0),
  buyer_name: Joi.string().allow("").optional(),
  buyer_contact: Joi.string().allow("").optional(),
  sale_documents_url: Joi.array().items(Joi.string().uri()).optional(),
});

const generateDisposalNo = async (tenantId) => {
  const db = admin.firestore();
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
  const seqRef = db
    .collection("tenant_sequences")
    .doc(`${tenantId}_disposal_${dateStr}`);

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

  return `DSP-${dateStr}-${String(nextVal).padStart(4, "0")}`;
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

export const calculateGainLoss = async (tenantId, assetId, disposalValue) => {
  const db = admin.firestore();
  const assetDoc = await db.collection("assets").doc(assetId).get();

  if (!assetDoc.exists || assetDoc.data().tenant_id !== tenantId) {
    throw new Error("Asset not found");
  }

  const asset = assetDoc.data();
  const bookValue = asset.current_book_value || 0;
  const gainOrLoss = disposalValue - bookValue;

  let type = "nil";
  if (gainOrLoss > 0) type = "gain";
  else if (gainOrLoss < 0) type = "loss";

  return {
    book_value: bookValue,
    disposal_value: disposalValue,
    gain_or_loss: gainOrLoss,
    type,
  };
};

export const createDisposalRequest = async (tenantId, data, userId) => {
  const { error, value } = disposalSchema.validate(data);
  if (error)
    throw new Error(`Disposal validation failed: ${error.details[0].message}`);

  const db = admin.firestore();

  const assetDoc = await db.collection("assets").doc(value.asset_id).get();
  if (!assetDoc.exists || assetDoc.data().tenant_id !== tenantId) {
    throw new Error("Asset not found.");
  }

  const asset = assetDoc.data();
  if (asset.status === "disposed") {
    throw new Error("Asset is already disposed.");
  }

  const calc = await calculateGainLoss(
    tenantId,
    value.asset_id,
    value.disposal_value,
  );

  const disposalNo = await generateDisposalNo(tenantId);
  const disposalRef = db.collection("disposal_records").doc();

  const disposalData = {
    id: disposalRef.id,
    tenant_id: tenantId,
    disposal_no: disposalNo,
    book_value_at_disposal: calc.book_value,
    gain_or_loss: calc.gain_or_loss,
    gain_loss_type: calc.type,
    status: "draft", // or pending_approval
    accounting_entry_created: false,
    created_by: userId,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    ...value,
  };

  await disposalRef.set(disposalData);

  // Notify finance manager (mocked as taking the first active user)
  const managers = await db
    .collection("tenant_users")
    .where("tenant_id", "==", tenantId)
    .where("status", "==", "active")
    .limit(1)
    .get();

  if (!managers.empty) {
    await notifyUser(
      tenantId,
      managers.docs[0].id,
      "New Disposal Request",
      `Disposal request ${disposalNo} requires approval.`,
    );
  }

  return disposalData;
};

export const approveDisposal = async (
  tenantId,
  disposalId,
  approverId,
  notes,
) => {
  const db = admin.firestore();
  const disposalRef = db.collection("disposal_records").doc(disposalId);

  let journalEntryId = null;

  await db.runTransaction(async (t) => {
    const doc = await t.get(disposalRef);
    if (!doc.exists || doc.data().tenant_id !== tenantId)
      throw new Error("Disposal not found.");

    const disposalData = doc.data();
    if (
      disposalData.status === "approved" ||
      disposalData.status === "completed"
    ) {
      throw new Error("Disposal is already approved or completed.");
    }

    const assetDoc = await t.get(
      db.collection("assets").doc(disposalData.asset_id),
    );
    if (!assetDoc.exists) throw new Error("Asset not found.");
    const assetData = assetDoc.data();

    // Generate Journal Entry
    journalEntryId = await generateDisposalJournal(
      tenantId,
      disposalData,
      assetData,
    );

    t.update(disposalRef, {
      status: "approved",
      approved_by: approverId,
      approval_date: admin.firestore.FieldValue.serverTimestamp(),
      approval_notes: notes || "",
      financial_posting_reference: journalEntryId,
      accounting_entry_created: true,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  return {
    success: true,
    status: "approved",
    journal_entry_id: journalEntryId,
  };
};

export const completeDisposal = async (tenantId, disposalId, userId) => {
  const db = admin.firestore();
  const disposalRef = db.collection("disposal_records").doc(disposalId);

  await db.runTransaction(async (t) => {
    const doc = await t.get(disposalRef);
    if (!doc.exists || doc.data().tenant_id !== tenantId)
      throw new Error("Disposal not found.");

    const disposalData = doc.data();
    if (disposalData.status !== "approved") {
      throw new Error("Disposal must be approved before completion.");
    }

    const assetRef = db.collection("assets").doc(disposalData.asset_id);
    const assetDoc = await t.get(assetRef);

    t.update(disposalRef, {
      status: "completed",
      completed_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (assetDoc.exists) {
      t.update(assetRef, {
        status: "disposed",
        current_book_value: 0,
        disposed_date: disposalData.disposal_date,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

  return { success: true, status: "completed" };
};

export const getDisposals = async (tenantId, filters = {}) => {
  const db = admin.firestore();
  let query = db
    .collection("disposal_records")
    .where("tenant_id", "==", tenantId);

  if (filters.status) query = query.where("status", "==", filters.status);
  if (filters.disposal_type)
    query = query.where("disposal_type", "==", filters.disposal_type);

  const snapshot = await query.orderBy("created_at", "desc").limit(50).get();
  return snapshot.docs.map((doc) => doc.data());
};

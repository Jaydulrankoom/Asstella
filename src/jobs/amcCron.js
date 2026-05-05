import admin from "firebase-admin";

export const runAMCChecks = async () => {
  const db = admin.firestore();

  const now = new Date();

  const datePlus60 = new Date(now);
  datePlus60.setDate(datePlus60.getDate() + 60);

  const isoNow = now.toISOString();
  const iso60 = datePlus60.toISOString();

  // Daily: check contracts where end_date <= now+60 days → send renewal alert
  const expiringContracts = await db
    .collection("amc_contracts")
    .where("end_date", ">", isoNow)
    .where("end_date", "<=", iso60)
    .where("status", "==", "active")
    .get();

  for (const doc of expiringContracts.docs) {
    const contract = doc.data();
    await notifyTenantManager(
      contract.tenant_id,
      "AMC Contract Expiring soon",
      `Contract ${contract.contract_no} expires on ${contract.end_date}.`,
    );
    await doc.ref.update({ status: "expiring" });
  }

  // Check expired active contracts to set them properly
  const expiredContracts = await db
    .collection("amc_contracts")
    .where("end_date", "<", isoNow)
    .where("status", "in", ["active", "expiring"])
    .get();

  for (const doc of expiredContracts.docs) {
    await doc.ref.update({ status: "expired" });
  }

  // Daily: check scheduled visits not completed past due_date → mark as missed, apply penalty if applicable
  const missedVisits = await db
    .collection("amc_visits")
    .where("status", "==", "scheduled")
    .where("scheduled_date", "<", isoNow)
    .get();

  for (const doc of missedVisits.docs) {
    const visit = doc.data();
    await doc.ref.update({
      status: "missed",
      sla_met: false,
      // You can add default penalty logic for completely missed visits if defined in contract
      penalty_applied: true, // Requires knowing contract details for amount
    });
  }
};

const notifyTenantManager = async (tenantId, title, body) => {
  const db = admin.firestore();
  const users = await db
    .collection("tenant_users")
    .where("tenant_id", "==", tenantId)
    .limit(1)
    .get();

  if (!users.empty) {
    await db.collection("notifications").add({
      tenant_id: tenantId,
      user_id: users.docs[0].id,
      title,
      body,
      read: false,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
};

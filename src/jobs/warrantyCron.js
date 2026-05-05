import admin from "firebase-admin";

/**
 * Cloud Function (daily) — Warranty Expiry Alerts
 */
export const runWarrantyChecks = async () => {
  const db = admin.firestore();

  const now = new Date();

  const datePlus7 = new Date(now);
  datePlus7.setDate(datePlus7.getDate() + 7);

  const datePlus30 = new Date(now);
  datePlus30.setDate(datePlus30.getDate() + 30);

  const iso7 = datePlus7.toISOString();
  const iso30 = datePlus30.toISOString();
  // Ensure we don't query already expired
  const isoNow = now.toISOString();

  // Queries for upcoming expiries
  const expiring30 = await db
    .collection("warranty_records")
    .where("end_date", ">", isoNow)
    .where("end_date", "<=", iso30)
    .where("status", "in", ["active", "expiring_soon"]) // Only process if not set to expired
    .get();

  for (const doc of expiring30.docs) {
    const warranty = doc.data();
    const expiryDate = new Date(warranty.end_date);

    // Check if it's within 7 days for critical alert
    if (expiryDate <= datePlus7) {
      await notifyManager(
        warranty.tenant_id,
        `Critical: Warranty Expiring`,
        `Warranty for asset ${warranty.asset_id} expires within 7 days!`,
      );
      await doc.ref.update({ status: "expiring_soon" });
    } else {
      await notifyManager(
        warranty.tenant_id,
        `Notice: Warranty Expiring`,
        `Warranty for asset ${warranty.asset_id} expires within 30 days.`,
      );
      await doc.ref.update({ status: "expiring_soon" });
    }
  }
};

const notifyManager = async (tenantId, title, body) => {
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

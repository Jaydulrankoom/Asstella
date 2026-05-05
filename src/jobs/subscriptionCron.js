import admin from "firebase-admin";

/**
 * Helper to record status change history
 */
const logStatusChange = async (db, tenantId, oldStatus, newStatus, reason) => {
  await db.collection("tenant_status_history").add({
    tenant_id: tenantId,
    old_status: oldStatus,
    new_status: newStatus,
    reason,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * Subscription Lifecycle Cloud Function (Cron Job implementation)
 * Should be executed daily (e.g. via Google Cloud Scheduler or Firebase pub/sub cron)
 */
export const processDailySubscriptions = async () => {
  const db = admin.firestore();
  const now = new Date();

  const fourteenDaysFromNow = new Date();
  fourteenDaysFromNow.setDate(now.getDate() + 14);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const batch = db.batch();
  let opsCount = 0;

  // Max 500 writes per batch in Firestore, helper to auto commit if exceeded
  const checkBatchCommit = async () => {
    if (opsCount >= 450) {
      await batch.commit();
      opsCount = 0;
    }
  };

  try {
    // -------------------------------------------------------------------------------- //
    // 1. Alert: Query tenants where subscription.end_date is within 14 days
    // -------------------------------------------------------------------------------- //
    const alertsSnap = await db
      .collection("tenant_subscriptions")
      .where("status", "==", "active")
      .where(
        "end_date",
        "<=",
        admin.firestore.Timestamp.fromDate(fourteenDaysFromNow),
      )
      .where("end_date", ">", admin.firestore.Timestamp.fromDate(now))
      .get();

    for (const doc of alertsSnap.docs) {
      const sub = doc.data();
      // Generate a renewal alert notification
      const notifRef = db.collection("notifications").doc();
      batch.set(notifRef, {
        tenant_id: sub.tenant_id,
        type: "SUBSCRIPTION_RENEWAL_ALERT",
        message: `Your subscription is set to renew on ${sub.end_date.toDate().toLocaleDateString()}.`,
        read: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      opsCount++;
      await checkBatchCommit();
    }

    // -------------------------------------------------------------------------------- //
    // 2. Mark Overdue: Query subscriptions where end_date < now AND status = active
    // -------------------------------------------------------------------------------- //
    const overdueSnap = await db
      .collection("tenant_subscriptions")
      .where("status", "==", "active")
      .where("end_date", "<", admin.firestore.Timestamp.fromDate(now))
      .get();

    for (const doc of overdueSnap.docs) {
      const sub = doc.data();

      batch.update(doc.ref, {
        status: "overdue",
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      opsCount++;

      // Optionally record system log
      const logRef = db.collection("system_logs").doc();
      batch.set(logRef, {
        tenant_id: sub.tenant_id,
        module: "BILLING",
        action: "MARKED_OVERDUE",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      opsCount++;
      await checkBatchCommit();
    }

    // -------------------------------------------------------------------------------- //
    // 3. Suspend: Query tenants where overdue for > 7 days (grace period)
    // -------------------------------------------------------------------------------- //
    const gracePeriodThreshold =
      admin.firestore.Timestamp.fromDate(sevenDaysAgo);

    // Subscriptions overdue and end_date was more than 7 days ago
    const suspendSnap = await db
      .collection("tenant_subscriptions")
      .where("status", "==", "overdue")
      .where("end_date", "<", gracePeriodThreshold)
      .get();

    for (const doc of suspendSnap.docs) {
      const sub = doc.data();

      batch.update(doc.ref, {
        status: "suspended",
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      opsCount++;

      // Suspend the actual tenant account
      const tenantRef = db.collection("tenants").doc(sub.tenant_id);
      batch.update(tenantRef, {
        status: "suspended",
        suspension_reason: "Subscription Overdue (Grace period expired)",
        suspended_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      opsCount++;

      // Log status change
      await logStatusChange(
        db,
        sub.tenant_id,
        "active",
        "suspended",
        "Subscription overdue > 7 days",
      );

      await checkBatchCommit();
    }

    if (opsCount > 0) {
      await batch.commit();
    }

    return { success: true, message: "Daily subscription lifecycle complete." };
  } catch (error) {
    // Structural logging for cron failure
    process.stderr.write(
      JSON.stringify({
        level: "error",
        context: "processDailySubscriptions",
        message: error.message,
        stack: error.stack,
      }) + "\\n",
    );
    throw error;
  }
};

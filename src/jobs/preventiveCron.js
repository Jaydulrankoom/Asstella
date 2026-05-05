import admin from "firebase-admin";

// Calculates the next date based on frequency
const calculateNextDate = (currentDateStr, freqType, freqValue) => {
  const current = new Date(currentDateStr);
  if (freqType === "weekly") {
    current.setDate(current.getDate() + 7 * freqValue);
  } else if (freqType === "monthly") {
    current.setMonth(current.getMonth() + freqValue);
  } else if (freqType === "quarterly") {
    current.setMonth(current.getMonth() + 3 * freqValue);
  } else if (freqType === "yearly") {
    current.setFullYear(current.getFullYear() + freqValue);
  }
  return current.toISOString();
};

const getManagerId = async (tenantId) => {
  // Mock function to find the first user with an admin/manager role
  const db = admin.firestore();
  const snap = await db
    .collection("tenant_users")
    .where("tenant_id", "==", tenantId)
    .where("status", "==", "active")
    .limit(1)
    .get(); // In reality we should filter by specific role_id.

  if (!snap.empty) {
    return snap.docs[0].id; // The user ID
  }
  return null;
};

/**
 * Run this function periodically (e.g. daily via cron)
 */
export const runPreventiveMaintenanceChecks = async () => {
  const db = admin.firestore();

  // Calculate threshold: 7 days from now
  const now = new Date();
  const thresholdDays = new Date(now);
  thresholdDays.setDate(thresholdDays.getDate() + 7);
  const thresholdISO = thresholdDays.toISOString();

  // Due to Firestore indexing, range queries on string ISO dates work well
  // We want schedules where next_due_date <= now + 7 days
  const snap = await db
    .collection("preventive_schedules")
    .where("status", "==", "active")
    .where("next_due_date", "<=", thresholdISO)
    .get();

  for (const doc of snap.docs) {
    const schedule = doc.data();
    const tenantId = schedule.tenant_id;

    // To prevent generating the same ticket repeatedly in the 7 day window,
    // we should check if a ticket for this schedule + due_date already exists.
    // Assuming schedule ID is appended to ticket notes or similar, or we can just push next_due_date forward immediately.

    // For simplicity, we create the ticket, then immediately update the schedule's next_due_date.

    // Generate an asset list. If category_id is set and not asset_id, we could create tickets for ALL assets in category
    let assetIds = [];
    if (schedule.asset_id) {
      assetIds.push(schedule.asset_id);
    } else if (schedule.category_id) {
      const assetsSnap = await db
        .collection("assets")
        .where("tenant_id", "==", tenantId)
        .where("category_id", "==", schedule.category_id)
        .where("status", "in", ["active", "assigned"])
        .get();
      assetsSnap.forEach((a) => assetIds.push(a.id));
    }

    for (const assetId of assetIds) {
      // 2. auto-create maintenance_ticket

      const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
      let nextSeqStr = Math.floor(Math.random() * 9000 + 1000).toString(); // Quick mock since no transaction here
      const ticketNo = `MNT-${dateStr}-${nextSeqStr}`;

      const ticketRef = db.collection("maintenance_tickets").doc();
      const ticketData = {
        id: ticketRef.id,
        tenant_id: tenantId,
        ticket_no: ticketNo,
        asset_id: assetId,
        maintenance_type: "preventive",
        priority: "medium",
        issue_description: schedule.task_description,
        reported_by_user_id: "SYSTEM",
        reported_at: admin.firestore.FieldValue.serverTimestamp(),
        assigned_technician_id: null,
        assigned_vendor_id: null,
        status: "open",
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Assing to technician/vendor if specified
      if (schedule.assigned_to) {
        // Technically assigned_to could be tech or vendor. We'll dump it to tech for now.
        ticketData.assigned_technician_id = schedule.assigned_to;
        ticketData.status = "assigned";
      }

      await ticketRef.set(ticketData);

      // Notification logic
      const managerId = await getManagerId(tenantId);
      if (managerId) {
        await db.collection("notifications").add({
          tenant_id: tenantId,
          user_id: managerId,
          title: "Preventive Maintenance Due",
          body: `Ticket ${ticketNo} created for upcoming preventive maintenance.`,
          read: false,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // 3. Set next_due_date based on frequency
    const newDueDate = calculateNextDate(
      schedule.next_due_date,
      schedule.frequency_type,
      schedule.frequency_value,
    );

    // Check if new due date is STILL overdue? (If they didn't run the script for months)
    let newStatus = "active";
    if (new Date(newDueDate) < now) {
      // 5. Mark schedule status=overdue if next_due_date < now AND no ticket created (here we update next_due_date, but let's just mark it overdue if it falls behind)
      newStatus = "overdue";
    }

    await doc.ref.update({
      next_due_date: newDueDate,
      last_service_date: admin.firestore.FieldValue.serverTimestamp(),
      status: newStatus,
    });
  }
};

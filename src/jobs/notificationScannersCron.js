import admin from "firebase-admin";
import * as notificationService from "../services/notificationService.js";

export const runDailyAlertScanners = async () => {
  const db = admin.firestore();

  const now = new Date();
  const plus7 = new Date(now);
  plus7.setDate(now.getDate() + 7);
  const plus30 = new Date(now);
  plus30.setDate(now.getDate() + 30);
  const plus60 = new Date(now);
  plus60.setDate(now.getDate() + 60);

  const isoNow = now.toISOString();
  const iso7 = plus7.toISOString();
  const iso30 = plus30.toISOString();
  const iso60 = plus60.toISOString();

  // 1. Warranty expiry scan (30 days)
  const warranty30Snap = await db
    .collection("assets")
    .where("warranty_end", ">", isoNow)
    .where("warranty_end", "<=", iso30)
    .get();

  // We should track which ones we already alerted to avoid spamming daily.
  // For simplicity, we trigger the alert. In production, maintain an 'alerts_sent' array or document.
  const usersCache = {}; // tenantId -> admin users

  const getAdmins = async (tenantId) => {
    if (usersCache[tenantId]) return usersCache[tenantId];
    // Find admins or asset managers for tenant
    const snap = await db
      .collection("tenant_users")
      .where("tenant_id", "==", tenantId)
      .where("role_id", "==", "admin") // Mock role
      .get();
    const ids = snap.docs.map((d) => d.id);
    usersCache[tenantId] = ids;
    return ids;
  };

  for (const doc of warranty30Snap.docs) {
    const asset = doc.data();
    const admins = await getAdmins(asset.tenant_id);
    if (admins.length > 0) {
      await notificationService.dispatchNotification(
        asset.tenant_id,
        "WARRANTY_EXPIRING_30DAYS",
        {
          asset_code: asset.asset_code,
          reference_type: "asset",
          reference_id: asset.id,
        },
        admins,
      );
    }
  }

  // 2. Warranty 7 Days
  const warranty7Snap = await db
    .collection("assets")
    .where("warranty_end", ">", isoNow)
    .where("warranty_end", "<=", iso7)
    .get();

  for (const doc of warranty7Snap.docs) {
    const asset = doc.data();
    const admins = await getAdmins(asset.tenant_id);
    if (admins.length > 0) {
      await notificationService.dispatchNotification(
        asset.tenant_id,
        "WARRANTY_EXPIRING_7DAYS",
        {
          asset_code: asset.asset_code,
          reference_type: "asset",
          reference_id: asset.id,
        },
        admins,
      );
    }
  }

  // 3. AMC Renewal (60 days)
  const amcSnap = await db
    .collection("amc_contracts")
    .where("end_date", ">", isoNow)
    .where("end_date", "<=", iso60)
    .get();

  for (const doc of amcSnap.docs) {
    const contract = doc.data();
    const admins = await getAdmins(contract.tenant_id);
    if (admins.length > 0) {
      await notificationService.dispatchNotification(
        contract.tenant_id,
        "AMC_RENEWAL_60DAYS",
        {
          contract_no: contract.contract_no,
          reference_type: "amc_contract",
          reference_id: contract.id,
        },
        admins,
      );
    }
  }

  // 4. Maintenance Overdue
  const maintenanceSnap = await db
    .collection("maintenance_tickets")
    .where("status", "in", ["open", "assigned", "in_progress"])
    .where("due_date", "<", isoNow)
    .get();

  for (const doc of maintenanceSnap.docs) {
    const ticket = doc.data();
    const admins = await getAdmins(ticket.tenant_id);
    if (admins.length > 0) {
      await notificationService.dispatchNotification(
        ticket.tenant_id,
        "MAINTENANCE_OVERDUE",
        {
          ticket_id: ticket.ticket_no || ticket.id,
          reference_type: "maintenance_ticket",
          reference_id: ticket.id,
        },
        admins,
      );
    }
  }

  console.log("Daily alert scanners completed.");
};

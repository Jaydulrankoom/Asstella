import admin from "firebase-admin";
import { db } from "../middleware/auth";

/**
 * Service to monitor vehicle documentation compliance.
 */
export const vehicleComplianceService = {
  /**
   * Scans for expiring vehicle documentation and triggers alerts
   */
  async checkExpiryAlerts(tenantId: string) {
    const today = new Date();
    const alertThresholds = [30, 7, 0]; // Days before expiry
    
    const vehiclesSnapshot = await db.collection("tenants").doc(tenantId).collection("vehicles").get();

    for (const doc of vehiclesSnapshot.docs) {
      const v = doc.data();
      const docsToCheck = [
        { label: "Insurance", field: "insuranceExpiryDate" },
        { label: "Registration", field: "registrationExpiryDate" },
        { label: "Fitness Certificate", field: "fitnessExpiryDate" }
      ];

      for (const item of docsToCheck) {
        if (!v[item.field]) continue;

        const expiryDate = v[item.field].toDate ? v[item.field].toDate() : new Date(v[item.field]);
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (alertThresholds.includes(diffDays)) {
          await this.createComplianceNotification(tenantId, {
            title: `${item.label} Expiry Alert`,
            body: `Vehicle ${v.code || doc.id} - ${item.label} expires in ${diffDays} days (${expiryDate.toDateString()}).`,
            vehicleId: doc.id,
            severity: diffDays === 0 ? "critical" : (diffDays <= 7 ? "warning" : "info")
          });
        }
      }
    }
  },

  /**
   * Internal helper to write notifications and trigger potential FCM
   */
  async createComplianceNotification(tenantId: string, alert: { title: string; body: string; vehicleId: string; severity: string }) {
    await db.collection("tenants").doc(tenantId).collection("notifications").add({
      ...alert,
      type: "compliance",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      targetRoles: ["fleet_manager", "transport_admin"]
    });

    // In a real production app, we would invoke messaging.sendMulticast() here to relevant user tokens
    console.log(`[Notification] Tenant: ${tenantId}, Alert: ${alert.title}`);
  }
};

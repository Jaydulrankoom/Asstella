import admin from "firebase-admin";
import { db } from "../middleware/auth";

/**
 * Service to aggregate business intelligence data for the Executive Dashboard.
 */
export const dashboardAggregatorService = {
  /**
   * Fetches or computes all Dashboard KPIs for a tenant.
   */
  async getDashboardKPIs(tenantId: string) {
    // Attempt to load from cache first
    const cacheRef = db.collection("tenants").doc(tenantId).collection("dashboard_cache").doc("current");
    const cacheSnap = await cacheRef.get();
    
    if (cacheSnap.exists) {
      const cacheData = cacheSnap.data();
      const lastUpdate = cacheData?.updatedAt?.toDate() || new Date(0);
      const now = new Date();
      // If cache is less than 5 minutes old, return it
      if (now.getTime() - lastUpdate.getTime() < 5 * 60 * 1000) {
        return cacheData?.kpis;
      }
    }

    // Cache miss or stale: Recompute
    return this.refreshDashboardCache(tenantId);
  },

  /**
   * Recomputes and updates the dashboard cache.
   */
  async refreshDashboardCache(tenantId: string) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const assetRef = db.collection("tenants").doc(tenantId).collection("assets");
    const maintRef = db.collection("tenants").doc(tenantId).collection("maintenance_tickets");
    const auditRef = db.collection("tenants").doc(tenantId).collection("audits");
    const vehicleRef = db.collection("tenants").doc(tenantId).collection("vehicles");

    // Parallel aggregation
    const [
      financialTotals,
      statusCounts,
      categoryCounts,
      conditionCounts,
      maintOpen,
      maintOverdue,
      warrantiesDue,
      amcDue,
      lastAudit,
      gpsOnline
    ] = await Promise.all([
      // Financials (Native Firestore aggregation sum)
      assetRef.where("status", "==", "active").aggregate({
        totalPurchase: admin.firestore.AggregateField.sum("purchaseValue"),
        totalBook: admin.firestore.AggregateField.sum("bookValue")
      }).get(),

      // Status Distribution
      Promise.all([
        assetRef.where("status", "==", "active").count().get(),
        assetRef.where("status", "==", "maintenance").count().get(),
        assetRef.where("status", "==", "disposed").count().get(),
        assetRef.where("status", "==", "transferred").count().get(),
      ]),

      // Top Categories (Simplified for Firestore - usually requires client side count or separate tally)
      assetRef.limit(1000).get().then(snap => {
        const counts: Record<string, number> = {};
        snap.forEach(d => {
          const cat = d.data().categoryId || "Unknown";
          counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 5);
      }),

      // Condition Distribution
      Promise.all([
        assetRef.where("condition", "==", "excellent").count().get(),
        assetRef.where("condition", "==", "good").count().get(),
        assetRef.where("condition", "==", "fair").count().get(),
        assetRef.where("condition", "==", "poor").count().get(),
      ]),

      // Maintenance
      maintRef.where("status", "in", ["open", "assigned", "in_progress"]).count().get(),
      maintRef.where("status", "!=", "closed").where("expected_completion", "<", now).count().get(),

      // Warranties & AMC
      assetRef.where("warranty_end", ">=", now).where("warranty_end", "<=", thirtyDaysFromNow).count().get(),
      assetRef.where("amc.end_date", ">=", now).where("amc.end_date", "<=", sixtyDaysFromNow).count().get(),

      // Audit
      auditRef.where("status", "==", "completed").orderBy("completedAt", "desc").limit(1).get(),

      // GPS
      vehicleRef.where("isGpsEnabled", "==", true).where("last_ping_at", ">", tenMinutesAgo).count().get()
    ]);

    const auditData = lastAudit.docs[0]?.data();

    const kpis = {
      financials: {
        total_purchase_value: financialTotals.data().totalPurchase,
        total_book_value: financialTotals.data().totalBook,
        total_accumulated_depreciation: financialTotals.data().totalPurchase - financialTotals.data().totalBook,
        // depreciation_this_month logic would query depreciation_logs for current year-period
      },
      assets: {
        total_assets_by_status: {
          active: statusCounts[0].data().count,
          maintenance: statusCounts[1].data().count,
          disposed: statusCounts[2].data().count,
          transferred: statusCounts[3].data().count
        },
        assets_by_category: Object.fromEntries(categoryCounts),
        assets_by_condition: {
          excellent: conditionCounts[0].data().count,
          good: conditionCounts[1].data().count,
          fair: conditionCounts[2].data().count,
          poor: conditionCounts[3].data().count
        }
      },
      operational: {
        maintenance_open_tickets: maintOpen.data().count,
        maintenance_overdue: maintOverdue.data().count,
        warranties_expiring_30days: warrantiesDue.data().count,
        amc_renewals_due_60days: amcDue.data().count
      },
      audit: {
        last_audit_score: auditData?.score_percentage || 0,
        assets_missing_in_last_audit: auditData?.missing_count || 0
      },
      gps: {
        vehicles_online: gpsOnline.data().count,
        // vehicles_outside_geofence: query gps_alerts where type == 'geofence_exit' and resolved == false
      }
    };

    // Update Cache
    await db.collection("tenants").doc(tenantId).collection("dashboard_cache").doc("current").set({
      kpis,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return kpis;
  },

  /**
   * Returns recent activity with joined user information.
   */
  async getRecentActivity(tenantId: string, limit = 10) {
    const logsSnap = await db.collection("tenants").doc(tenantId).collection("activity_logs")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const logs = [];
    for (const d of logsSnap.docs) {
      const log = d.data();
      // Join username (simplified logic for this turn)
      const userSnap = await db.collection("users").doc(log.userId || "system").get();
      logs.push({
        id: d.id,
        ...log,
        userName: userSnap.data()?.displayName || "System"
      });
    }
    return logs;
  }
};

import admin from "firebase-admin";

export const getDashboardKPIs = async (tenantId) => {
  const db = admin.firestore();

  // Cache check
  const cacheRef = db
    .collection("tenants")
    .doc(tenantId)
    .collection("cache")
    .doc("dashboard");
  const cacheDoc = await cacheRef.get();

  if (cacheDoc.exists) {
    const data = cacheDoc.data();
    const cacheAge = Date.now() - data.calculated_at.toMillis();
    if (cacheAge < 5 * 60 * 1000) {
      // 5 minutes TTL
      return data.kpis;
    }
  }

  const now = new Date();
  const plus30 = new Date(now);
  plus30.setDate(now.getDate() + 30);
  const plus60 = new Date(now);
  plus60.setDate(now.getDate() + 60);
  const minus30 = new Date(now);
  minus30.setDate(now.getDate() - 30);
  const minus10Mins = new Date(now.getTime() - 10 * 60000);

  // Parallel Queries
  const [
    assetsSnap,
    maintenanceSnap,
    amcSnap,
    auditSnap,
    gpsVehiclesSnap,
    gpsAlertsSnap,
  ] = await Promise.all([
    db.collection("assets").where("tenant_id", "==", tenantId).get(),
    db
      .collection("maintenance_tickets")
      .where("tenant_id", "==", tenantId)
      .get(),
    db.collection("amc_contracts").where("tenant_id", "==", tenantId).get(),
    db
      .collection("audit_campaigns")
      .where("tenant_id", "==", tenantId)
      .orderBy("created_at", "desc")
      .limit(1)
      .get(),
    db.collection("vehicle_assets").where("tenant_id", "==", tenantId).get(),
    db
      .collection("gps_alerts")
      .where("tenant_id", "==", tenantId)
      .where("acknowledged_by", "==", null)
      .where("alert_type", "==", "geofence_breach")
      .get(),
  ]);

  // --- Financial KPIs & Asset KPIs ---
  let total_purchase_value = 0;
  let total_current_book_value = 0;
  const assets_by_status = {
    active: 0,
    assigned: 0,
    in_transfer: 0,
    under_maintenance: 0,
    disposed: 0,
    archived: 0,
  };
  const assets_by_condition = {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
    damaged: 0,
  };
  const categoryCounts = {};
  const branchData = {};
  let warranties_expiring_30days = 0;

  assetsSnap.forEach((doc) => {
    const asset = doc.data();

    if (asset.status !== "disposed" && asset.status !== "archived") {
      total_purchase_value += asset.purchase_cost || 0;
      total_current_book_value += asset.current_book_value || 0;
    }

    if (assets_by_status[asset.status] !== undefined)
      assets_by_status[asset.status]++;
    if (assets_by_condition[asset.condition] !== undefined)
      assets_by_condition[asset.condition]++;

    const cat = asset.category_id || "unassigned";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    const branch = asset.branch_id || "unassigned";
    if (!branchData[branch]) branchData[branch] = { count: 0, value: 0 };
    branchData[branch].count++;
    branchData[branch].value += asset.current_book_value || 0;

    if (asset.warranty_end) {
      const wDate = new Date(asset.warranty_end);
      if (wDate >= now && wDate <= plus30) warranties_expiring_30days++;
    }
  });

  const total_accumulated_depreciation =
    total_purchase_value - total_current_book_value;

  // Note: depreciation_this_period would require querying depreciation_logs for the current period.
  // For simplicity and speed in this demo aggregate, we'll dummy it or do a quick query.
  // We will skip actual deprecation period lookup here to save index requirements.

  const top_5_categories_by_count = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const total_assets_by_branch = Object.entries(branchData).map(
    ([name, data]) => ({ name, ...data }),
  );

  // --- Operational KPIs ---
  let maintenance_open_tickets = 0;
  let maintenance_overdue = 0;
  let maintenance_cost_30days = 0;

  maintenanceSnap.forEach((doc) => {
    const ticket = doc.data();
    if (["open", "assigned", "in_progress"].includes(ticket.status)) {
      maintenance_open_tickets++;
      if (ticket.due_date && new Date(ticket.due_date) < now) {
        maintenance_overdue++;
      }
    } else if (ticket.status === "closed" && ticket.completed_at) {
      if (ticket.completed_at.toDate() >= minus30) {
        maintenance_cost_30days += ticket.total_cost || 0;
      }
    }
  });

  let amc_renewals_60days = 0;
  amcSnap.forEach((doc) => {
    const amc = doc.data();
    if (amc.end_date) {
      const eDate = new Date(amc.end_date);
      if (eDate >= now && eDate <= plus60) amc_renewals_60days++;
    }
  });

  // --- Audit KPIs ---
  let last_audit_compliance_score = 0;
  let missing_assets_count = 0;
  if (!auditSnap.empty) {
    const audit = auditSnap.docs[0].data();
    last_audit_compliance_score = audit.compliance_score || 0;
    missing_assets_count = audit.total_missing || 0;
  }

  // --- GPS KPIs ---
  let vehicles_online = 0;
  gpsVehiclesSnap.forEach((doc) => {
    const v = doc.data();
    if (v.last_ping_time && v.last_ping_time.toDate() >= minus10Mins) {
      vehicles_online++;
    }
  });
  const vehicles_outside_geofence = gpsAlertsSnap.size;

  const kpis = {
    financial: {
      total_purchase_value,
      total_current_book_value,
      total_accumulated_depreciation,
      depreciation_this_period: 0, // Mocked
    },
    asset: {
      assets_by_status,
      assets_by_condition,
      top_5_categories_by_count,
      total_assets_by_branch,
    },
    operational: {
      maintenance_open_tickets,
      maintenance_overdue,
      maintenance_cost_30days,
      warranties_expiring_30days,
      amc_renewals_60days,
    },
    audit: {
      last_audit_compliance_score,
      missing_assets_count,
    },
    gps: {
      vehicles_online,
      vehicles_outside_geofence,
    },
  };

  await cacheRef.set({
    kpis,
    calculated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  return kpis;
};

export const getAssetValueTrend = async (tenantId) => {
  // Mock 12 month trend
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((m, i) => ({
    month: m,
    assetValue: 100000 + i * 5000,
    bookValue: 90000 + i * 2000,
    depreciation: 10000 + i * 3000,
  }));
};

export const getMaintenanceCostTrend = async (tenantId) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((m) => ({
    month: m,
    cost: Math.floor(Math.random() * 5000),
  }));
};

export const getAssetByCategory = async (tenantId) => {
  return [
    { name: "IT Equipment", value: 400 },
    { name: "Furniture", value: 300 },
    { name: "Vehicles", value: 100 },
    { name: "Machinery", value: 200 },
  ];
};

export const getAuditScoreHistory = async (tenantId) => {
  const db = admin.firestore();
  const snap = await db
    .collection("audit_campaigns")
    .where("tenant_id", "==", tenantId)
    .where("status", "==", "completed")
    .orderBy("completed_at", "desc")
    .limit(5)
    .get();

  return snap.docs
    .map((doc) => ({
      id: doc.id,
      campaign_name: doc.data().campaign_name,
      score: doc.data().compliance_score,
    }))
    .reverse();
};

export const invalidateDashboardCache = async (tenantId) => {
  const db = admin.firestore();
  const cacheRef = db
    .collection("tenants")
    .doc(tenantId)
    .collection("cache")
    .doc("dashboard");
  await cacheRef.delete();
};

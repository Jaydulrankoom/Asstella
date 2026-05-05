import admin from "firebase-admin";

export const generateReport = async (tenantId, reportType, filters) => {
  const db = admin.firestore();

  // Base query for assets
  let assetQuery = db.collection("assets").where("tenant_id", "==", tenantId);
  if (filters.branch_id)
    assetQuery = assetQuery.where("branch_id", "==", filters.branch_id);
  if (filters.category_id)
    assetQuery = assetQuery.where("category_id", "==", filters.category_id);

  // Start and end dates for time-bound reports
  const startDate = filters.start_date ? new Date(filters.start_date) : null;
  const endDate = filters.end_date ? new Date(filters.end_date) : new Date();

  // Load all matching assets
  const assetsSnap = await assetQuery.get();
  const assets = assetsSnap.docs.map((doc) => doc.data());

  switch (reportType) {
    case "fixed_asset_schedule":
      return await generateFixedAssetSchedule(
        db,
        tenantId,
        assets,
        startDate,
        endDate,
        filters,
      );
    case "depreciation_schedule":
      return await generateDepreciationSchedule(
        db,
        tenantId,
        assets,
        startDate,
        endDate,
        filters,
      );
    case "asset_register":
      return generateAssetRegister(assets, filters);
    case "disposal_gain_loss":
      return await generateDisposalReport(
        db,
        tenantId,
        assets,
        startDate,
        endDate,
        filters,
      );
    case "revaluation_report":
      return await generateRevaluationReport(
        db,
        tenantId,
        assets,
        startDate,
        endDate,
        filters,
      );
    case "impairment_report":
      return await generateImpairmentReport(
        db,
        tenantId,
        assets,
        startDate,
        endDate,
        filters,
      );
    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
};

const generateFixedAssetSchedule = async (
  db,
  tenantId,
  assets,
  startDate,
  endDate,
  filters,
) => {
  // Columns: Asset Code | Name | Category | Purchase Value | Opening Book Value | Additions | Depreciation | Disposals | Closing Book Value | Useful Life Remaining
  // Group by: category, then branch

  const reportData = [];

  for (const asset of assets) {
    // For a strict schedule we would query depreciation logs and additions within the date logic.
    // Simplifying for this example:
    const additions =
      asset.purchase_date >= startDate && asset.purchase_date <= endDate
        ? asset.purchase_cost
        : 0;

    // Get depreciation within range
    const depSnap = await db
      .collection("depreciation_logs")
      .where("asset_id", "==", asset.id)
      .where("calculated_at", ">=", startDate)
      .where("calculated_at", "<=", endDate)
      .get();

    let periodDep = 0;
    depSnap.forEach((doc) => {
      periodDep += doc.data().depreciation_amount;
    });

    let disposals = 0;
    if (
      asset.status === "disposed" &&
      asset.disposed_date >= startDate &&
      asset.disposed_date <= endDate
    ) {
      disposals = asset.purchase_cost; // or Book value at disposal
    }

    reportData.push({
      asset_code: asset.asset_code,
      asset_name: asset.asset_name,
      category_id: asset.category_id,
      branch_id: asset.branch_id,
      purchase_value: asset.purchase_cost,
      opening_book_value:
        asset.current_book_value + periodDep + disposals - additions, // simplistic back-calc
      additions: additions,
      depreciation: periodDep,
      disposals: disposals,
      closing_book_value: asset.current_book_value,
      useful_life_remaining: Math.max(
        0,
        (asset.useful_life_years || 0) -
          (Date.now() - new Date(asset.purchase_date).getTime()) /
            (1000 * 3600 * 24 * 365.25),
      ),
    });
  }

  return {
    report_type: "fixed_asset_schedule",
    filters,
    timestamp: new Date().toISOString(),
    items: reportData,
  };
};

const generateDepreciationSchedule = async (
  db,
  tenantId,
  assets,
  startDate,
  endDate,
  filters,
) => {
  const reportData = [];

  for (const asset of assets) {
    const depSnap = await db
      .collection("depreciation_logs")
      .where("asset_id", "==", asset.id)
      .where("calculated_at", ">=", startDate)
      .where("calculated_at", "<=", endDate)
      .get();

    let periodDep = 0;
    depSnap.forEach((doc) => {
      periodDep += doc.data().depreciation_amount;
    });

    reportData.push({
      asset_code: asset.asset_code,
      asset_name: asset.asset_name,
      category_id: asset.category_id,
      branch_id: asset.branch_id,
      opening_accumulated_dep: Math.max(
        0,
        asset.accumulated_depreciation - periodDep,
      ),
      this_period_dep: periodDep,
      closing_accumulated_dep: asset.accumulated_depreciation,
      net_book_value: asset.current_book_value,
    });
  }

  return {
    report_type: "depreciation_schedule",
    filters,
    timestamp: new Date().toISOString(),
    items: reportData,
  };
};

const generateAssetRegister = (assets, filters) => {
  let filteredAssets = assets;
  if (filters.status)
    filteredAssets = filteredAssets.filter((a) => a.status === filters.status);
  if (filters.condition)
    filteredAssets = filteredAssets.filter(
      (a) => a.condition === filters.condition,
    );

  return {
    report_type: "asset_register",
    filters,
    timestamp: new Date().toISOString(),
    items: filteredAssets,
  };
};

const generateDisposalReport = async (
  db,
  tenantId,
  assets,
  startDate,
  endDate,
  filters,
) => {
  const dsSnap = await db
    .collection("asset_disposals")
    .where("tenant_id", "==", tenantId)
    .where("disposed_date", ">=", startDate)
    .where("disposed_date", "<=", endDate)
    .get();

  const disposals = dsSnap.docs.map((doc) => doc.data());
  const reportData = [];

  for (const d of disposals) {
    const asset = assets.find((a) => a.id === d.asset_id);
    if (!asset && filters.branch_id) continue; // Filtered out

    reportData.push({
      asset_code: asset?.asset_code || d.asset_id,
      asset_name: asset?.asset_name || "Unknown",
      disposal_date: d.disposed_date,
      book_value_at_disposal: d.book_value,
      sale_value: d.sale_value || 0,
      gain_loss: (d.sale_value || 0) - d.book_value,
    });
  }

  return {
    report_type: "disposal_gain_loss",
    filters,
    timestamp: new Date().toISOString(),
    items: reportData,
  };
};

const generateRevaluationReport = async (
  db,
  tenantId,
  assets,
  startDate,
  endDate,
  filters,
) => {
  const rvSnap = await db
    .collection("asset_revaluations")
    .where("tenant_id", "==", tenantId)
    .where("revaluation_date", ">=", startDate)
    .where("revaluation_date", "<=", endDate)
    .get();

  const revals = rvSnap.docs.map((doc) => doc.data());
  const reportData = [];

  for (const r of revals) {
    const asset = assets.find((a) => a.id === r.asset_id);
    if (!asset && filters.branch_id) continue;

    reportData.push({
      asset_code: asset?.asset_code || r.asset_id,
      revaluation_date: r.revaluation_date,
      pre_revaluation_value: r.pre_value,
      revaluation_amount: r.amount,
      post_revaluation_value: r.post_value,
      reason: r.reason || "",
    });
  }

  return {
    report_type: "revaluation_report",
    filters,
    timestamp: new Date().toISOString(),
    items: reportData,
  };
};

const generateImpairmentReport = async (
  db,
  tenantId,
  assets,
  startDate,
  endDate,
  filters,
) => {
  const impSnap = await db
    .collection("asset_impairments")
    .where("tenant_id", "==", tenantId)
    .where("impairment_date", ">=", startDate)
    .where("impairment_date", "<=", endDate)
    .get();

  const impairments = impSnap.docs.map((doc) => doc.data());
  const reportData = [];

  for (const i of impairments) {
    const asset = assets.find((a) => a.id === i.asset_id);
    if (!asset && filters.branch_id) continue;

    reportData.push({
      asset_code: asset?.asset_code || i.asset_id,
      impairment_date: i.impairment_date,
      impairment_amount: i.amount,
      book_value_before: i.pre_value,
      book_value_after: i.post_value,
      reason: i.reason || "",
    });
  }

  return {
    report_type: "impairment_report",
    filters,
    timestamp: new Date().toISOString(),
    items: reportData,
  };
};

export const saveReportFilters = async (tenantId, userId, filters) => {
  const db = admin.firestore();
  const ref = db.collection("saved_reports").doc();
  const data = {
    id: ref.id,
    tenant_id: tenantId,
    user_id: userId,
    report_type: filters.reportType,
    name: filters.name || `Saved Report ${new Date().toISOString()}`,
    filters: filters,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };
  await ref.set(data);
  return data;
};

export const getSavedReports = async (tenantId, userId) => {
  const db = admin.firestore();
  const snap = await db
    .collection("saved_reports")
    .where("tenant_id", "==", tenantId)
    .where("user_id", "==", userId)
    .orderBy("created_at", "desc")
    .get();
  return snap.docs.map((doc) => doc.data());
};

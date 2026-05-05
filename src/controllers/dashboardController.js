import * as dashboardService from "../services/dashboardAggregatorService.js";

export const getDashboardKPIs = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const kpis = await dashboardService.getDashboardKPIs(tenant_id);
    res.json({ success: true, data: kpis });
  } catch (error) {
    next(error);
  }
};

export const getAssetValueTrend = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const data = await dashboardService.getAssetValueTrend(tenant_id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceCostTrend = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const data = await dashboardService.getMaintenanceCostTrend(tenant_id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAssetByCategory = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const data = await dashboardService.getAssetByCategory(tenant_id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAuditScoreHistory = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const data = await dashboardService.getAuditScoreHistory(tenant_id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

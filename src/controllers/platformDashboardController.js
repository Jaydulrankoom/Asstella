import { getPlatformKPIs } from "../services/tenantService.js";

/**
 * Controller to fetch platform dashboard KPIs
 * GET /platform/dashboard
 */
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const kpis = await getPlatformKPIs();
    return res.json({ success: true, data: kpis });
  } catch (error) {
    next(error);
  }
};

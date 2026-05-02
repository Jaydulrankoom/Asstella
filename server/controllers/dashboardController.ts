import { Response } from "express";
import { SaaSRequest } from "../middleware/auth";
import { dashboardAggregatorService } from "../services/dashboardAggregatorService";

export const dashboardController = {
  /**
   * GET /api/dashboard/kpis
   */
  async getDashboard(req: SaaSRequest, res: Response) {
    try {
      const tenantId = req.authUser!.tenantId;
      const kpis = await dashboardAggregatorService.getDashboardKPIs(tenantId);
      const activity = await dashboardAggregatorService.getRecentActivity(tenantId);
      
      res.json({
        success: true,
        data: {
          kpis,
          recentActivity: activity
        }
      });
    } catch (error: any) {
      console.error("Dashboard Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/dashboard/refresh
   * Force refresh the cache
   */
  async refreshCache(req: SaaSRequest, res: Response) {
    try {
      const tenantId = req.authUser!.tenantId;
      await dashboardAggregatorService.refreshDashboardCache(tenantId);
      res.json({ success: true, message: "Dashboard cache refreshed successfully." });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

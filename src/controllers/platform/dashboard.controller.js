import { PlatformDashboardService } from '../../services/platform/dashboard.service.js';
import { ok, fail } from '../../utils/response.js';

export class PlatformDashboardController {
  static async getKpis(req, res) {
    try {
      const kpis = await PlatformDashboardService.getKpis();
      return ok(res, kpis);
    } catch (error) {
      console.error('Dashboard KPI Error:', error);
      return fail(res, 'Failed to fetch dashboard KPIs', 'DASH_001', 500);
    }
  }

  static async getRevenueGraph(req, res) {
    try {
      const data = await PlatformDashboardService.getRevenueGraph();
      return ok(res, data);
    } catch (error) {
      return fail(res, 'Failed to fetch revenue graph', 'DASH_002', 500);
    }
  }

  static async getTenantGrowth(req, res) {
    try {
      const data = await PlatformDashboardService.getTenantGrowth();
      return ok(res, data);
    } catch (error) {
      return fail(res, 'Failed to fetch tenant growth', 'DASH_003', 500);
    }
  }

  static async getRecentActivity(req, res) {
    try {
      const data = await PlatformDashboardService.getRecentActivity();
      return ok(res, data);
    } catch (error) {
      return fail(res, 'Failed to fetch recent activity', 'DASH_004', 500);
    }
  }
}

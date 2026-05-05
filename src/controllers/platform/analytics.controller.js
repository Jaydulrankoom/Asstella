import { PlatformAnalyticsService } from '../../services/platform/analytics.service.js';
import { ok, fail } from '../../utils/response.js';

export class PlatformAnalyticsController {
  static async getGrowth(req, res) {
    try {
      const data = await PlatformAnalyticsService.getGrowth();
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }
}

import { PlatformSecurityService } from '../../services/platform/security.service.js';
import { ok, fail } from '../../utils/response.js';

export class PlatformSecurityController {
  static async listLogs(req, res) {
    try {
      const data = await PlatformSecurityService.listLogs(req.query);
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async getSuspicious(req, res) {
    try {
      const data = await PlatformSecurityService.getSuspicious();
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async getSummary(req, res) {
    try {
      const data = await PlatformSecurityService.getSummary();
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }
}

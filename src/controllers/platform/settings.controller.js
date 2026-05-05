import { PlatformSettingsService } from '../../services/platform/settings.service.js';
import { ok, fail } from '../../utils/response.js';

export class PlatformSettingsController {
  static async get(req, res) {
    try {
      const settings = await PlatformSettingsService.getSettings();
      return ok(res, settings);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async update(req, res) {
    try {
      const settings = await PlatformSettingsService.updateSettings(req.body);
      return ok(res, settings, 'Settings updated');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async addGps(req, res) {
    try {
      const result = await PlatformSettingsService.addGpsProvider(req.body);
      return ok(res, result, 'GPS provider added');
    } catch (error) {
      return fail(res, error.message);
    }
  }
}

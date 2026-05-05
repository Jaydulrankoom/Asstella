import { PlatformIntegrationService } from '../../services/platform/integration.service.js';
import { ok, fail } from '../../utils/response.js';

export class PlatformIntegrationController {
  // GPS
  static async addGps(req, res) {
    try {
      const data = await PlatformIntegrationService.addGpsProvider(req.body);
      return ok(res, data, 'GPS Provider added successfully');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async listGps(req, res) {
    try {
      const data = await PlatformIntegrationService.listGpsProviders();
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  // API Keys
  static async generateApiKey(req, res) {
    try {
      const { tenant_id, name } = req.body;
      const data = await PlatformIntegrationService.generateApiKey(tenant_id, name);
      return ok(res, data, 'API Key generated successfully');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async listApiKeys(req, res) {
    try {
      const data = await PlatformIntegrationService.listApiKeys();
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async revokeApiKey(req, res) {
    try {
      await PlatformIntegrationService.revokeApiKey(req.params.id);
      return ok(res, null, 'API Key revoked');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  // Webhooks
  static async createWebhook(req, res) {
    try {
      const data = await PlatformIntegrationService.createWebhook(req.body);
      return ok(res, data, 'Webhook created successfully');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async listWebhooks(req, res) {
    try {
      const data = await PlatformIntegrationService.listWebhooks();
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async testWebhook(req, res) {
    try {
      const data = await PlatformIntegrationService.testWebhook(req.params.id);
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async toggleWebhook(req, res) {
    try {
      const data = await PlatformIntegrationService.toggleWebhook(req.params.id);
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }
}

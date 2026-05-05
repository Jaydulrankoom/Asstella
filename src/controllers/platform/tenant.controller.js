import { PlatformTenantService } from '../../services/platform/tenant.service.js';
import { ok, fail } from '../../utils/response.js';

export class PlatformTenantController {
  static async list(req, res) {
    try {
      const data = await PlatformTenantService.listTenants(req.query);
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async get(req, res) {
    try {
      const data = await PlatformTenantService.getTenant(req.params.id);
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async create(req, res) {
    try {
      const data = await PlatformTenantService.createTenant(req.body, req.user.email);
      return ok(res, data, 'Tenant created successfully');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async updateStatus(req, res) {
    try {
      await PlatformTenantService.updateStatus(req.params.id, req.body, req.user.email);
      return ok(res, null, 'Status updated successfully');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async updatePlan(req, res) {
    try {
      const data = await PlatformTenantService.updatePlan(req.params.id, req.body, req.user.email);
      return ok(res, data, 'Plan updated successfully');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async getUsage(req, res) {
    try {
      const data = await PlatformTenantService.getUsage(req.params.id);
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async sendCredentials(req, res) {
    try {
      const data = await PlatformTenantService.sendCredentials(req.params.id, req.user.email);
      return ok(res, data, 'Credentials reset and sent');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async updateWhiteLabel(req, res) {
    try {
      const data = await PlatformTenantService.updateWhiteLabel(req.params.id, req.body, req.user.email);
      return ok(res, data, 'White label settings updated');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async onboard(req, res) {
    try {
      const data = await PlatformTenantService.onboardTenant(req.params.id, req.user.email);
      return ok(res, data, 'Tenant onboarded successfully');
    } catch (error) {
      return fail(res, error.message);
    }
  }
}

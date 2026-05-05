import { PlatformPlanService } from '../../services/platform/plan.service.js';
import { ok, fail } from '../../utils/response.js';

export class PlatformPlanController {
  static async list(req, res) {
    try {
      const plans = await PlatformPlanService.listPlans();
      return ok(res, plans);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async create(req, res) {
    try {
      const plan = await PlatformPlanService.createPlan(req.body);
      return ok(res, plan, 'Plan created successfully');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async update(req, res) {
    try {
      const plan = await PlatformPlanService.updatePlan(req.params.id, req.body);
      return ok(res, plan, 'Plan updated successfully');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async toggle(req, res) {
    try {
      const result = await PlatformPlanService.togglePlan(req.params.id);
      return ok(res, result, 'Plan status toggled');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async getTenants(req, res) {
    try {
      const tenants = await PlatformPlanService.getPlanTenants(req.params.id);
      return ok(res, tenants);
    } catch (error) {
      return fail(res, error.message);
    }
  }
}

import { PlatformBillingService } from '../../services/platform/billing.service.js';
import { ok, fail } from '../../utils/response.js';

export class PlatformBillingController {
  static async list(req, res) {
    try {
      const data = await PlatformBillingService.listInvoices(req.query);
      return ok(res, data);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async get(req, res) {
    try {
      const invoice = await PlatformBillingService.getInvoice(req.params.id);
      return ok(res, invoice);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async create(req, res) {
    try {
      const invoice = await PlatformBillingService.createInvoice(req.body);
      return ok(res, invoice, 'Invoice created successfully');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async updateStatus(req, res) {
    try {
      const result = await PlatformBillingService.updateStatus(req.params.id, req.body);
      return ok(res, result, 'Invoice status updated');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async getOverdue(req, res) {
    try {
      const overdue = await PlatformBillingService.getOverdueInvoices();
      return ok(res, overdue);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async getSummary(req, res) {
    try {
      const summary = await PlatformBillingService.getBillingSummary();
      return ok(res, summary);
    } catch (error) {
      return fail(res, error.message);
    }
  }
}

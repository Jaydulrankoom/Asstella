import { PlatformSupportService } from '../../services/platform/support.service.js';
import { ok, fail } from '../../utils/response.js';

export class PlatformSupportController {
  static async list(req, res) {
    try {
      const tickets = await PlatformSupportService.listTickets(req.query);
      return ok(res, tickets);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async get(req, res) {
    try {
      const ticket = await PlatformSupportService.getTicket(req.params.id);
      return ok(res, ticket);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async reply(req, res) {
    try {
      const result = await PlatformSupportService.addReply(req.params.id, req.body, req.user.email);
      return ok(res, result, 'Reply added');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async assign(req, res) {
    try {
      const result = await PlatformSupportService.assignTicket(req.params.id, req.body);
      return ok(res, result, 'Ticket assigned');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async getSummary(req, res) {
    try {
      const summary = await PlatformSupportService.getSlaSummary();
      return ok(res, summary);
    } catch (error) {
      return fail(res, error.message);
    }
  }
}

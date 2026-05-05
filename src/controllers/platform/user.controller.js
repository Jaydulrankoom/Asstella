import { PlatformUserService } from '../../services/platform/user.service.js';
import { ok, fail } from '../../utils/response.js';

export class PlatformUserController {
  static async list(req, res) {
    try {
      const users = await PlatformUserService.listUsers();
      return ok(res, users);
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async create(req, res) {
    try {
      const user = await PlatformUserService.createUser(req.body, req.user.email);
      return ok(res, user, 'Platform user created');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async updateRole(req, res) {
    try {
      const result = await PlatformUserService.updateRole(req.params.id, req.body, req.user.email);
      return ok(res, result, 'Role updated');
    } catch (error) {
      return fail(res, error.message);
    }
  }

  static async delete(req, res) {
    try {
      await PlatformUserService.deleteUser(req.params.id);
      return ok(res, null, 'User deleted');
    } catch (error) {
      return fail(res, error.message);
    }
  }
}

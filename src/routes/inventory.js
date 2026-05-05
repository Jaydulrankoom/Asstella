import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";
import { checkPermission } from "../middleware/permissionGuard.js";

const router = express.Router();

/**
 * Example Multi-tenant SaaS Route
 *
 * Step 1: verifyToken -> validates Bearer, sets req.authUser
 * Step 2: tenantGuard -> validate tenant object and subscription, sets req.tenant
 * Step 3: checkModule('inventory') -> ensures plan provides access to 'inventory'
 * Step 4: checkPermission('inventory', 'write') -> ensures user role permits 'write' in 'inventory'
 * Step 5: Route logic executes, unhandled errors caught by Global errorHandler
 */
router.post(
  "/inventory",
  verifyToken,
  tenantGuard,
  checkModule("inventory"),
  checkPermission("inventory", "write"),
  async (req, res, next) => {
    try {
      // 100% Guaranteed that auth is valid, tenant is paying & active,
      // module exists in plan, and user holds write permissions.

      const { tenant_id } = req.authUser;
      const data = req.body;

      // Perform write logic tied to `tenant_id`
      return res.status(201).json({
        success: true,
        message: "Inventory item created successfully",
        data: {
          tenant_id,
          ...data,
        },
      });
    } catch (error) {
      // Step 5: Handled efficiently by catching error and sending to global middleware
      next(error);
    }
  },
);

export default router;

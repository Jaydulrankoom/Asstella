import express from "express";
import * as tenantController from "../controllers/tenantController.js";
import * as platformDashboardController from "../controllers/platformDashboardController.js";

// If you had a platformAdminGuard, you would import it here to secure these routes:
// import { verifyToken } from '../middleware/verifyToken.js';
// import { checkPermission } from '../middleware/permissionGuard.js';

const router = express.Router();

/**
 * Tenant Management Module Routes
 * These routes should be protected by platform-admin level middleware.
 */

// Platform Dashboard
router.get(
  "/platform/dashboard",
  platformDashboardController.getDashboardMetrics,
);

// Tenant CRUD and Core Operations
router.post("/platform/tenants", tenantController.createTenant);
router.get("/platform/tenants", tenantController.listTenants);
router.get("/platform/tenants/:id", tenantController.getTenant);

// Status and Plans
router.patch(
  "/platform/tenants/:id/status",
  tenantController.changeTenantStatus,
);
router.post(
  "/platform/tenants/:id/upgrade",
  tenantController.upgradeTenantPlan,
);

// Billing and Setup
router.get("/platform/tenants/:id/invoice", tenantController.getTenantInvoices);
router.post("/platform/tenants/:id/onboarding", tenantController.onboarding);

export default router;

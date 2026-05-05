import express from "express";
import * as orgController from "../controllers/orgController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";
// import { checkPermission } from '../middleware/permissionGuard.js'; // optionally gate actions

const router = express.Router();

// All org routes require authentication and a valid active tenant
router.use(verifyToken);
router.use(tenantGuard);

// Ensure the tenant has the core modules assuming organization structure is base,
// but optionally you can check specific modules.

router.post("/org/branches", orgController.createBranch);
router.get("/org/branches", orgController.getBranches);
router.get("/org/branches/:id", orgController.getBranchById);
router.put("/org/branches/:id", orgController.updateBranch);
router.delete("/org/branches/:id", orgController.deleteBranch);

router.post(
  "/org/branches/:branchId/departments",
  orgController.createDepartment,
);
router.get(
  "/org/branches/:branchId/departments",
  orgController.getDepartmentsByBranch,
);

router.post("/org/locations", orgController.createLocation);
router.get("/org/locations/tree", orgController.getLocationTree);

router.get("/org/overview", orgController.getOrgOverview);

export default router;

import express from "express";
import { 
  verifyFirebaseToken, 
  loadTenantProfile, 
  loadUserPermissions, 
  checkPermission 
} from "../middleware/auth";
import { dashboardController } from "../controllers/dashboardController";

const router = express.Router();

const authStack = [verifyFirebaseToken, loadTenantProfile, loadUserPermissions];

/**
 * @route   GET /api/dashboard
 * @desc    Get executive dashboard KPIs and activity
 * @access  Private (Permission: dashboard.view)
 */
router.get("/", authStack, checkPermission("dashboard.view"), dashboardController.getDashboard);

/**
 * @route   POST /api/dashboard/refresh
 * @desc    Manually trigger cache refresh
 * @access  Private (Permission: dashboard.manage)
 */
router.post("/refresh", authStack, checkPermission("dashboard.manage"), dashboardController.refreshCache);

export default router;

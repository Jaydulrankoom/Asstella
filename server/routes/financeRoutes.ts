import express from "express";
import { 
  verifyFirebaseToken, 
  loadTenantProfile, 
  loadUserPermissions, 
  checkPermission 
} from "../middleware/auth";
import { financeController } from "../controllers/financeController";

const router = express.Router();

const authStack = [verifyFirebaseToken, loadTenantProfile, loadUserPermissions];

/**
 * @route   POST /api/finance/depreciation/run
 * @desc    Execute batch depreciation for a period
 * @access  Private (Permission: finance.calculate)
 */
router.post("/depreciation/run", authStack, checkPermission("finance.calculate"), financeController.runDepreciation);

/**
 * @route   GET /api/finance/depreciation/preview
 * @desc    Simulate depreciation for reporting
 * @access  Private (Permission: finance.view)
 */
router.get("/depreciation/preview", authStack, checkPermission("finance.view"), financeController.preview);

export default router;

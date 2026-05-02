import express from "express";
import { 
  verifyFirebaseToken, 
  loadTenantProfile, 
  loadUserPermissions, 
  checkPermission 
} from "../middleware/auth";
import { assetController } from "../controllers/assetController";

const router = express.Router();

// Middleware stack applied to all asset operations
// This ensures identity -> tenant validation -> permission resolution happens in order
const authStack = [verifyFirebaseToken, loadTenantProfile, loadUserPermissions];

/**
 * @route   GET /api/assets
 * @desc    Fetch fleet registry with filters
 * @access  Private (Permission: asset.view)
 */
router.get("/", authStack, checkPermission("asset.view"), assetController.list);

/**
 * @route   POST /api/assets
 * @desc    Register a new physical asset
 * @access  Private (Permission: asset.create)
 */
router.post("/", authStack, checkPermission("asset.create"), assetController.create);

/**
 * @route   GET /api/assets/scan/:code
 * @desc    Lookup asset by QR or Barcode
 * @access  Private (Permission: asset.view)
 */
router.get("/scan/:code", authStack, checkPermission("asset.view"), assetController.scan);

/**
 * @route   GET /api/assets/:id
 * @desc    Get full asset lifecycle details
 * @access  Private (Permission: asset.view)
 */
router.get("/:id", authStack, checkPermission("asset.view"), assetController.getDetail);

/**
 * @route   PUT /api/assets/:id
 * @desc    Update asset metadata or status
 * @access  Private (Permission: asset.edit)
 */
router.put("/:id", authStack, checkPermission("asset.edit"), assetController.update);

/**
 * @route   DELETE /api/assets/:id
 * @desc    Soft-delete (archive) an asset
 * @access  Private (Permission: asset.delete)
 */
router.delete("/:id", authStack, checkPermission("asset.delete"), assetController.remove);

export default router;

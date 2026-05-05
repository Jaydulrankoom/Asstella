import express from "express";
import * as assetController from "../controllers/assetController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";
// import { checkPermission } from '../middleware/permissionGuard.js'; // RBAC checks per route

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);

// Categories
router.post(
  "/asset-categories",
  checkModule("asset_register"),
  assetController.createCategory,
);
router.get(
  "/asset-categories",
  checkModule("asset_register"),
  assetController.getCategories,
);

// Core Asset Routes
router.post(
  "/assets",
  checkModule("asset_register"),
  assetController.createAsset,
);
router.get("/assets", checkModule("asset_register"), assetController.getAssets);
router.get(
  "/assets/:id",
  checkModule("asset_register"),
  assetController.getAssetById,
);
router.put(
  "/assets/:id",
  checkModule("asset_register"),
  assetController.updateAsset,
);
router.delete(
  "/assets/:id",
  checkModule("asset_register"),
  assetController.deleteAsset,
);

// Scan endpoint
router.get(
  "/assets/scan/:qr_code",
  checkModule("asset_register"),
  assetController.scanAsset,
);

// History and Docs
router.get(
  "/assets/:id/history",
  checkModule("asset_register"),
  assetController.getAssetHistory,
);
router.post(
  "/assets/:id/documents",
  checkModule("asset_register"),
  assetController.addAssetDocument,
);

export default router;

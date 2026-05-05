import express from "express";
import * as qrController from "../controllers/qrController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);

// We assume scanning requires asset_register module access at minimum
router.use(checkModule("asset_register"));

router.get("/qr/generate/:assetId", qrController.generateQRCode);
router.post("/qr/generate/bulk", qrController.generateBulkQR);
router.get("/qr/scan/:code", qrController.scanAsset);
router.post("/qr/print", qrController.printLabels);
router.get("/qr/scan-history/:assetId", qrController.getScanHistory);

export default router;

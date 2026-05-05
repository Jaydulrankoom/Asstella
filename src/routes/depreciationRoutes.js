import express from "express";
import * as depreciationController from "../controllers/depreciationController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);

// Requires core 'assets' or specifically 'finance' if we separate.
router.use(checkModule("assets"));

router.post(
  "/depreciation/preview",
  depreciationController.previewDepreciation,
);
router.post("/depreciation/run", depreciationController.runDepreciation);

export default router;

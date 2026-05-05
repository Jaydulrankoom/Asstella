import express from "express";
import * as disposalController from "../controllers/disposalController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);

// Requires core 'assets' or specifically 'finance'
router.use(checkModule("assets"));

router.get(
  "/disposals/calculate-gain-loss",
  disposalController.calculateGainLoss,
);
router.post("/disposals", disposalController.createDisposalRequest);
router.get("/disposals", disposalController.getDisposals);
router.put("/disposals/:id/approve", disposalController.approveDisposal);
router.put("/disposals/:id/complete", disposalController.completeDisposal);

export default router;

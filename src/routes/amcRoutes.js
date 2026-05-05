import express from "express";
import * as amcController from "../controllers/amcController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);

// Assuming 'maintenance' or 'procurement' covers AMC. Let's use maintenance for now.
router.use(checkModule("maintenance"));

router.post("/amc/contracts", amcController.createContract);
router.get("/amc/contracts", amcController.getContracts);
router.post("/amc/contracts/:id/renew", amcController.renewContract);
router.get("/amc/contracts/:id/sla", amcController.getSLACompliance);

router.post("/amc/contracts/:id/visits", amcController.scheduleVisit);
router.get("/amc/contracts/:id/visits", amcController.getVisits);
router.put(
  "/amc/visits/:visitId/complete",
  amcController.recordVisitCompletion,
);

router.get(
  "/amc/vendors/:vendorId/scorecard",
  amcController.getVendorScorecard,
);

export default router;

import express from "express";
import * as auditController from "../controllers/auditController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);
router.use(checkModule("audit"));

router.post("/audits/campaigns", auditController.createCampaign);
router.get("/audits/campaigns", auditController.getCampaigns);
router.get(
  "/audits/campaigns/:id/download",
  auditController.downloadCampaignData,
);
router.get("/audits/campaigns/:id/results", auditController.getCampaignResults);

router.post("/audits/campaigns/:id/scan", auditController.submitScan);
router.post("/audits/campaigns/:id/bulk-scan", auditController.submitBulkSync);
router.put("/audits/campaigns/:id/complete", auditController.completeCampaign);

export default router;

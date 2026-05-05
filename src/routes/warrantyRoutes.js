import express from "express";
import * as warrantyController from "../controllers/warrantyController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);

// We check if warranty is implicitly present. For now we assume 'maintenance' module gives access to warranties
router.use(checkModule("maintenance"));

router.get("/warranty/eligibility", warrantyController.checkClaimEligibility);
router.post("/warranty/claims", warrantyController.createClaim);
router.get("/warranty/claims", warrantyController.getClaims);
router.put(
  "/warranty/claims/:id/vendor-response",
  warrantyController.updateVendorResponse,
);
router.put("/warranty/claims/:id/resolve", warrantyController.resolveClaim);

router.get("/warranty/analytics", warrantyController.getWarrantyAnalytics);

export default router;

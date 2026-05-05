import express from "express";
import * as integrationController from "../controllers/integrationController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";

const router = express.Router();

// Webhook endpoint does not require verifyToken (it uses HMAC)
router.post(
  "/webhooks/inbound/:tenantId/:integrationId",
  integrationController.handleInboundWebhook,
);

router.use(verifyToken);
router.use(tenantGuard);

// API Integration hub features
router.use(checkModule("integrations"));

router.post("/integrations", integrationController.createIntegration);
router.post("/integrations/:id/test", integrationController.testConnection);
router.post("/integrations/:id/sync", integrationController.syncAssets);
router.put("/integrations/:id/rotate-keys", integrationController.rotateApiKey);
router.post(
  "/integrations/:id/webhooks",
  integrationController.registerWebhook,
);

export default router;

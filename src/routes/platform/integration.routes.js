import { Router } from 'express';
import { PlatformIntegrationController } from '../../controllers/platform/integration.controller.js';

const router = Router();

// GPS
router.get('/gps-providers', PlatformIntegrationController.listGps);
router.post('/gps-providers', PlatformIntegrationController.addGps);

// API Keys
router.get('/api-keys', PlatformIntegrationController.listApiKeys);
router.post('/api-keys/generate', PlatformIntegrationController.generateApiKey);
router.delete('/api-keys/:id', PlatformIntegrationController.revokeApiKey);

// Webhooks
router.get('/webhooks', PlatformIntegrationController.listWebhooks);
router.post('/webhooks', PlatformIntegrationController.createWebhook);
router.post('/webhooks/:id/test', PlatformIntegrationController.testWebhook);
router.patch('/webhooks/:id/toggle', PlatformIntegrationController.toggleWebhook);

export default router;

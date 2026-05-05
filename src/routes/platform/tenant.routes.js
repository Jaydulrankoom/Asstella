import { Router } from 'express';
import { PlatformTenantController } from '../../controllers/platform/tenant.controller.js';

const router = Router();

router.get('/', PlatformTenantController.list);
router.get('/:id', PlatformTenantController.get);
router.post('/', PlatformTenantController.create);
router.patch('/:id/status', PlatformTenantController.updateStatus);
router.patch('/:id/plan', PlatformTenantController.updatePlan);
router.get('/:id/usage', PlatformTenantController.getUsage);
router.post('/:id/send-credentials', PlatformTenantController.sendCredentials);
router.patch('/:id/white-label', PlatformTenantController.updateWhiteLabel);
router.post('/:id/onboard', PlatformTenantController.onboard);

export default router;

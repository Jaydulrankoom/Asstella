import { Router } from 'express';
import { PlatformPlanController } from '../../controllers/platform/plan.controller.js';

const router = Router();

router.get('/', PlatformPlanController.list);
router.post('/', PlatformPlanController.create);
router.put('/:id', PlatformPlanController.update);
router.patch('/:id/toggle', PlatformPlanController.toggle);
router.get('/:id/tenants', PlatformPlanController.getTenants);

export default router;

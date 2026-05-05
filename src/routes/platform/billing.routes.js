import { Router } from 'express';
import { PlatformBillingController } from '../../controllers/platform/billing.controller.js';

const router = Router();

router.get('/invoices', PlatformBillingController.list);
router.get('/invoices/:id', PlatformBillingController.get);
router.post('/invoices', PlatformBillingController.create);
router.patch('/invoices/:id/status', PlatformBillingController.updateStatus);
router.get('/overdue', PlatformBillingController.getOverdue);
router.get('/summary', PlatformBillingController.getSummary);

export default router;

import express from 'express';
import { PlatformSupportController } from '../../controllers/platform/support.controller.js';

const router = express.Router();

router.get('/tickets', PlatformSupportController.list);
router.get('/summary', PlatformSupportController.getSummary);
router.get('/tickets/:id', PlatformSupportController.get);
router.post('/tickets/:id/reply', PlatformSupportController.reply);
router.patch('/tickets/:id/assign', PlatformSupportController.assign);

export default router;

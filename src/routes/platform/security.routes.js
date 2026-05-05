import express from 'express';
import { PlatformSecurityController } from '../../controllers/platform/security.controller.js';

const router = express.Router();

router.get('/logs', PlatformSecurityController.listLogs);
router.get('/suspicious', PlatformSecurityController.getSuspicious);
router.get('/summary', PlatformSecurityController.getSummary);

export default router;

import express from 'express';
import { PlatformAnalyticsController } from '../../controllers/platform/analytics.controller.js';

const router = express.Router();

router.get('/growth', PlatformAnalyticsController.getGrowth);

export default router;

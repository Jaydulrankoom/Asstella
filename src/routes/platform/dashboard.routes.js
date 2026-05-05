import { Router } from 'express';
import { PlatformDashboardController } from '../../controllers/platform/dashboard.controller.js';

const router = Router();

router.get('/kpis', PlatformDashboardController.getKpis);
router.get('/revenue-graph', PlatformDashboardController.getRevenueGraph);
router.get('/tenant-growth', PlatformDashboardController.getTenantGrowth);
router.get('/recent-activity', PlatformDashboardController.getRecentActivity);

export default router;

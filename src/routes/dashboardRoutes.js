import express from "express";
import * as dashboardController from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);

router.get("/dashboard/kpis", dashboardController.getDashboardKPIs);
router.get(
  "/dashboard/asset-value-trend",
  dashboardController.getAssetValueTrend,
);
router.get(
  "/dashboard/maintenance-cost-trend",
  dashboardController.getMaintenanceCostTrend,
);
router.get(
  "/dashboard/asset-by-category",
  dashboardController.getAssetByCategory,
);
router.get(
  "/dashboard/audit-score-history",
  dashboardController.getAuditScoreHistory,
);

export default router;

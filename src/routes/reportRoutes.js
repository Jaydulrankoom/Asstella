import express from "express";
import * as reportController from "../controllers/reportController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);
router.use(checkModule("reports")); // Assuming 'reports' is a module

router.post("/reports/generate", reportController.generateReport);
router.post("/reports/export/pdf", reportController.exportToPdf);
router.post("/reports/export/excel", reportController.exportToExcel);
router.get("/reports/saved", reportController.getSavedReports);
router.post("/reports/saved", reportController.saveReportFilters);

export default router;

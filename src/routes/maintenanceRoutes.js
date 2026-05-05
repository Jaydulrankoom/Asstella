import express from "express";
import * as maintenanceController from "../controllers/maintenanceController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);
router.use(checkModule("maintenance"));

router.post("/maintenance/tickets", maintenanceController.createTicket);
router.get("/maintenance/tickets", maintenanceController.getTickets);
router.put(
  "/maintenance/tickets/:id/assign",
  maintenanceController.assignTicket,
);
router.put(
  "/maintenance/tickets/:id/progress",
  maintenanceController.updateProgress,
);
router.put("/maintenance/tickets/:id/close", maintenanceController.closeTicket);

router.post("/maintenance/schedules", maintenanceController.createSchedule);
router.get("/maintenance/schedules", maintenanceController.getSchedules);

export default router;

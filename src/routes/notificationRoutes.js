import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);

router.get("/notifications", notificationController.getMyNotifications);
router.put("/notifications/mark-read", notificationController.markAsRead);

router.get("/notifications/settings", notificationController.getSettings);
router.post("/notifications/settings", notificationController.updateSettings);

export default router;

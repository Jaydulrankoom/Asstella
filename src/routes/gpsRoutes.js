import express from "express";
import * as gpsController from "../controllers/gpsController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { tenantGuard } from "../middleware/tenantGuard.js";
import { checkModule } from "../middleware/subscriptionGuard.js";

const router = express.Router();

router.use(verifyToken);
router.use(tenantGuard);

// GPS usually part of a fleet or specialized module
router.use(checkModule("fleet_management"));

router.post("/gps/geofences", gpsController.createGeofence);
router.get("/gps/geofences", gpsController.getGeofences);
router.post("/gps/vehicles", gpsController.linkVehicleGPS);
router.get("/gps/logs", gpsController.getTrackingLogs);

export default router;

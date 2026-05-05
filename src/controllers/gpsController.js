import * as gpsPollingService from "../services/gpsPollingService.js";
import admin from "firebase-admin";

// Endpoints to manage Geofences and Vehicles
export const createGeofence = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const db = admin.firestore();
    const docRef = db.collection("geofence_zones").doc();
    const zoneData = {
      id: docRef.id,
      tenant_id,
      is_active: true,
      ...req.body,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    await docRef.set(zoneData);
    res.status(201).json({ success: true, data: zoneData });
  } catch (error) {
    next(error);
  }
};

export const getGeofences = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const db = admin.firestore();
    const snap = await db
      .collection("geofence_zones")
      .where("tenant_id", "==", tenant_id)
      .get();
    res.json({ success: true, data: snap.docs.map((doc) => doc.data()) });
  } catch (error) {
    next(error);
  }
};

export const linkVehicleGPS = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { assetId, gps_device_id, max_speed_kmh } = req.body;
    const db = admin.firestore();

    // ensure asset exists
    const assetRef = db.collection("assets").doc(assetId);
    const assetSnap = await assetRef.get();
    if (!assetSnap.exists || assetSnap.data().tenant_id !== tenant_id) {
      return res
        .status(404)
        .json({ success: false, message: "Asset not found" });
    }

    const vRef = db.collection("vehicle_assets").doc(assetId);
    await vRef.set(
      {
        asset_id: assetId,
        tenant_id,
        gps_device_id,
        max_speed_kmh,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    res.json({ success: true, message: "Vehicle linked to GPS successfully" });
  } catch (error) {
    next(error);
  }
};

export const getTrackingLogs = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { vehicleId, startTime, endTime } = req.query;
    const db = admin.firestore();

    let query = db
      .collection("gps_tracking_logs")
      .where("tenant_id", "==", tenant_id)
      .where("vehicle_id", "==", vehicleId);

    if (startTime) query = query.where("pinged_at", ">=", new Date(startTime));
    if (endTime) query = query.where("pinged_at", "<=", new Date(endTime));

    const snap = await query.orderBy("pinged_at", "asc").limit(1000).get();
    res.json({ success: true, data: snap.docs.map((doc) => doc.data()) });
  } catch (error) {
    next(error);
  }
};

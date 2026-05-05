import admin from "firebase-admin";

// Haversine formula to calculate distance in meters between two points
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const x1 = (lat1 * Math.PI) / 180;
  const x2 = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(x1) * Math.cos(x2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const isPointInCircle = (point, center, radiusMeters) => {
  const distance = haversineDistance(
    point.lat,
    point.lng,
    center.lat,
    center.lng,
  );
  return distance <= radiusMeters;
};

// Ray-casting algorithm
export const isPointInPolygon = (point, polygon) => {
  const { lat, lng } = point;
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat,
      yi = polygon[i].lng;
    const xj = polygon[j].lat,
      yj = polygon[j].lng;

    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) isInside = !isInside;
  }
  return isInside;
};

export const evaluateVehicleGeofence = async (
  tenantId,
  vehicleId,
  currentLat,
  currentLng,
) => {
  const db = admin.firestore();

  // 1. Load active geofence rules
  const zonesSnap = await db
    .collection("geofence_zones")
    .where("tenant_id", "==", tenantId)
    .where("is_active", "==", true)
    // Normally, querying array-contains for applicable_vehicle_ids would be here.
    // Assuming we fetch all and filter or the array-contains query:
    .where("applicable_vehicle_ids", "array-contains", vehicleId)
    .get();

  const point = { lat: currentLat, lng: currentLng };
  const alertsToCreate = [];

  for (const doc of zonesSnap.docs) {
    const zone = doc.data();
    let isInsideNow = false;

    if (zone.shape_type === "circle") {
      isInsideNow = isPointInCircle(
        point,
        { lat: zone.center_lat, lng: zone.center_lng },
        zone.radius_meters,
      );
    } else if (zone.shape_type === "polygon" && zone.polygon_coordinates_json) {
      try {
        const coords = JSON.parse(zone.polygon_coordinates_json);
        isInsideNow = isPointInPolygon(point, coords);
      } catch (e) {
        console.error("Invalid polygon JSON:", e);
      }
    }

    // 2. Detect status change (Requires previous state)
    // For performance, we'd store the last known zone states on the vehicle document or a specific state document.
    const vehicleDoc = await db
      .collection("vehicle_assets")
      .doc(vehicleId)
      .get();
    const vehicleData = vehicleDoc.exists ? vehicleDoc.data() : {};
    const zoneStateKey = `zone_status_${doc.id}`;
    const previousState = vehicleData[zoneStateKey] || "unknown";

    let triggeredAlert = null;

    if (
      isInsideNow &&
      previousState === "outside" &&
      ["both", "entry"].includes(zone.alert_on)
    ) {
      triggeredAlert = "geofence_entry";
    } else if (
      !isInsideNow &&
      previousState === "inside" &&
      ["both", "exit"].includes(zone.alert_on)
    ) {
      triggeredAlert = "geofence_breach"; // e.g. exit
    }

    if (triggeredAlert) {
      alertsToCreate.push({
        id: db.collection("gps_alerts").doc().id,
        tenant_id: tenantId,
        vehicle_id: vehicleId,
        alert_type: triggeredAlert,
        lat: currentLat,
        lng: currentLng,
        zone_id: doc.id,
        triggered_at: admin.firestore.FieldValue.serverTimestamp(),
        acknowledged_by: null,
      });
      // Trigger FCM push via generic notification mechanism
      await db.collection("notifications").add({
        tenant_id: tenantId,
        title: `Geofence Alert: ${zone.name}`,
        body: `Vehicle triggered ${triggeredAlert} on zone ${zone.name}`,
        read: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Update state
    if (
      (isInsideNow && previousState !== "inside") ||
      (!isInsideNow && previousState !== "outside")
    ) {
      await db
        .collection("vehicle_assets")
        .doc(vehicleId)
        .update({
          [zoneStateKey]: isInsideNow ? "inside" : "outside",
        });
    }
  }

  // Batch insert alerts
  if (alertsToCreate.length > 0) {
    const batch = db.batch();
    for (const alert of alertsToCreate) {
      batch.set(db.collection("gps_alerts").doc(alert.id), alert);
    }
    await batch.commit();
  }
};

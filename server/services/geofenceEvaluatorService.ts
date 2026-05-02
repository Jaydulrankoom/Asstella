import admin from "firebase-admin";
import { db } from "../middleware/auth";

/**
 * Service to evaluate spatial rules for vehicles.
 */
export const geofenceEvaluatorService = {
  /**
   * Haversine formula for distance between two points in KM
   */
  getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Ray-casting algorithm for Point-in-Polygon check
   */
  isPointInPolygon(latitude: number, longitude: number, polygon: { lat: number; lng: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lat, yi = polygon[i].lng;
        const xj = polygon[j].lat, yj = polygon[j].lng;

        const intersect = ((yi > longitude) !== (yj > longitude)) &&
            (latitude < (xj - xi) * (longitude - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
  },

  /**
   * Evaluates a single vehicle's location against its geofence rules
   */
  async evaluateGeofence(tenantId: string, vehicleId: string, latitude: number, longitude: number) {
    const rulesSnapshot = await db.collection("tenants").doc(tenantId)
      .collection("geofence_rules")
      .where("isActive", "==", true)
      .where("vehicleIds", "array-contains", vehicleId)
      .get();

    for (const doc of rulesSnapshot.docs) {
      const rule = doc.data();
      let isInside = false;

      if (rule.type === "circular") {
        const distance = this.getDistance(latitude, longitude, rule.center.lat, rule.center.lng);
        isInside = distance <= rule.radius;
      } else if (rule.type === "polygon") {
        isInside = this.isPointInPolygon(latitude, longitude, rule.points);
      }

      // Check for state change
      const vehicleRef = db.collection("tenants").doc(tenantId).collection("vehicles").doc(vehicleId);
      const vehicleData = (await vehicleRef.get()).data();
      const lastStatus = (vehicleData?.geofenceStatus || {})[doc.id];

      if (lastStatus !== undefined && lastStatus !== isInside) {
        // Trigger alert
        const alertType = isInside ? "entry" : "exit";
        await db.collection("tenants").doc(tenantId).collection("gps_alerts").add({
          vehicleId,
          geofenceId: doc.id,
          type: `geofence_${alertType}`,
          message: `Vehicle ${vehicleData?.code || vehicleId} ${alertType}ed geofence: ${rule.name}`,
          latitude,
          longitude,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update status
        await vehicleRef.set({
          geofenceStatus: {
            ...vehicleData?.geofenceStatus,
            [doc.id]: isInside
          }
        }, { merge: true });
      }
    }
  },

  /**
   * Batch process for all vehicles in a tenant
   */
  async batchEvaluateAllVehicles(tenantId: string) {
    const activeVehicles = await db.collection("tenants").doc(tenantId)
      .collection("vehicles")
      .where("isGpsEnabled", "==", true)
      .get();

    for (const vDoc of activeVehicles.docs) {
      const v = vDoc.data();
      if (v.lastLocation) {
        await this.evaluateGeofence(tenantId, vDoc.id, v.lastLocation.latitude, v.lastLocation.longitude);
      }
    }
  }
};

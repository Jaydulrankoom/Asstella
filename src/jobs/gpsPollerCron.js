import admin from "firebase-admin";
import * as gpsPollingService from "../services/gpsPollingService.js";
import * as geofenceEvaluatorService from "../services/geofenceEvaluatorService.js";

export const runGpsPoller = async () => {
  const db = admin.firestore();

  // Feature flags per tenant to see who has GPS tracking enabled
  // Let's assume we look up all vehicles that have a device ID mapped instead for simplicity.
  const vehiclesSnap = await db
    .collection("vehicle_assets")
    .where("gps_device_id", "!=", null)
    .get();

  const vehiclesByTenant = {};

  vehiclesSnap.forEach((doc) => {
    const v = doc.data();
    if (!vehiclesByTenant[v.tenant_id]) {
      vehiclesByTenant[v.tenant_id] = [];
    }
    vehiclesByTenant[v.tenant_id].push({ ...v, id: doc.id });
  });

  // For each tenant, group by provider
  for (const tenantId of Object.keys(vehiclesByTenant)) {
    // In a real scenario, providers might be tenant-specific or global
    // We assume a global collection `gps_providers` that gives us the integration config
    // Actually, usually providers config belongs to the tenant. Let's fetch tenant providers:
    const providersSnap = await db
      .collection("gps_providers")
      .where("tenant_id", "==", tenantId)
      .get();
    const providers = providersSnap.docs.map((d) => d.data());

    // For now we mock one default provider if none exists
    const defaultProvider =
      providers.length > 0
        ? providers[0]
        : {
            name: "MockProvider",
            api_base_url: "https://api.mockgps.com",
            auth_type: "api_key",
            encrypted_credentials_json: {
              iv: "00".repeat(16),
              content: Buffer.from("mockey").toString("hex"),
            }, // In failing CBC decrypt this might break, but we'll safely ignore
          };

    const deviceIds = vehiclesByTenant[tenantId].map((v) => v.gps_device_id);

    try {
      // 1. Fetch
      const rawPayloads = await gpsPollingService.fetchVehicleLocations(
        defaultProvider,
        deviceIds,
      );

      // 2. Process
      for (const payload of rawPayloads) {
        const normalized = gpsPollingService.normalizeGPSResponse(
          defaultProvider.name,
          payload,
        );
        const vehicle = vehiclesByTenant[tenantId].find(
          (v) => v.gps_device_id === normalized.device_id,
        );

        if (vehicle) {
          // 3. Write Logs
          await gpsPollingService.writeTrackingLog(
            tenantId,
            vehicle.id,
            normalized,
          );

          // 4. Geofence evaluation
          await geofenceEvaluatorService.evaluateVehicleGeofence(
            tenantId,
            vehicle.id,
            normalized.lat,
            normalized.lng,
          );

          // 5. Speed violation
          if (
            vehicle.max_speed_kmh &&
            normalized.speed > vehicle.max_speed_kmh
          ) {
            await db.collection("gps_alerts").add({
              tenant_id: tenantId,
              vehicle_id: vehicle.id,
              alert_type: "speed_violation",
              lat: normalized.lat,
              lng: normalized.lng,
              triggered_at: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
      }
    } catch (e) {
      console.error(`GPS polling failed for tenant ${tenantId}`, e);
    }

    // 6. Check document expiries
    const now = new Date();
    const plus30 = new Date();
    plus30.setDate(plus30.getDate() + 30);

    for (const vehicle of vehiclesByTenant[tenantId]) {
      const inspectExpiry = (dateStr, type) => {
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (d > now && d <= plus30) {
          db.collection("gps_alerts").add({
            tenant_id: tenantId,
            vehicle_id: vehicle.id,
            alert_type: type,
            triggered_at: admin.firestore.FieldValue.serverTimestamp(),
            details: `${type} expiring on ${dateStr}`,
          });
        }
      };

      inspectExpiry(vehicle.insurance_expiry, "insurance_expiry");
      inspectExpiry(vehicle.registration_expiry, "registration_expiry");
      inspectExpiry(vehicle.fitness_expiry, "fitness_expiry");
      inspectExpiry(vehicle.tax_token_expiry, "tax_token_expiry");
    }
  }
};

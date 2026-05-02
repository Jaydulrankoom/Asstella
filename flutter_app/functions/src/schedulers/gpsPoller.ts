import admin from "firebase-admin";
import { db } from "../../../../server/middleware/auth";
import { gpsPollingService } from "../../../../server/services/gpsPollingService";
import { geofenceEvaluatorService } from "../../../../server/services/geofenceEvaluatorService";
import { vehicleComplianceService } from "../../../../server/services/vehicleComplianceService";

/**
 * Main logic for the GPS Polling Scheduler.
 */
export const runGpsPollTask = async () => {
    console.log("[Scheduler] Starting GPS Polling Task...");
    
    // 1. Fetch all tenants with GPS enabled
    const tenantsSnapshot = await db.collection("tenants").where("features.gps", "==", true).get();

    for (const tDoc of tenantsSnapshot.docs) {
        const tenantId = tDoc.id;
        try {
            // 2. Fetch GPS Providers for this tenant
            const providersSnapshot = await db.collection("tenants").doc(tenantId).collection("gps_providers").get();
            const providers = providersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            if (providers.length === 0) continue;

            // 3. For each active vehicle, fetch latest location
            const vehiclesSnapshot = await db.collection("tenants").doc(tenantId)
                .collection("vehicles")
                .where("isGpsEnabled", "==", true)
                .get();

            for (const vDoc of vehiclesSnapshot.docs) {
                const vehicle = vDoc.data();
                const provider = providers.find(p => p.id === vehicle.gpsProviderId);
                
                if (provider && vehicle.deviceId) {
                    try {
                        const location = await gpsPollingService.fetchVehicleLocation(tenantId, provider, vehicle.deviceId);
                        
                        // Update vehicle with latest telemetry
                        await vDoc.ref.update({
                            lastLocation: location,
                            "telemetry.history": admin.firestore.FieldValue.arrayUnion({
                                ...location,
                                polledAt: new Date().toISOString()
                            })
                        });

                        // 4. Evaluate Geofences
                        await geofenceEvaluatorService.evaluateGeofence(tenantId, vDoc.id, location.latitude, location.longitude);
                    } catch (vErr) {
                        console.error(`Error polling vehicle ${vDoc.id} for tenant ${tenantId}:`, vErr);
                    }
                }
            }

            // 5. Periodic Compliance Checks (e.g., once a day, but here checking thresholds)
            await vehicleComplianceService.checkExpiryAlerts(tenantId);

        } catch (tErr) {
            console.error(`Error processing tenant ${tenantId}:`, tErr);
        }
    }

    console.log("[Scheduler] GPS Polling Task Completed.");
};

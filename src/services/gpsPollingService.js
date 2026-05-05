import admin from "firebase-admin";
import crypto from "crypto";

// In a real app, you'd use a strong, environment-provided key.
// We'll mock a default one for this demonstration.
const ENCRYPTION_KEY =
  process.env.GPS_ENCRYPTION_KEY || "12345678901234567890123456789012";

export const decryptCredentials = (encryptedJsonObj) => {
  // Expected structure: { iv: '...', content: '...' }
  try {
    if (!encryptedJsonObj || !encryptedJsonObj.iv) return null;
    const { iv, content } = encryptedJsonObj;
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY),
      Buffer.from(iv, "hex"),
    );
    // Since GCM needs auth tag, let's assume standard AES-256-CBC for simplicity if GCM tag is missing,
    // or assume we have the tag appended. We'll use simple CBC in this mock.
    const decCbc = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      Buffer.from(iv, "hex"),
    );
    let decrypted = decCbc.update(content, "hex", "utf8");
    decrypted += decCbc.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
};

export const fetchVehicleLocations = async (provider, deviceIds) => {
  const credentials = decryptCredentials(provider.encrypted_credentials_json);

  if (!credentials) {
    throw new Error("Failed to decrypt GPS provider credentials.");
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (provider.auth_type === "api_key") {
    headers["x-api-key"] = credentials;
  } else if (provider.auth_type === "bearer") {
    headers["Authorization"] = `Bearer ${credentials}`;
  } else if (provider.auth_type === "basic") {
    headers["Authorization"] =
      `Basic ${Buffer.from(credentials).toString("base64")}`;
  }

  // Construct query params or payload based on API requirement
  const url = `${provider.api_base_url}?devices=${deviceIds.join(",")}`;

  // Mocking the fetch to external GPS provider APIs for the ERP
  // const response = await fetch(url, { headers });
  // const json = await response.json();

  // Return mocked payload for demo
  const mockPayload = deviceIds.map((id) => ({
    deviceId: id,
    latitude: 40.7128 + Math.random() * 0.01,
    longitude: -74.006 + Math.random() * 0.01,
    speedKmph: Math.random() * 80,
    engineOn: Math.random() > 0.5,
    fuelPercent: Math.random() * 100,
    odometerKm: 15000 + Math.random() * 100,
    timestamp: new Date().toISOString(),
  }));

  return mockPayload;
};

export const normalizeGPSResponse = (providerName, rawData) => {
  // Different providers have different JSON structures.
  // We map them to a unified format.
  // Since we mocked above, we assume the mock format here:
  return {
    device_id: rawData.deviceId,
    lat: rawData.latitude,
    lng: rawData.longitude,
    speed: rawData.speedKmph,
    ignition: rawData.engineOn,
    fuel: rawData.fuelPercent,
    odometer: rawData.odometerKm,
    timestamp: rawData.timestamp,
    raw: JSON.stringify(rawData),
  };
};

export const writeTrackingLog = async (tenantId, vehicleId, normalizedData) => {
  const db = admin.firestore();

  const logRef = db.collection("gps_tracking_logs").doc();
  const logData = {
    id: logRef.id,
    tenant_id: tenantId,
    vehicle_id: vehicleId,
    lat: normalizedData.lat,
    lng: normalizedData.lng,
    speed: normalizedData.speed,
    heading: normalizedData.heading || 0,
    ignition: normalizedData.ignition,
    fuel_level: normalizedData.fuel,
    odometer: normalizedData.odometer,
    pinged_at: new Date(normalizedData.timestamp),
    raw_payload_json: normalizedData.raw,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await logRef.set(logData);

  // Update vehicle's last known location
  await db
    .collection("vehicle_assets")
    .doc(vehicleId)
    .update({
      last_known_lat: normalizedData.lat,
      last_known_lng: normalizedData.lng,
      last_ping_time: new Date(normalizedData.timestamp),
      current_speed: normalizedData.speed,
      ignition: normalizedData.ignition,
      odometer: normalizedData.odometer,
    });

  return logData;
};

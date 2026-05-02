import axios from "axios";
import crypto from "crypto";
import admin from "firebase-admin";
import { db } from "../middleware/auth";

// Encryption Configuration
const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.GPS_ENCRYPTION_KEY || "01234567890123456789012345678901"; // 32 bytes
const IV_LENGTH = 12;

/**
 * Service to poll GPS data from third-party providers.
 */
export const gpsPollingService = {
  /**
   * Helper to decrypt provider credentials
   */
  decrypt(text: string) {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const authTag = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, undefined, "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  },

  /**
   * Encrypt helper (for manual/initial setup)
   */
  encrypt(text: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  },

  /**
   * Exponential backoff retry wrapper
   */
  async withRetry(fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.withRetry(fn, retries - 1, delay * 2);
    }
  },

  /**
   * Fetches latest location for a specific vehicle device
   */
  async fetchVehicleLocation(tenantId: string, provider: any, deviceId: string) {
    const authType = provider.authType; // API_KEY, BASIC, BEARER
    const decryptedCreds = provider.credentials ? this.decrypt(provider.credentials) : "";
    
    let headers: any = {};
    if (authType === "API_KEY") {
      headers[provider.apiKeyHeader || "X-API-KEY"] = decryptedCreds;
    } else if (authType === "BASIC") {
      headers["Authorization"] = `Basic ${Buffer.from(decryptedCreds).toString("base64")}`;
    } else if (authType === "BEARER") {
      headers["Authorization"] = `Bearer ${decryptedCreds}`;
    }

    const response = await this.withRetry(async () => {
      return await axios.get(`${provider.apiUrl}/${deviceId}`, { headers, timeout: 5000 });
    });

    // Log raw payload
    await db.collection("tenants").doc(tenantId).collection("gps_tracking_logs").add({
      deviceId,
      providerId: provider.id,
      raw_payload: response.data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Provider-specific mapping (Simplified placeholder logic)
    // In production, we would use a registry of mappers based on provider.type
    return {
      latitude: response.data.lat || response.data.latitude,
      longitude: response.data.lng || response.data.longitude,
      speed: response.data.speed || 0,
      ignition: response.data.ignition === true || response.data.ign === 1,
      fuel_level: response.data.fuel || 100,
      odometer: response.data.odo || 0,
      timestamp: new Date().toISOString(),
    };
  }
};

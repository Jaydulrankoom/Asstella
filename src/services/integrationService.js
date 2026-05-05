import admin from "firebase-admin";
import crypto from "crypto";

const ENCRYPTION_KEY =
  process.env.INTEGRATION_ENCRYPTION_KEY || "12345678901234567890123456789012";

export const encryptCredentials = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return { iv: iv.toString("hex"), content: encrypted, authTag };
};

export const decryptCredentials = (encryptedJsonObj) => {
  if (!encryptedJsonObj || !encryptedJsonObj.iv) return null;
  try {
    const { iv, content, authTag } = encryptedJsonObj;
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY),
      Buffer.from(iv, "hex"),
    );
    if (authTag) decipher.setAuthTag(Buffer.from(authTag, "hex"));
    let decrypted = decipher.update(content, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
};

export const createIntegration = async (tenantId, config, userId) => {
  const db = admin.firestore();

  // 1. Validate connection test (Mocked logic for demo)
  if (config.auth_type !== "webhook_only") {
    if (!config.base_url)
      throw new Error("Base URL is required for this auth type.");
  }

  // 2. Encrypt credentials
  const rawAuth =
    typeof config.auth_config === "object"
      ? JSON.stringify(config.auth_config)
      : config.auth_config;
  const encrypted_auth_config_json = encryptCredentials(rawAuth);

  const integrationRef = db.collection("integrations").doc();
  const integrationData = {
    id: integrationRef.id,
    tenant_id: tenantId,
    integration_name: config.integration_name,
    integration_type: config.integration_type || "custom",
    direction: config.direction || "bidirectional",
    auth_type: config.auth_type || "api_key",
    base_url: config.base_url || "",
    encrypted_auth_config_json,
    sync_frequency: config.sync_frequency || "manual",
    last_sync_status: null,
    field_mapping_json: config.field_mapping_json || "{}",
    transformation_rules_json: config.transformation_rules_json || "{}",
    is_active: true,
    created_by: userId,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await integrationRef.set(integrationData);
  return integrationData;
};

export const testConnection = async (integrationId) => {
  const db = admin.firestore();
  const doc = await db.collection("integrations").doc(integrationId).get();

  if (!doc.exists) throw new Error("Integration not found");
  const integration = doc.data();

  // Mock checking connection against target API health endpoint
  // Using decrypted credentials via decryptCredentials(integration.encrypted_auth_config_json)
  return { success: true, message: "Connection successful." };
};

export const syncAssets = async (integrationId, direction) => {
  const db = admin.firestore();
  const integrationDoc = await db
    .collection("integrations")
    .doc(integrationId)
    .get();

  if (!integrationDoc.exists) throw new Error("Integration not found");
  const integration = integrationDoc.data();

  const logRef = db.collection("integration_logs").doc();
  const startTime = Date.now();

  try {
    // Mock Sync logic based on direction and field mappings
    // This would typically involve fetching items, mapping fields, making api calls, and handling pagination/errors.
    let recordsAttempted = 10;
    let recordsSuccess = 10;
    let recordsFailed = 0;

    const logData = {
      id: logRef.id,
      tenant_id: integration.tenant_id,
      integration_id: integrationId,
      direction,
      event_type: "asset_sync",
      records_attempted,
      records_success,
      records_failed,
      error_details: [],
      started_at: new Date(startTime),
      completed_at: new Date(),
      duration_ms: Date.now() - startTime,
    };

    await logRef.set(logData);

    await db.collection("integrations").doc(integrationId).update({
      last_sync_at: new Date(),
      last_sync_status: "success",
    });

    return logData;
  } catch (error) {
    const logData = {
      id: logRef.id,
      tenant_id: integration.tenant_id,
      integration_id: integrationId,
      direction,
      event_type: "asset_sync",
      records_attempted: 0,
      records_success: 0,
      records_failed: 0,
      error_details: [error.message],
      started_at: new Date(startTime),
      completed_at: new Date(),
      duration_ms: Date.now() - startTime,
    };
    await logRef.set(logData);

    await db.collection("integrations").doc(integrationId).update({
      last_sync_at: new Date(),
      last_sync_status: "failed",
    });

    throw error;
  }
};

export const getOAuthToken = async (integrationId) => {
  const db = admin.firestore();
  const integrationDoc = await db
    .collection("integrations")
    .doc(integrationId)
    .get();
  if (!integrationDoc.exists) throw new Error("Integration not found");
  const config = integrationDoc.data();

  const authConfig = JSON.parse(
    decryptCredentials(config.encrypted_auth_config_json) || "{}",
  );

  // Check if token valid
  // If expired, refresh token logic here.
  // We'll mock returning a valid token buffer.
  const accessToken = authConfig.access_token || "mock_valid_token_xyz";
  return accessToken;
};

export const rotateApiKey = async (tenantId, integrationId) => {
  const db = admin.firestore();
  const integrationRef = db.collection("integrations").doc(integrationId);
  const doc = await integrationRef.get();

  if (!doc.exists || doc.data().tenant_id !== tenantId)
    throw new Error("Integration not found");

  // Generate a new API Key for webhook endpoint or auth config
  const newApiKey = crypto.randomBytes(32).toString("hex");
  const encrypted = encryptCredentials(newApiKey);

  await integrationRef.update({
    encrypted_auth_config_json: encrypted,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: "API key rotated successfully." };
};

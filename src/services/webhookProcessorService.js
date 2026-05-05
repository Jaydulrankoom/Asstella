import admin from "firebase-admin";
import crypto from "crypto";

export const registerWebhookEndpoint = async (
  tenantId,
  integrationId,
  endpointUrl,
  events,
) => {
  const db = admin.firestore();

  const secretKey = crypto.randomBytes(32).toString("hex"); // HMAC signing key

  const endpointRef = db.collection("webhook_endpoints").doc();
  const endpointData = {
    id: endpointRef.id,
    tenant_id: tenantId,
    integration_id: integrationId,
    endpoint_url: endpointUrl,
    secret_key: secretKey,
    events_subscribed: events || [],
    is_active: true,
    failure_count: 0,
    last_success_at: null,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await endpointRef.set(endpointData);
  return endpointData;
};

export const handleInboundWebhook = async (
  tenantId,
  integrationId,
  signature,
  payloadBodyStr,
) => {
  const db = admin.firestore();

  const endpointSnap = await db
    .collection("webhook_endpoints")
    .where("tenant_id", "==", tenantId)
    .where("integration_id", "==", integrationId)
    .limit(1)
    .get();

  if (endpointSnap.empty) {
    throw new Error("Webhook endpoint configuration not found.");
  }

  const endpoint = endpointSnap.docs[0].data();

  if (!endpoint.is_active) {
    throw new Error("Webhook endpoint is inactive.");
  }

  // 1. Validate HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", endpoint.secret_key)
    .update(payloadBodyStr)
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new Error("Invalid HMAC signature.");
  }

  // 2. Parse event type
  let payload;
  try {
    payload = JSON.parse(payloadBodyStr);
  } catch (e) {
    throw new Error("Invalid JSON payload.");
  }

  const eventType = payload.event_type || payload.event;
  if (
    !endpoint.events_subscribed.includes(eventType) &&
    !endpoint.events_subscribed.includes("*")
  ) {
    // Ignored event, but signature is valid
    return {
      status: "ignored",
      reason: `Not subscribed to event ${eventType}`,
    };
  }

  // 4. Queue processing
  const queueRef = db.collection("integration_sync_queue").doc();
  await queueRef.set({
    tenant_id: tenantId,
    integration_id: integrationId,
    direction: "inbound",
    event_type: eventType,
    payload: payload,
    status: "pending",
    retry_count: 0,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { status: "queued", queue_id: queueRef.id };
};

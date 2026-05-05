import * as integrationService from "../services/integrationService.js";
import * as webhookProcessorService from "../services/webhookProcessorService.js";

export const createIntegration = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const integration = await integrationService.createIntegration(
      tenant_id,
      req.body,
      uid,
    );
    res.status(201).json({ success: true, data: integration });
  } catch (error) {
    next(error);
  }
};

export const testConnection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await integrationService.testConnection(id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const syncAssets = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    const result = await integrationService.syncAssets(id, direction || "pull");
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const rotateApiKey = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const result = await integrationService.rotateApiKey(tenant_id, id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Webhook handling
export const handleInboundWebhook = async (req, res, next) => {
  try {
    const { tenantId, integrationId } = req.params;
    const signature = req.headers["x-signature"]; // Assumes standard signature header

    if (!signature) {
      return res
        .status(401)
        .json({ success: false, message: "Missing X-Signature header" });
    }

    // Must access raw body for HMAC validation. Using req.rawBody or similar if configured in Express.
    // Assuming express.json() with verify function is used to populate req.rawBody, otherwise relying on req.body for demo stringification.
    const payloadBodyStr = req.rawBody
      ? req.rawBody.toString("utf8")
      : JSON.stringify(req.body);

    const result = await webhookProcessorService.handleInboundWebhook(
      tenantId,
      integrationId,
      signature,
      payloadBodyStr,
    );

    // Return 200 immediately (async processing)
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    // 401 if HMAC invalid, else 400
    if (error.message.includes("HMAC signature")) {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const registerWebhook = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { id } = req.params;
    const { endpointUrl, events } = req.body;
    const result = await webhookProcessorService.registerWebhookEndpoint(
      tenant_id,
      id,
      endpointUrl,
      events,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

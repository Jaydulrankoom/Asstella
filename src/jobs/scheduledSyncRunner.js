import admin from "firebase-admin";
import * as integrationService from "../services/integrationService.js";

export const runScheduledSyncs = async (frequency) => {
  const db = admin.firestore();
  const startTime = Date.now();

  const integrationsSnap = await db
    .collection("integrations")
    .where("sync_frequency", "==", frequency)
    .where("is_active", "==", true)
    .get();

  for (const doc of integrationsSnap.docs) {
    const integration = doc.data();

    try {
      await integrationService.syncAssets(integration.id, "bidirectional");
    } catch (e) {
      console.error(
        `Scheduled sync failed for integration ${integration.id}:`,
        e,
      );
      // Implementation of exponential backoff retry logic would involve
      // adding it to a dead letter queue or tracking retries directly
      // in the integration status.
    }
  }

  return {
    processed: integrationsSnap.size,
    frequency,
    timeMs: Date.now() - startTime,
  };
};

export const runHourlySyncs = () => runScheduledSyncs("hourly");
export const runDailySyncs = () => runScheduledSyncs("daily");

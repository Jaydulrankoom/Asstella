import { db, admin } from '../../config/firebase.js';

export class PlatformSettingsService {
  static async getSettings() {
    try {
      const doc = await db.collection('platform_settings').doc('global').get();
      if (!doc.exists) {
        // Default initial settings
        return {
          system: { maintenance_mode: false, registration_open: true, default_trial_days: 14 }
        };
      }
      return doc.data();
    } catch (error) {
      const isApiDisabled = error.message.includes('Cloud Firestore API has not been used') || error.message.includes('PERMISSION_DENIED');
      const instructions = isApiDisabled 
        ? "ACTION REQUIRED: Enable Cloud Firestore API at https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=" + (process.env.FIREBASE_PROJECT_ID || 'asstella-cd3ac')
        : error.message;

      console.warn("Firestore access failed:", instructions);
      return {
        system: { maintenance_mode: false, registration_open: true, default_trial_days: 14 },
        _warning: "Storage engine restricted: " + instructions,
        _action_required: isApiDisabled
      };
    }
  }

  static async updateSettings(data) {
    await db.collection('platform_settings').doc('global').set(data, { merge: true });
    return data;
  }

  static async addGpsProvider(provider) {
    await db.collection('platform_settings').doc('global').update({
      gps_providers: admin.firestore.FieldValue.arrayUnion({
        ...provider,
        id: Math.random().toString(36).slice(2)
      })
    });
    return { success: true };
  }
}

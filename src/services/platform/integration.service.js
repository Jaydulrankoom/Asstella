import { db, admin } from '../../config/firebase.js';
import { handleServiceError } from '../../utils/firebase-errors.js';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const ENCRYPTION_KEY = process.env.INTEGRATION_ENCRYPTION_KEY || 'default-32-byte-encryption-key-for-dev'; // Must be 32 chars

export class PlatformIntegrationService {
  // --- GPS Providers ---
  static async addGpsProvider(data) {
    const { name, api_base_url, auth_type, credentials } = data;
    
    // Encrypt credentials
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    const providerData = {
      name,
      api_base_url,
      auth_type,
      encrypted_credentials: {
        iv: iv.toString('hex'),
        content: encrypted,
        tag: authTag
      },
      status: 'active',
      created_at: admin.firestore.Timestamp.now()
    };

    const docRef = await db.collection('gps_providers').add(providerData);
    return { id: docRef.id, ...providerData, encrypted_credentials: '[ENCRYPTED]' };
  }

  static async listGpsProviders() {
    try {
      const snapshot = await db.collection('gps_providers').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), encrypted_credentials: '[ENCRYPTED]' }));
    } catch (error) {
      handleServiceError(error, "GPS providers fetch");
      return [];
    }
  }

  // --- API Keys ---
  static async generateApiKey(tenantId, name) {
    const rawKey = crypto.randomBytes(32).toString('hex');
    const keyPrefix = rawKey.substring(0, 8);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const keyData = {
      tenant_id: tenantId,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      name,
      is_active: true,
      created_at: admin.firestore.Timestamp.now()
    };

    const docRef = await db.collection('api_keys').add(keyData);
    
    return {
      id: docRef.id,
      full_key: rawKey, // ONLY RETURNED ONCE
      ...keyData,
      key_hash: '[HIDDEN]'
    };
  }

  static async listApiKeys() {
    try {
      const snapshot = await db.collection('api_keys').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), key_hash: '[HIDDEN]' }));
    } catch (error) {
      handleServiceError(error, "API keys fetch");
      return [];
    }
  }

  static async revokeApiKey(id) {
    await db.collection('api_keys').doc(id).delete();
    return { success: true };
  }

  // --- Webhooks ---
  static async createWebhook(data) {
    const secretKey = crypto.randomBytes(24).toString('hex');
    const webhookData = {
      ...data,
      secret_key: secretKey,
      is_active: true,
      failure_count: 0,
      created_at: admin.firestore.Timestamp.now()
    };

    const docRef = await db.collection('webhook_configs').add(webhookData);
    return { id: docRef.id, ...webhookData };
  }

  static async listWebhooks() {
    try {
      const snapshot = await db.collection('webhook_configs').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleServiceError(error, "Webhooks fetch");
      return [];
    }
  }

  static async toggleWebhook(id) {
    const ref = db.collection('webhook_configs').doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new Error('Webhook not found');
    
    const newState = !doc.data().is_active;
    await ref.update({ is_active: newState });
    return { id, is_active: newState };
  }

  static async testWebhook(id) {
    const doc = await db.collection('webhook_configs').doc(id).get();
    if (!doc.exists) throw new Error('Webhook not found');
    const webhook = doc.data();

    const payload = { event: 'test_event', timestamp: new Date().toISOString(), message: 'This is a test notification from Asstella' };
    await this.dispatchToWebhook(webhook, 'test_event', payload);
    
    return { success: true, message: 'Test delivery dispatched' };
  }

  static async dispatchToWebhook(webhook, eventType, payload) {
    const hmac = crypto.createHmac('sha256', webhook.secret_key).update(JSON.stringify(payload)).digest('hex');
    const startTime = Date.now();
    
    try {
      const response = await fetch(webhook.target_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Asstella-Event': eventType,
          'X-Asstella-Signature': hmac
        },
        body: JSON.stringify(payload)
      });

      const duration = Date.now() - startTime;
      
      await db.collection('webhook_delivery_logs').add({
        webhook_id: webhook.id,
        event_type: eventType,
        status: response.ok ? 'success' : 'failure',
        response_code: response.status,
        duration_ms: duration,
        created_at: admin.firestore.Timestamp.now()
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      await db.collection('webhook_delivery_logs').add({
        webhook_id: webhook.id,
        event_type: eventType,
        status: 'failure',
        error: error.message,
        duration_ms: duration,
        created_at: admin.firestore.Timestamp.now()
      });
      // In a real system, we'd queue a retry here
    }
  }

  static async dispatchWebhook(tenantId, eventType, payload) {
    const snapshot = await db.collection('webhook_configs')
      .where('tenant_id', '==', tenantId)
      .where('is_active', '==', true)
      .get();
    
    const webhooks = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(w => w.events_subscribed.includes(eventType));

    for (const webhook of webhooks) {
      await this.dispatchToWebhook(webhook, eventType, payload);
    }
  }
}

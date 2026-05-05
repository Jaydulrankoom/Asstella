import { db, admin } from '../../config/firebase.js';
import { handleServiceError } from '../../utils/firebase-errors.js';

export class PlatformSecurityService {
  static async listLogs({ event_type, risk_score, tenant_id, page = 1, limit = 20 }) {
    try {
      let query = db.collection('security_logs').orderBy('created_at', 'desc');
      
      if (event_type) query = query.where('event_type', '==', event_type);
      if (tenant_id) query = query.where('tenant_id', '==', tenant_id);
      if (risk_score) query = query.where('risk_score', '>=', parseInt(risk_score));

      const snapshot = await query.get();
      let logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const total = logs.length;
      const startIndex = (page - 1) * limit;
      return {
        logs: logs.slice(startIndex, startIndex + limit),
        total,
        page,
        total_pages: Math.ceil(total / limit)
      };
    } catch (error) {
      const errInfo = handleServiceError(error, 'PlatformSecurity.listLogs');
      return { 
        logs: [], 
        total: 0, 
        page: 1, 
        total_pages: 0,
        ...errInfo 
      };
    }
  }

  static async getSuspicious() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const snapshot = await db.collection('security_logs')
        .where('risk_score', '>', 70)
        .where('created_at', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
        .orderBy('created_at', 'desc')
        .get();
        
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      const errInfo = handleServiceError(error, 'PlatformSecurity.getSuspicious');
      return [];
    }
  }

  static async asyncGetCounts() {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const [suspicious, failures] = await Promise.all([
        db.collection('security_logs').where('risk_score', '>', 50).count().get(),
        db.collection('security_logs')
          .where('event_type', '==', 'auth_failure')
          .where('created_at', '>=', twentyFourHoursAgo)
          .count().get()
      ]);

      return {
        suspicious_count: suspicious.data().count,
        auth_failures_24h: failures.data().count
      };
    } catch (error) {
      const errInfo = handleServiceError(error, 'PlatformSecurity.asyncGetCounts');
      return { suspicious_count: 0, auth_failures_24h: 0, ...errInfo };
    }
  }

  static async getSummary() {
    try {
      const counts = await this.asyncGetCounts();
      
      return {
        ...counts,
        high_risk_ips: ['192.168.1.100', '10.0.0.5'],
        system_health: 'optimal'
      };
    } catch (error) {
      const errInfo = handleServiceError(error, 'PlatformSecurity.summary');
      return {
        suspicious_count: 0,
        auth_failures_24h: 0,
        high_risk_ips: [],
        system_health: 'restricted',
        ...errInfo
      };
    }
  }
}

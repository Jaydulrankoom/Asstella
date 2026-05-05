import { db, admin } from '../../config/firebase.js';
import { handleServiceError } from '../../utils/firebase-errors.js';

export class PlatformSupportService {
  static async listTickets({ status, priority, tenant_id }) {
    try {
      let query = db.collection('support_tickets');
      
      if (status && status !== 'all') query = query.where('status', '==', status);
      if (priority && priority !== 'all') query = query.where('priority', '==', priority);
      if (tenant_id) query = query.where('tenant_id', '==', tenant_id);

      const snapshot = await query.orderBy('opened_at', 'desc').limit(100).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      const errInfo = handleServiceError(error, "Support tickets fetch");
      return [];
    }
  }

  static async getTicket(id) {
    try {
      const doc = await db.collection('support_tickets').doc(id).get();
      if (!doc.exists) throw new Error('Ticket not found');
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error("Failed to get ticket:", error.message);
      throw error;
    }
  }

  static async addReply(id, { text, status }, performedBy) {
    try {
      const ticketRef = db.collection('support_tickets').doc(id);
      const doc = await ticketRef.get();
      if (!doc.exists) throw new Error('Ticket not found');

      const now = admin.firestore.Timestamp.now();
      const message = {
        sender: performedBy,
        text,
        timestamp: now,
        type: 'agent'
      };

      const updateData = {
        messages: admin.firestore.FieldValue.arrayUnion(message),
        updated_at: now
      };

      if (status) updateData.status = status;
      
      // SLA Tracking: Mark first response
      if (!doc.data().responded_at) {
        updateData.responded_at = now;
        updateData.sla_response_met = now.toMillis() <= (doc.data().sla_response_due?.toMillis() || Infinity);
      }

      // If resolving
      if (status === 'resolved' && !doc.data().resolved_at) {
        updateData.resolved_at = now;
        updateData.sla_resolution_met = now.toMillis() <= (doc.data().sla_resolution_due?.toMillis() || Infinity);
      }

      await ticketRef.update(updateData);
      return { success: true };
    } catch (error) {
      console.error("Failed to add reply:", error.message);
      throw error;
    }
  }

  static async assignTicket(id, { assigned_to }) {
    try {
      await db.collection('support_tickets').doc(id).update({
        assigned_to,
        status: 'in_progress',
        updated_at: admin.firestore.Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to assign ticket:", error.message);
      throw error;
    }
  }

  static async getSlaSummary() {
    try {
      const now = admin.firestore.Timestamp.now();
      const snapshot = await db.collection('support_tickets')
        .where('status', 'in', ['open', 'in_progress', 'waiting'])
        .get();

      const tickets = snapshot.docs.map(doc => doc.data());
      
      return {
        total_active: tickets.length,
        breached_response: tickets.filter(t => !t.responded_at && t.sla_response_due?.toMillis() < now.toMillis()).length,
        breached_resolution: tickets.filter(t => !t.resolved_at && t.sla_resolution_due?.toMillis() < now.toMillis()).length,
        approaching_breach: tickets.filter(t => {
          const due = t.sla_response_due?.toMillis() || t.sla_resolution_due?.toMillis();
          return due && (due - now.toMillis()) < (2 * 60 * 60 * 1000); // 2 hours
        }).length
      };
    } catch (error) {
      const errInfo = handleServiceError(error, "SLA summary fetch");
      return { total_active: 0, breached_response: 0, breached_resolution: 0, approaching_breach: 0, ...errInfo };
    }
  }
}

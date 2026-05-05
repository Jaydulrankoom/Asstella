import { db, admin } from '../../config/firebase.js';

export class PlatformBillingService {
  static async listInvoices({ tenant_id, status, page = 1, limit = 20 }) {
    let query = db.collection('billing_invoices').orderBy('created_at', 'desc');

    if (tenant_id) query = query.where('tenant_id', '==', tenant_id);
    if (status) query = query.where('status', '==', status);

    const snapshot = await query.get();
    let invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const total = invoices.length;
    const startIndex = (page - 1) * limit;
    const paginatedInvoices = invoices.slice(startIndex, startIndex + limit);

    return {
      invoices: paginatedInvoices,
      total,
      page,
      total_pages: Math.ceil(total / limit)
    };
  }

  static async getInvoice(id) {
    const doc = await db.collection('billing_invoices').doc(id).get();
    if (!doc.exists) throw new Error('Invoice not found');
    return { id: doc.id, ...doc.data() };
  }

  static async createInvoice(data) {
    const { tenant_id, amount_usd, period_start, period_end, line_items, due_date } = data;
    
    const tenantDoc = await db.collection('tenants').doc(tenant_id).get();
    if (!tenantDoc.exists) throw new Error('Tenant not found');
    
    const tenantData = tenantDoc.data();
    const invoiceNo = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoiceData = {
      tenant_id,
      tenant_name: tenantData.name,
      invoice_no: invoiceNo,
      amount_usd: parseFloat(amount_usd),
      period_start: admin.firestore.Timestamp.fromDate(new Date(period_start)),
      period_end: admin.firestore.Timestamp.fromDate(new Date(period_end)),
      due_date: admin.firestore.Timestamp.fromDate(new Date(due_date)),
      line_items: line_items || [],
      status: 'sent',
      created_at: admin.firestore.Timestamp.now()
    };

    const docRef = await db.collection('billing_invoices').add(invoiceData);
    return { id: docRef.id, ...invoiceData };
  }

  static async updateStatus(id, { status, payment_method, payment_reference }) {
    const updateData = { status, updated_at: admin.firestore.Timestamp.now() };
    
    if (status === 'paid') {
      updateData.paid_at = admin.firestore.Timestamp.now();
      updateData.payment_method = payment_method;
      updateData.payment_reference = payment_reference;
    }

    await db.collection('billing_invoices').doc(id).update(updateData);
    return { id, ...updateData };
  }

  static async getOverdueInvoices() {
    const now = admin.firestore.Timestamp.now();
    const snapshot = await db.collection('billing_invoices')
      .where('status', 'in', ['sent', 'overdue'])
      .where('due_date', '<', now)
      .get();
      
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getBillingSummary() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const invoicesSnapshot = await db.collection('billing_invoices').where('created_at', '>=', admin.firestore.Timestamp.fromDate(startOfMonth)).get();
    
    let totalCollected = 0;
    let overdueTotal = 0;
    
    const allInvoices = await db.collection('billing_invoices').get();
    allInvoices.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'paid' && data.paid_at?.toDate() >= startOfMonth) {
        totalCollected += data.amount_usd;
      }
      if (data.status === 'overdue' || (data.status === 'sent' && data.due_date?.toDate() < new Date())) {
        overdueTotal += data.amount_usd;
      }
    });

    return {
      total_collected_month: totalCollected,
      overdue_total: overdueTotal,
      expected_next_30_days: totalCollected * 1.1 // Simple projection
    };
  }
}

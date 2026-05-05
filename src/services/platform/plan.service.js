import { db, admin } from '../../config/firebase.js';

export class PlatformPlanService {
  static async listPlans() {
    const snapshot = await db.collection('subscription_plans').orderBy('sort_order', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async createPlan(data) {
    const { name, setup_fee_usd, monthly_fee_usd, yearly_fee_usd, target_segment, description, modules_included, feature_flags, limits, sort_order = 0 } = data;
    
    const planId = name.toLowerCase().replace(/\s+/g, '_');
    const docRef = db.collection('subscription_plans').doc(planId);
    
    const planData = {
      name,
      setup_fee_usd: parseFloat(setup_fee_usd),
      monthly_fee_usd: parseFloat(monthly_fee_usd),
      yearly_fee_usd: parseFloat(yearly_fee_usd),
      target_segment,
      description,
      modules_included: modules_included || [],
      feature_flags: feature_flags || {},
      limits: limits || {},
      is_active: true,
      sort_order: parseInt(sort_order),
      created_at: admin.firestore.Timestamp.now()
    };

    await docRef.set(planData);
    return { id: planId, ...planData };
  }

  static async updatePlan(id, data) {
    const { name, setup_fee_usd, monthly_fee_usd, yearly_fee_usd, target_segment, description, modules_included, feature_flags, limits, sort_order } = data;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (setup_fee_usd !== undefined) updateData.setup_fee_usd = parseFloat(setup_fee_usd);
    if (monthly_fee_usd !== undefined) updateData.monthly_fee_usd = parseFloat(monthly_fee_usd);
    if (yearly_fee_usd !== undefined) updateData.yearly_fee_usd = parseFloat(yearly_fee_usd);
    if (target_segment) updateData.target_segment = target_segment;
    if (description) updateData.description = description;
    if (modules_included) updateData.modules_included = modules_included;
    if (feature_flags) updateData.feature_flags = feature_flags;
    if (limits) updateData.limits = limits;
    if (sort_order !== undefined) updateData.sort_order = parseInt(sort_order);
    
    updateData.updated_at = admin.firestore.Timestamp.now();

    await db.collection('subscription_plans').doc(id).update(updateData);
    return { id, ...updateData };
  }

  static async togglePlan(id) {
    const planRef = db.collection('subscription_plans').doc(id);
    const doc = await planRef.get();
    if (!doc.exists) throw new Error('Plan not found');
    
    const isActive = doc.data().is_active;
    await planRef.update({ is_active: !isActive });
    return { id, is_active: !isActive };
  }

  static async getPlanTenants(id) {
    const snapshot = await db.collection('tenants').where('plan_id', '==', id).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      status: doc.data().status,
      contact_email: doc.data().contact_email
    }));
  }
}

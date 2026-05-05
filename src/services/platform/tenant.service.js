import { db, admin, auth } from '../../config/firebase.js';
import { handleServiceError } from '../../utils/firebase-errors.js';

export class PlatformTenantService {
  static async listTenants({ status, plan_id, search, page = 1, limit = 20 }) {
    try {
      let query = db.collection('tenants');

      if (status) query = query.where('status', '==', status);
      if (plan_id) query = query.where('plan_id', '==', plan_id);

      const snapshot = await query.orderBy('created_at', 'desc').get();
      let tenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (search) {
        const s = search.toLowerCase();
        tenants = tenants.filter(t => 
          t.name?.toLowerCase().includes(s) || 
          t.slug?.toLowerCase().includes(s) || 
          t.contact_email?.toLowerCase().includes(s)
        );
      }

      const total = tenants.length;
      const startIndex = (page - 1) * limit;
      const paginatedTenants = tenants.slice(startIndex, startIndex + limit);

      return {
        tenants: paginatedTenants,
        total,
        page,
        total_pages: Math.ceil(total / limit)
      };
    } catch (error) {
      const errInfo = handleServiceError(error, 'PlatformTenants.list');
      return { tenants: [], total: 0, page: 1, total_pages: 0, ...errInfo };
    }
  }

  static async getTenant(id) {
    const doc = await db.collection('tenants').doc(id).get();
    if (!doc.exists) throw new Error('Tenant not found');
    
    // In a real app, we would gather usage stats, subscription info etc.
    return { id: doc.id, ...doc.data() };
  }

  static async createTenant(data, createdBy) {
    const { name, slug, business_type, contact_name, contact_email, plan_id, trial_days = 14 } = data;

    // 1. Validate slug uniqueness
    const slugCheck = await db.collection('tenants').where('slug', '==', slug).count().get();
    if (slugCheck.data().count > 0) throw new Error('Slug already in use');

    const tenantId = db.collection('tenants').doc().id;
    const now = admin.firestore.Timestamp.now();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + parseInt(trial_days));

    // 2. Create tenant admin in Firebase Auth
    const tempPassword = Math.random().toString(36).slice(-10) + '1!A';
    const userRecord = await auth.createUser({
      email: contact_email,
      password: tempPassword,
      displayName: contact_name,
    });

    // 3. Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      tenant_id: tenantId,
      role_id: 'super_admin',
      is_platform_admin: false
    });

    const tenantData = {
      name,
      slug,
      business_type,
      contact_name,
      contact_email,
      plan_id,
      status: 'trial',
      trial_end_date: admin.firestore.Timestamp.fromDate(trialEndDate),
      created_at: now,
      created_by: createdBy,
      limits: {
        max_assets: 100,
        max_users: 10,
        max_branches: 2,
        storage_gb: 5
      },
      current_usage: {
        asset_count: 0,
        user_count: 1,
        branch_count: 1,
        storage_used_mb: 0
      }
    };

    // 4. Batch write for consistency
    const batch = db.batch();
    batch.set(db.collection('tenants').doc(tenantId), tenantData);
    batch.set(db.collection('tenants').doc(tenantId).collection('users').doc(userRecord.uid), {
      uid: userRecord.uid,
      email: contact_email,
      name: contact_name,
      role: 'super_admin',
      created_at: now
    });

    await batch.commit();

    // 5. Log activity
    await db.collection('platform_activity_logs').add({
      action: 'TENANT_CREATED',
      performed_by: createdBy,
      target_tenant: name,
      tenant_id: tenantId,
      created_at: now
    });

    // In a real app: Send welcome email with tempPassword
    console.log(`Welcome email would be sent to ${contact_email} with password: ${tempPassword}`);

    return { id: tenantId, ...tenantData, temp_password: tempPassword };
  }

  static async updateStatus(id, { status, reason }, performedBy) {
    const validStatuses = ['trial', 'active', 'suspended', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) throw new Error('Invalid status');

    const tenantRef = db.collection('tenants').doc(id);
    const tenantDoc = await tenantRef.get();
    if (!tenantDoc.exists) throw new Error('Tenant not found');

    await tenantRef.update({ status, status_reason: reason, updated_at: admin.firestore.Timestamp.now() });

    if (status === 'suspended') {
      // Revoke sessions for all users of this tenant
      const usersSnapshot = await db.collectionGroup('users').where('tenant_id', '==', id).get();
      for (const userDoc of usersSnapshot.docs) {
        await auth.revokeRefreshTokens(userDoc.id);
      }
    }

    await db.collection('platform_activity_logs').add({
      action: `TENANT_STATUS_${status.toUpperCase()}`,
      performed_by: performedBy,
      target_tenant: tenantDoc.data().name,
      tenant_id: id,
      created_at: admin.firestore.Timestamp.now()
    });

    return { success: true };
  }

  static async updatePlan(id, { new_plan_id }, performedBy) {
    const tenantRef = db.collection('tenants').doc(id);
    const tenantDoc = await tenantRef.get();
    if (!tenantDoc.exists) throw new Error('Tenant not found');

    // In a real app, logic here would determine new limits based on the plan document
    const planLimits = {
      starter: { max_assets: 100, max_users: 10, max_branches: 2, storage_gb: 5 },
      professional: { max_assets: 1000, max_users: 50, max_branches: 10, storage_gb: 50 },
      enterprise: { max_assets: 10000, max_users: 200, max_branches: 50, storage_gb: 500 },
    };

    const limits = planLimits[new_plan_id] || planLimits.starter;

    await tenantRef.update({
      plan_id: new_plan_id,
      limits,
      updated_at: admin.firestore.Timestamp.now()
    });

    await db.collection('platform_activity_logs').add({
      action: 'TENANT_PLAN_CHANGED',
      performed_by: performedBy,
      target_tenant: tenantDoc.data().name,
      tenant_id: id,
      details: { old_plan: tenantDoc.data().plan_id, new_plan: new_plan_id },
      created_at: admin.firestore.Timestamp.now()
    });

    return { success: true, limits };
  }

  static async getUsage(id) {
    const doc = await db.collection('tenants').doc(id).get();
    if (!doc.exists) throw new Error('Tenant not found');
    const data = doc.data();
    return {
      assets_used: data.current_usage?.asset_count || 0,
      assets_limit: data.limits?.max_assets || 0,
      users_used: data.current_usage?.user_count || 0,
      users_limit: data.limits?.max_users || 0,
      storage_used_mb: data.current_usage?.storage_used_mb || 0,
      storage_limit_gb: data.limits?.storage_gb || 1
    };
  }

  static async sendCredentials(id, performedBy) {
    const doc = await db.collection('tenants').doc(id).get();
    if (!doc.exists) throw new Error('Tenant not found');
    const tenant = doc.data();

    const tempPassword = Math.random().toString(36).slice(-10) + '1!A';
    const userSnapshot = await db.collection('tenants').doc(id).collection('users').where('role', '==', 'super_admin').limit(1).get();
    
    if (userSnapshot.empty) throw new Error('Tenant admin user not found');
    const userDoc = userSnapshot.docs[0];

    await auth.updateUser(userDoc.id, { password: tempPassword });

    await db.collection('platform_activity_logs').add({
      action: 'TENANT_CREDENTIALS_RESENT',
      performed_by: performedBy,
      target_tenant: tenant.name,
      tenant_id: id,
      created_at: admin.firestore.Timestamp.now()
    });

    console.log(`Credentials resent to ${userDoc.data().email} with new password: ${tempPassword}`);
    return { success: true };
  }

  static async updateWhiteLabel(id, data, performedBy) {
    const { branding, theme, domains } = data;
    const tenantRef = db.collection('tenants').doc(id);
    const tenantDoc = await tenantRef.get();
    if (!tenantDoc.exists) throw new Error('Tenant not found');

    const updateData = {
      white_label: {
        branding: branding || {},
        theme: theme || {},
        domains: domains || []
      },
      updated_at: admin.firestore.Timestamp.now()
    };

    await tenantRef.update(updateData);

    await db.collection('platform_activity_logs').add({
      action: 'TENANT_WHITELABEL_UPDATED',
      performed_by: performedBy,
      target_tenant: tenantDoc.data().name,
      tenant_id: id,
      created_at: admin.firestore.Timestamp.now()
    });

    return { success: true };
  }

  static async onboardTenant(id, performedBy) {
    const tenantRef = db.collection('tenants').doc(id);
    const tenantDoc = await tenantRef.get();
    if (!tenantDoc.exists) throw new Error('Tenant not found');
    const tenant = tenantDoc.data();

    if (tenant.status !== 'trial') {
      throw new Error('Tenant must be in trial state to onboard');
    }

    await tenantRef.update({
      status: 'active',
      onboarded_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now()
    });

    await db.collection('platform_activity_logs').add({
      action: 'TENANT_ONBOARDED',
      performed_by: performedBy,
      target_tenant: tenant.name,
      tenant_id: id,
      created_at: admin.firestore.Timestamp.now()
    });

    return { success: true };
  }
}

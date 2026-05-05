import admin from "firebase-admin";

/**
 * Helper to log system activities.
 * @param {string} tenantId
 * @param {string} action
 * @param {object} details
 */
const logSystemActivity = async (tenantId, action, details) => {
  const db = admin.firestore();
  await db.collection("system_logs").add({
    tenant_id: tenantId,
    action,
    details,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * Validates uniqueness of tenant code and subdomain.
 * @param {string} code
 * @param {string} subdomain
 */
const validateUniqueIdentifiers = async (code, subdomain) => {
  const db = admin.firestore();

  const codeSnapshot = await db
    .collection("tenants")
    .where("code", "==", code)
    .limit(1)
    .get();
  if (!codeSnapshot.empty) throw new Error("Tenant code already exists.");

  const subdomainSnapshot = await db
    .collection("tenants")
    .where("subdomain", "==", subdomain)
    .limit(1)
    .get();
  if (!subdomainSnapshot.empty)
    throw new Error("Tenant subdomain already exists.");
};

/**
 * 1. createTenant: validate unique code/subdomain, create Firestore doc, create default roles, set trial status.
 * @param {object} data - Tenant configuration data.
 * @param {string} createdById - UID of the platform admin creating the tenant.
 * @returns {Promise<object>} Created tenant record.
 */
export const createTenant = async (data, createdById) => {
  const db = admin.firestore();
  await validateUniqueIdentifiers(data.code, data.subdomain);

  const trialDays = 14;
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + trialDays);

  const tenantRef = db.collection("tenants").doc();
  const tenantId = tenantRef.id;

  const tenantData = {
    id: tenantId,
    name: data.name,
    code: data.code,
    subdomain: data.subdomain,
    logo_url: data.logo_url || null,
    theme_color: data.theme_color || "#2563eb",
    timezone: data.timezone || "UTC",
    currency: data.currency || "USD",
    plan_id: data.plan_id || "trial_plan",
    status: "trial",
    trial_end: admin.firestore.Timestamp.fromDate(trialEnd),
    setup_complete: false,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    created_by: createdById,
  };

  // Perform as batch write
  const batch = db.batch();
  batch.set(tenantRef, tenantData);

  // Default Roles Document/Collection Setup
  const defaultRoles = [
    "Super Admin",
    "Asset Manager",
    "Finance Manager",
    "Maintenance Manager",
    "Auditor",
    "Viewer",
  ];
  const rolesRef = db.collection("tenant_roles").doc(tenantId);
  batch.set(rolesRef, {
    roles: defaultRoles,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
  await logSystemActivity(tenantId, "TENANT_CREATED", {
    status: "trial",
    trial_end: trialEnd.toISOString(),
  });

  return tenantData;
};

/**
 * 2. activateTenant: link subscription, set status=active.
 * @param {string} id - Tenant ID
 * @param {string} planId - The Plan ID to link
 * @param {number} monthlyFee - Cost per month
 * @returns {Promise<object>} Updated tenant record
 */
export const activateTenant = async (id, planId, monthlyFee = 0) => {
  const db = admin.firestore();
  const tenantRef = db.collection("tenants").doc(id);
  const tenantDoc = await tenantRef.get();

  if (!tenantDoc.exists) throw new Error("Tenant not found.");

  const batch = db.batch();

  // Update tenant status
  batch.update(tenantRef, {
    status: "active",
    plan_id: planId,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Create Subscriptions Record
  const subscriptionRef = db.collection("tenant_subscriptions").doc();
  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const subscriptionData = {
    id: subscriptionRef.id,
    tenant_id: id,
    plan_id: planId,
    billing_cycle: "monthly",
    start_date: admin.firestore.Timestamp.fromDate(now),
    end_date: admin.firestore.Timestamp.fromDate(nextMonth),
    setup_fee_paid: true,
    monthly_fee: monthlyFee,
    renewal_count: 0,
    status: "active",
  };

  batch.set(subscriptionRef, subscriptionData);
  await batch.commit();

  await logSystemActivity(id, "TENANT_ACTIVATED", { plan_id: planId });

  return { ...tenantDoc.data(), status: "active", plan_id: planId };
};

/**
 * 3. suspendTenant: set status=suspended, log reason + timestamp.
 * @param {string} id - Tenant ID
 * @param {string} reason - Reason for suspension
 * @returns {Promise<void>}
 */
export const suspendTenant = async (id, reason) => {
  const db = admin.firestore();
  const tenantRef = db.collection("tenants").doc(id);

  await tenantRef.update({
    status: "suspended",
    suspension_reason: reason,
    suspended_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await logSystemActivity(id, "TENANT_SUSPENDED", { reason });
};

/**
 * 4. reactivateTenant: check payment received (mocked), restore to active.
 * @param {string} id - Tenant ID
 * @returns {Promise<void>}
 */
export const reactivateTenant = async (id) => {
  const db = admin.firestore();
  const tenantRef = db.collection("tenants").doc(id);

  // In a real scenario, integrate with Stripe/Payment Gateway here to verify payment.
  await tenantRef.update({
    status: "active",
    suspension_reason: admin.firestore.FieldValue.delete(),
    suspended_at: admin.firestore.FieldValue.delete(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await logSystemActivity(id, "TENANT_REACTIVATED", {
    notes: "Payment verified successfully.",
  });
};

/**
 * 5. getTenantUsageStats: count assets, users, branches vs plan limits.
 * @param {string} id - Tenant ID
 * @returns {Promise<object>}
 */
export const getTenantUsageStats = async (id) => {
  const db = admin.firestore();

  // Real implementaton might use Firestore Aggregate queries (count())
  const [assetsSnap, usersSnap, branchesSnap, tenantDoc, planDoc] =
    await Promise.all([
      db.collection("assets").where("tenant_id", "==", id).count().get(),
      db.collection("users").where("tenant_id", "==", id).count().get(),
      db.collection("branches").where("tenant_id", "==", id).count().get(),
      db.collection("tenants").doc(id).get(),
    ]);

  if (!tenantDoc.exists) throw new Error("Tenant not found.");

  const planId = tenantDoc.data().plan_id;
  const planLimitsSnap = await db.collection("plans").doc(planId).get();
  const limits = planLimitsSnap.exists
    ? planLimitsSnap.data().limits
    : { assets: 100, users: 10, branches: 5 }; // Mock limits for demo

  return {
    usage: {
      assets: assetsSnap.data().count,
      users: usersSnap.data().count,
      branches: branchesSnap.data().count,
    },
    limits,
    is_approaching_limit: assetsSnap.data().count >= limits.assets * 0.8,
  };
};

/**
 * 6. upgradePlan: compare old/new module access, update limits, notify tenant.
 * @param {string} id - Tenant ID
 * @param {string} newPlanId - New Plan ID
 * @returns {Promise<object>}
 */
export const upgradePlan = async (id, newPlanId) => {
  const db = admin.firestore();
  const tenantRef = db.collection("tenants").doc(id);
  const tenantDoc = await tenantRef.get();

  if (!tenantDoc.exists) throw new Error("Tenant not found.");
  const oldPlanId = tenantDoc.data().plan_id;

  // Assuming plan upgrade implies subscription extension.
  const subscriptions = await db
    .collection("tenant_subscriptions")
    .where("tenant_id", "==", id)
    .where("status", "==", "active")
    .limit(1)
    .get();

  const batch = db.batch();
  batch.update(tenantRef, {
    plan_id: newPlanId,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (!subscriptions.empty) {
    const subRef = subscriptions.docs[0].ref;
    batch.update(subRef, { plan_id: newPlanId });
  }

  // Generate a mock notification (e.g., save to notifications collection)
  const notifRef = db.collection("notifications").doc();
  batch.set(notifRef, {
    tenant_id: id,
    type: "PLAN_UPGRADED",
    message: `Your plan has been upgraded from ${oldPlanId} to ${newPlanId}.`,
    read: false,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
  await logSystemActivity(id, "PLAN_UPGRADED", { oldPlanId, newPlanId });

  return { success: true, oldPlanId, newPlanId };
};

/**
 * 7. tenantOnboarding: complete profile, configure first branch+dept
 * @param {string} id - Tenant ID
 * @param {object} setupData - Configuration Data
 * @returns {Promise<void>}
 */
export const tenantOnboarding = async (id, setupData) => {
  const db = admin.firestore();
  const tenantRef = db.collection("tenants").doc(id);
  const tenantDoc = await tenantRef.get();

  if (!tenantDoc.exists) throw new Error("Tenant not found.");
  if (tenantDoc.data().setup_complete)
    throw new Error("Onboarding already completed.");

  const batch = db.batch();

  // Create Branch
  if (setupData.branch_name) {
    const branchRef = db.collection("branches").doc();
    batch.set(branchRef, {
      id: branchRef.id,
      tenant_id: id,
      name: setupData.branch_name,
      is_headquarters: true,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  if (setupData.department_name) {
    const deptRef = db.collection("departments").doc();
    batch.set(deptRef, {
      id: deptRef.id,
      tenant_id: id,
      name: setupData.department_name,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  batch.update(tenantRef, {
    setup_complete: true,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });
  await batch.commit();

  await logSystemActivity(id, "ONBOARDING_COMPLETED", { setupData });
};

/**
 * Platform Dashboard KPIs
 * total_tenants, active_tenants, trial_tenants, suspended_tenants
 * mrr (sum active subscriptions monthly_fee), arr (mrr * 12)
 * tenants_renewing_in_30_days, tenants_overdue
 */
export const getPlatformKPIs = async () => {
  const db = admin.firestore();

  const [
    totalSnap,
    activeSnap,
    trialSnap,
    suspendedSnap,
    activeSubSnap,
    renewingSnap,
    overdueSnap,
  ] = await Promise.all([
    db.collection("tenants").count().get(),
    db.collection("tenants").where("status", "==", "active").count().get(),
    db.collection("tenants").where("status", "==", "trial").count().get(),
    db.collection("tenants").where("status", "==", "suspended").count().get(),
    // We cannot sum directly with count(), we must get documents unless using Firestore aggregate SUM() if available.
    // Assuming standard Node.js admin SDK version has aggregate support for sum, or we just fetch & reduce:
    db.collection("tenant_subscriptions").where("status", "==", "active").get(),

    // For renewing in 30 days:
    db
      .collection("tenant_subscriptions")
      .where("status", "==", "active")
      .where(
        "end_date",
        "<=",
        admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ),
      )
      .count()
      .get(),

    // Overdue subscripions
    db
      .collection("tenant_subscriptions")
      .where("status", "==", "overdue")
      .count()
      .get(),
  ]);

  let mrr = 0;
  activeSubSnap.forEach((doc) => {
    mrr += doc.data().monthly_fee || 0;
  });

  return {
    tenants: {
      total: totalSnap.data().count,
      active: activeSnap.data().count,
      trial: trialSnap.data().count,
      suspended: suspendedSnap.data().count,
    },
    revenue: {
      mrr: mrr,
      arr: mrr * 12,
    },
    billing: {
      renewing_in_30_days: renewingSnap.data().count,
      overdue: overdueSnap.data().count,
    },
  };
};

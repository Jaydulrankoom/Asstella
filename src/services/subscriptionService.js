import admin from "firebase-admin";
import Joi from "joi";

/**
 * Helper to log system activities.
 * @param {string} tenantId
 * @param {string} action
 * @param {object} details
 */
const logBillingActivity = async (tenantId, action, details) => {
  const db = admin.firestore();
  await db.collection("system_logs").add({
    tenant_id: tenantId,
    module: "BILLING",
    action,
    details,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
};

const planSchema = Joi.object({
  name: Joi.string().required(),
  setup_fee: Joi.number().integer().min(0).required(), // Amount in cents
  monthly_fee: Joi.number().integer().min(0).required(), // Amount in cents
  billing_cycles: Joi.array()
    .items(Joi.string().valid("monthly", "yearly"))
    .min(1)
    .required(),
  limits: Joi.object({
    max_assets: Joi.number().integer().min(1).required(),
    max_users: Joi.number().integer().min(1).required(),
    max_branches: Joi.number().integer().min(1).required(),
    storage_gb: Joi.number().integer().min(1).required(),
  }).required(),
  modules: Joi.array()
    .items(
      Joi.string().valid(
        "asset_register",
        "qr",
        "assignment",
        "transfer",
        "maintenance",
        "warranty",
        "amc",
        "audit",
        "depreciation",
        "ifrs_reports",
        "disposal",
        "gps",
        "api_hub",
      ),
    )
    .required(),
  feature_flags: Joi.object({
    white_label: Joi.boolean().default(false),
    mobile_audit: Joi.boolean().default(false),
    offline_audit: Joi.boolean().default(false),
  }).default({ white_label: false, mobile_audit: false, offline_audit: false }),
});

/**
 * 1. createPlan(data): validate, create plan document
 * @param {object} data - Plan configuration
 * @returns {Promise<object>}
 */
export const createPlan = async (data) => {
  const { error, value } = planSchema.validate(data);
  if (error)
    throw new Error(`Plan validation failed: ${error.details[0].message}`);

  const db = admin.firestore();
  const planRef = db.collection("subscription_plans").doc();
  const planData = {
    id: planRef.id,
    ...value,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await planRef.set(planData);
  return planData;
};

/**
 * 2. assignPlanToTenant(tenantId, planId, billingCycle): create subscription record, calculate end_date, set billing amount
 * @param {string} tenantId
 * @param {string} planId
 * @param {string} billingCycle - 'monthly' or 'yearly'
 * @returns {Promise<object>}
 */
export const assignPlanToTenant = async (tenantId, planId, billingCycle) => {
  if (!["monthly", "yearly"].includes(billingCycle)) {
    throw new Error("Invalid billing cycle. Must be monthly or yearly.");
  }

  const db = admin.firestore();
  const planDoc = await db.collection("subscription_plans").doc(planId).get();
  if (!planDoc.exists) throw new Error("Plan not found.");

  const planData = planDoc.data();
  if (!planData.billing_cycles.includes(billingCycle)) {
    throw new Error(`Plan does not support ${billingCycle} billing cycle.`);
  }

  const now = new Date();
  const endDate = new Date(now);
  if (billingCycle === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  const fee =
    billingCycle === "yearly"
      ? planData.monthly_fee * 12
      : planData.monthly_fee;

  const subscriptionRef = db.collection("tenant_subscriptions").doc();
  const subscriptionData = {
    id: subscriptionRef.id,
    tenant_id: tenantId,
    plan_id: planId,
    billing_cycle: billingCycle,
    start_date: admin.firestore.Timestamp.fromDate(now),
    end_date: admin.firestore.Timestamp.fromDate(endDate),
    setup_fee_paid: false,
    monthly_fee: planData.monthly_fee, // store normalized base fee
    total_billed_amount: fee, // cached iteration total in cents
    renewal_count: 0,
    status: "active",
  };

  const batch = db.batch();
  batch.set(subscriptionRef, subscriptionData);
  batch.update(db.collection("tenants").doc(tenantId), {
    plan_id: planId,
    status: "active",
  });

  await batch.commit();
  await logBillingActivity(tenantId, "PLAN_ASSIGNED", {
    planId,
    billingCycle,
    amount: fee,
  });

  return subscriptionData;
};

/**
 * 3. checkPlanLimit(tenantId, limitKey): compare usage vs plan limit → throw if exceeded
 * @param {string} tenantId
 * @param {string} limitKey - e.g., 'max_assets', 'max_users'
 * @returns {Promise<boolean>}
 */
export const checkPlanLimit = async (tenantId, limitKey) => {
  const db = admin.firestore();
  const tenantDoc = await db.collection("tenants").doc(tenantId).get();
  if (!tenantDoc.exists) throw new Error("Tenant not found.");

  const planId = tenantDoc.data().plan_id;
  const planDoc = await db.collection("subscription_plans").doc(planId).get();
  if (!planDoc.exists) throw new Error("Subscription plan not found.");

  const limitValue = planDoc.data().limits[limitKey];
  if (limitValue === undefined)
    throw new Error(`Unknown limit key: ${limitKey}`);

  // Map limits to collections
  const limitMap = {
    max_assets: "assets",
    max_users: "users",
    max_branches: "branches",
  };

  const collectionName = limitMap[limitKey];
  if (!collectionName) {
    // Handling non-count limits like storage_gb would require a different approach (e.g. tracking bytes)
    return true;
  }

  const usageSnap = await db
    .collection(collectionName)
    .where("tenant_id", "==", tenantId)
    .count()
    .get();
  const currentCount = usageSnap.data().count;

  if (currentCount >= limitValue) {
    throw new Error(
      `Plan limit exceeded for ${limitKey}. Maximum allowed is ${limitValue}.`,
    );
  }

  return true;
};

/**
 * 4. checkModuleAccess(tenantId, moduleKey): return true/false
 * @param {string} tenantId
 * @param {string} moduleKey
 * @returns {Promise<boolean>}
 */
export const checkModuleAccess = async (tenantId, moduleKey) => {
  const db = admin.firestore();
  const tenantDoc = await db.collection("tenants").doc(tenantId).get();
  if (!tenantDoc.exists) return false;

  const planId = tenantDoc.data().plan_id;
  const planDoc = await db.collection("subscription_plans").doc(planId).get();
  if (!planDoc.exists) return false;

  const modules = planDoc.data().modules || [];
  return modules.includes(moduleKey);
};

/**
 * 5. renewSubscription(tenantId): extend end_date by billing_cycle period, reset overdue status
 * @param {string} tenantId
 * @returns {Promise<object>}
 */
export const renewSubscription = async (tenantId) => {
  const db = admin.firestore();
  const subsSnap = await db
    .collection("tenant_subscriptions")
    .where("tenant_id", "==", tenantId)
    .where("status", "in", ["active", "overdue"])
    .limit(1)
    .get();

  if (subsSnap.empty)
    throw new Error("No active or overdue subscription found.");

  const subscription = subsSnap.docs[0];
  const subData = subscription.data();
  const currentEndDate = subData.end_date.toDate();

  const newEndDate = new Date(currentEndDate);
  if (subData.billing_cycle === "yearly") {
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
  } else {
    newEndDate.setMonth(newEndDate.getMonth() + 1);
  }

  const updates = {
    end_date: admin.firestore.Timestamp.fromDate(newEndDate),
    status: "active",
    renewal_count: admin.firestore.FieldValue.increment(1),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  const batch = db.batch();
  batch.update(subscription.ref, updates);

  // Ensure tenant is also active
  batch.update(db.collection("tenants").doc(tenantId), { status: "active" });

  await batch.commit();
  await logBillingActivity(tenantId, "SUBSCRIPTION_RENEWED", {
    new_end_date: newEndDate,
  });

  return { id: subscription.id, ...subData, ...updates, end_date: newEndDate };
};

/**
 * 6. handlePayment(tenantId, invoiceId, paymentRef): update payment record, trigger renewal
 * @param {string} tenantId
 * @param {string} invoiceId
 * @param {string} paymentRef - External payment reference (e.g. Stripe Charge ID)
 */
export const handlePayment = async (tenantId, invoiceId, paymentRef) => {
  const db = admin.firestore();
  const invoiceRef = db.collection("billing_invoices").doc(invoiceId);
  const invoiceDoc = await invoiceRef.get();

  if (!invoiceDoc.exists) throw new Error("Invoice not found.");
  if (invoiceDoc.data().status === "paid")
    throw new Error("Invoice is already paid.");

  const batch = db.batch();
  batch.update(invoiceRef, {
    status: "paid",
    payment_reference: paymentRef,
    paid_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit(); // Commit invoice first

  const renewedSub = await renewSubscription(tenantId);
  await logBillingActivity(tenantId, "PAYMENT_RECEIVED", {
    invoice_id: invoiceId,
    ref: paymentRef,
  });

  return { success: true, renewedSub };
};

/**
 * 7. generateInvoice(tenantId): create billing_invoice record with line items
 * @param {string} tenantId
 * @returns {Promise<object>}
 */
export const generateInvoice = async (tenantId) => {
  const db = admin.firestore();
  const subsSnap = await db
    .collection("tenant_subscriptions")
    .where("tenant_id", "==", tenantId)
    .where("status", "in", ["active", "overdue"])
    .limit(1)
    .get();

  if (subsSnap.empty)
    throw new Error("No active subscription found to invoice.");

  const sub = subsSnap.docs[0].data();
  const planDoc = await db
    .collection("subscription_plans")
    .doc(sub.plan_id)
    .get();

  if (!planDoc.exists) throw new Error("Subscription plan not found.");
  const plan = planDoc.data();

  const lineItems = [];
  let totalAmount = 0; // cents

  // Add Setup Fee if not paid
  if (!sub.setup_fee_paid && plan.setup_fee > 0) {
    lineItems.push({
      description: "One-time Setup Fee",
      amount: plan.setup_fee,
    });
    totalAmount += plan.setup_fee;
    // We should mark it paid on the sub (simplification for generation step)
    await subsSnap.docs[0].ref.update({ setup_fee_paid: true });
  }

  // Base Fee
  const cycleFee =
    sub.billing_cycle === "yearly" ? plan.monthly_fee * 12 : plan.monthly_fee;
  lineItems.push({
    description: `${plan.name} Plan - ${sub.billing_cycle === "yearly" ? "Annual" : "Monthly"} Subscription`,
    amount: cycleFee,
  });
  totalAmount += cycleFee;

  const invoiceRef = db.collection("billing_invoices").doc();
  const invoiceData = {
    id: invoiceRef.id,
    tenant_id: tenantId,
    subscription_id: subsSnap.docs[0].id,
    amount_due: totalAmount, // cents
    status: "open",
    line_items: lineItems,
    due_date: sub.end_date, // typically due by the end date
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await invoiceRef.set(invoiceData);
  await logBillingActivity(tenantId, "INVOICE_GENERATED", {
    invoice_id: invoiceRef.id,
    amount_due: totalAmount,
  });

  return invoiceData;
};

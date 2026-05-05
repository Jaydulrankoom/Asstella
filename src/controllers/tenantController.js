import Joi from "joi";
import * as tenantService from "../services/tenantService.js";

/**
 * Controller to create a new tenant.
 * POST /platform/tenants
 */
export const createTenant = async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      code: Joi.string().alphanum().min(3).max(20).required(),
      subdomain: Joi.string().alphanum().min(3).max(30).required(),
      logo_url: Joi.string().uri().optional(),
      theme_color: Joi.string()
        .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .optional(),
      timezone: Joi.string().optional(),
      currency: Joi.string().length(3).optional(),
      plan_id: Joi.string().optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: error.details[0].message,
      });
    }

    const createdById = req.authUser ? req.authUser.uid : "SYSTEM";
    const tenant = await tenantService.createTenant(value, createdById);

    return res.status(201).json({
      success: true,
      message: "Tenant created successfully.",
      data: tenant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to list tenants.
 * GET /platform/tenants
 */
export const listTenants = async (req, res, next) => {
  try {
    const { status, plan_id } = req.query;
    const db = (await import("firebase-admin")).default.firestore();

    let query = db.collection("tenants");
    if (status) query = query.where("status", "==", status);
    if (plan_id) query = query.where("plan_id", "==", plan_id);

    const snapshot = await query.orderBy("created_at", "desc").limit(100).get();

    const tenants = [];
    snapshot.forEach((doc) => {
      tenants.push(doc.data());
    });

    return res.json({ success: true, data: tenants });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get full tenant profile + usage stats.
 * GET /platform/tenants/:id
 */
export const getTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = (await import("firebase-admin")).default.firestore();
    const doc = await db.collection("tenants").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        code: "TENANT_NOT_FOUND",
        message: "Tenant not found.",
      });
    }

    const usageStats = await tenantService.getTenantUsageStats(id);

    return res.json({
      success: true,
      data: {
        profile: doc.data(),
        stats: usageStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to change tenant status (activate, suspend, reactivate)
 * PATCH /platform/tenants/:id/status
 */
export const changeTenantStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schema = Joi.object({
      status: Joi.string().valid("active", "suspended").required(),
      plan_id: Joi.string().when("status", {
        is: "active",
        then: Joi.required(),
      }),
      monthly_fee: Joi.number()
        .min(0)
        .when("status", { is: "active", then: Joi.optional() }),
      reason: Joi.string().when("status", {
        is: "suspended",
        then: Joi.required(),
      }),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: error.details[0].message,
      });
    }

    if (value.status === "active") {
      // For simplicity, checking if we update an existing suspended tenant vs brand new activation
      // would typically map to 'reactivate' or 'activate'. We will combine logic here or rely on specific params.
      // If it has plan_id, it is likely first activation or structural check
      await tenantService.activateTenant(id, value.plan_id, value.monthly_fee);
    } else if (value.status === "suspended") {
      await tenantService.suspendTenant(id, value.reason);
    }

    return res.json({
      success: true,
      message: `Tenant status updated to ${value.status}.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to upgrade tenant plan
 * POST /platform/tenants/:id/upgrade
 */
export const upgradeTenantPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { new_plan_id } = req.body;

    if (!new_plan_id) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "new_plan_id is required.",
      });
    }

    const result = await tenantService.upgradePlan(id, new_plan_id);
    return res.json({
      success: true,
      message: "Plan upgraded successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get invoice history
 * GET /platform/tenants/:id/invoice
 */
export const getTenantInvoices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = (await import("firebase-admin")).default.firestore();

    // Assuming you have an 'invoices' collection
    const snapshot = await db
      .collection("invoices")
      .where("tenant_id", "==", id)
      .orderBy("created_at", "desc")
      .get();

    const invoices = [];
    snapshot.forEach((doc) => invoices.push({ id: doc.id, ...doc.data() }));

    return res.json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for tenant onboarding
 * POST /platform/tenants/:id/onboarding
 */
export const onboarding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schema = Joi.object({
      branch_name: Joi.string().required(),
      department_name: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: error.details[0].message,
      });
    }

    await tenantService.tenantOnboarding(id, value);
    return res.json({
      success: true,
      message: "Onboarding completed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

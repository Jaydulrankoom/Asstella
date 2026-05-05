import admin from "firebase-admin";

/**
 * Loads the tenant document from Firestore using the tenant_id in req.authUser.
 * Checks if the tenant is active and if their subscription is still valid.
 * Attaches the tenant profile to req.tenant.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const tenantGuard = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;

    if (!tenant_id) {
      return res.status(403).json({
        success: false,
        code: "TENANT_MISSING",
        message: "No tenant ID associated with user account",
        timestamp: new Date().toISOString(),
      });
    }

    const db = admin.firestore();
    const tenantDoc = await db.collection("tenants").doc(tenant_id).get();

    if (!tenantDoc.exists) {
      return res.status(403).json({
        success: false,
        code: "TENANT_NOT_FOUND",
        message: "Tenant record not found",
        timestamp: new Date().toISOString(),
      });
    }

    const tenant = tenantDoc.data();

    // Ensure strictly active status
    if (tenant.status !== "active") {
      return res.status(403).json({
        success: false,
        code: "TENANT_SUSPENDED",
        message: "Tenant account is not active or suspended",
        timestamp: new Date().toISOString(),
      });
    }

    // Check subscription validity
    const now = new Date();
    const subEndDate = tenant.subscription?.end_date?.toDate
      ? tenant.subscription.end_date.toDate()
      : new Date(tenant.subscription?.end_date); // Support string fallback

    if (!subEndDate || subEndDate <= now) {
      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_EXPIRED",
        message: "Tenant subscription has expired",
        timestamp: new Date().toISOString(),
      });
    }

    // Attach tenant profile to request object
    req.tenant = {
      id: tenantDoc.id,
      ...tenant,
    };

    next();
  } catch (error) {
    next(error); // Pass to global errorHandler
  }
};

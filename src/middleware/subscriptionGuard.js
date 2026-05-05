import admin from "firebase-admin";

const planCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Factory that returns an Express middleware to check if the tenant's plan
 * includes the requested module. Caches plan definitions in memory for 5 minutes.
 *
 * @param {string} moduleKey - The key of the module strictly required to pass (e.g., 'depreciation', 'inventory')
 * @returns {import('express').RequestHandler}
 */
export const checkModule = (moduleKey) => {
  return async (req, res, next) => {
    try {
      const planId = req.tenant?.plan_id;

      if (!planId) {
        return res.status(403).json({
          success: false,
          code: "PLAN_MISSING",
          message: "Tenant plan ID is missing",
          timestamp: new Date().toISOString(),
        });
      }

      let planData;
      const cached = planCache.get(planId);

      // Check cache validity
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        planData = cached.data;
      } else {
        const db = admin.firestore();
        // Load the tenant's plan from the 'subscription_plans' collection
        const planDoc = await db
          .collection("subscription_plans")
          .doc(planId)
          .get();

        if (!planDoc.exists) {
          return res.status(403).json({
            success: false,
            code: "PLAN_NOT_FOUND",
            message: "Plan modules configuration not found",
            timestamp: new Date().toISOString(),
          });
        }

        planData = planDoc.data();
        // Update cache
        planCache.set(planId, { timestamp: Date.now(), data: planData });
      }

      const hasModule =
        planData.modules && planData.modules.includes(moduleKey);

      if (!hasModule) {
        // Format the module name nicely for the error message (e.g., "depreciation" -> "Depreciation")
        const formattedModuleName =
          moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);
        return res.status(403).json({
          success: false,
          code: "MODULE_NOT_IN_PLAN",
          message: `Your plan does not include the ${formattedModuleName} module. Upgrade to Professional.`,
          timestamp: new Date().toISOString(),
        });
      }

      next();
    } catch (error) {
      next(error); // Pass to global errorHandler
    }
  };
};

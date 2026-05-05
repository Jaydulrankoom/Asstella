/**
 * Factory that returns an Express middleware to check if the user has
 * the specific permission action within a module.
 *
 * @param {string} moduleKey - The key of the module (e.g., 'inventory', 'users')
 * @param {string} action - The action type string (e.g., 'read', 'write', 'delete')
 * @returns {import('express').RequestHandler}
 */
export const checkPermission = (moduleKey, action) => {
  return (req, res, next) => {
    try {
      const { permissions } = req.authUser;

      if (
        !permissions ||
        !permissions[moduleKey] ||
        permissions[moduleKey][action] !== true
      ) {
        return res.status(403).json({
          success: false,
          code: "PERMISSION_DENIED",
          message: `You do not have permission to perform action '${action}' on module '${moduleKey}'`,
          timestamp: new Date().toISOString(),
        });
      }

      next();
    } catch (error) {
      next(error); // Pass to global errorHandler
    }
  };
};

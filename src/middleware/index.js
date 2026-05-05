import { admin, db } from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development, if no token is provided, we can look for a development session or bypass
      if (process.env.NODE_ENV === 'development' || process.env.ALLOW_DEV_AUTH === 'true') {
        req.user = {
          uid: 'dev-user-id',
          email: 'admin@asstella.com',
          tenant_id: 'tenant-demo-erp',
          role_id: 'platform-owner',
          is_platform_admin: true,
          permissions: { all: true }
        };
        return next();
      }
      return res.status(401).json({ success: false, code: 'AUTH_001', message: 'No token provided' });
    }
    const token = authHeader.split('Bearer ')[1];

    // Development bypass token
    if ((process.env.NODE_ENV === 'development' || process.env.ALLOW_DEV_AUTH === 'true') && token === 'dev-token') {
      req.user = {
        uid: 'dev-user-id',
        email: 'admin@asstella.com',
        tenant_id: 'tenant-demo-erp',
        role_id: 'platform-owner',
        is_platform_admin: true,
        permissions: { all: true }
      };
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      tenant_id: decodedToken.tenant_id,
      role_id: decodedToken.role_id,
      is_platform_admin: decodedToken.is_platform_admin === true,
      permissions: decodedToken.permissions || {}
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, code: 'AUTH_002', message: 'Invalid or expired token' });
  }
};

export const isPlatformAdmin = (req, res, next) => {
  if (req.user && req.user.is_platform_admin === true) {
    next();
  } else {
    return res.status(403).json({ success: false, code: 'PLATFORM_ONLY', message: 'Platform admin access required' });
  }
};

export const tenantGuard = async (req, res, next) => {
  try {
    if (!req.user || !req.user.tenant_id) {
      return res.status(403).json({ success: false, code: 'MISSING_TENANT_ID', message: 'User has no assigned tenant' });
    }
    const tenantDoc = await db.collection('tenants').doc(req.user.tenant_id).get();
    if (!tenantDoc.exists) {
      return res.status(404).json({ success: false, code: 'TENANT_NOT_FOUND', message: 'Tenant not found' });
    }
    const tenant = tenantDoc.data();
    if (tenant.status === 'suspended' || tenant.status === 'expired') {
      return res.status(403).json({ success: false, code: 'TENANT_SUSPENDED', message: `Tenant account is ${tenant.status}` });
    }
    req.tenant = { id: tenantDoc.id, ...tenant };
    next();
  } catch (error) {
    return res.status(500).json({ success: false, code: 'TENANT_GUARD_ERROR', message: 'Failed to verify tenant status', details: error.message });
  }
};

export const subscriptionGuard = (moduleKey) => {
  return async (req, res, next) => {
    try {
      if (!req.tenant || !req.tenant.plan_id) {
        return res.status(403).json({ success: false, code: 'NO_PLAN', message: 'Tenant has no active plan' });
      }
      const planDoc = await db.collection('subscription_plans').doc(req.tenant.plan_id).get();
      const enabledModules = planDoc.exists ? planDoc.data().plan_modules || [] : [];
      
      if (enabledModules.includes(moduleKey)) {
        next();
      } else {
        return res.status(403).json({ success: false, code: 'MODULE_NOT_IN_PLAN', message: `Upgrade your plan to access ${moduleKey}`, upgrade_url: '/settings/billing' });
      }
    } catch (error) {
      return res.status(500).json({ success: false, code: 'SUBSCRIPTION_GUARD_ERROR', message: 'Failed to verify subscription modules' });
    }
  };
};

export const checkPermission = (moduleKey, action) => {
  return (req, res, next) => {
    const requiredPerm = `${moduleKey}.${action}`;
    if (req.user && req.user.permissions && req.user.permissions[requiredPerm] === true) {
      next();
    } else {
      return res.status(403).json({ success: false, code: 'PERMISSION_DENIED', message: `Required permission: ${requiredPerm}` });
    }
  };
};

export const activityLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration_ms = Date.now() - start;
    if (req.user && req.user.tenant_id) {
      const logData = {
        tenant_id: req.user.tenant_id,
        user_id: req.user.uid,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };
      // Fire-and-forget logging
      db.collection('activity_logs').add(logData).catch(err => {
        const isPermissionError = err.message.includes('PERMISSION_DENIED') || err.message.includes('not been used');
        if (isPermissionError) {
          if (!global.firestore_api_disabled_logged) {
             console.error('CRITICAL: Cloud Firestore API is disabled or permissions are missing for project ' + (process.env.FIREBASE_PROJECT_ID || 'asstella-cd3ac'));
             console.error('Visit the URL in error to enable it.');
             global.firestore_api_disabled_logged = true;
          }
        } else {
           console.error('Activity log fail:', err.message);
        }
      });
    }
  });
  next();
};

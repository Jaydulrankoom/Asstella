import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase Admin once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: firebaseConfig.projectId,
  });
}

const db = admin.firestore();
export { db };

/**
 * Extended Request interface for multi-tenant context
 */
export interface SaaSRequest extends Request {
  /** Decoded Firebase ID Token data */
  authUser?: {
    uid: string;
    email?: string;
    tenantId: string;
    role: string;
  };
  /** Active tenant document data */
  tenant?: any;
  /** User document data from the tenant's context */
  user?: any;
  /** Flattened user permissions map */
  permissions?: Record<string, boolean>;
}

/**
 * 1. Verify Firebase ID token and extract basic identity and multi-tenant claims.
 * Expects Authorization: Bearer <token>
 *
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Next Function
 */
export async function verifyFirebaseToken(req: SaaSRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ 
      error: "UNAUTHORIZED", 
      message: "Authorization header missing or invalid format" 
    });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Ensure the token contains necessary multi-tenant claims
    // These would typically be set via Firebase Auth Custom Claims during invite/signup
    req.authUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      tenantId: (decodedToken.tenant_id as string) || (decodedToken.tenantId as string),
      role: decodedToken.role as string,
    };

    if (!req.authUser.tenantId) {
      console.error(`Token missing tenant_id claim for user ${decodedToken.uid}`);
      return res.status(401).json({ 
        error: "INVALID_SESSION", 
        message: "Your account is not associated with a tenant. Please contact support." 
      });
    }

    next();
  } catch (error) {
    console.error("Firebase ID Token verification failed:", error);
    return res.status(401).json({ 
      error: "UNAUTHORIZED", 
      message: "Invalid or expired authentication token" 
    });
  }
}

/**
 * 2. Load and validate the tenant's profile and subscription status.
 *
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Next Function
 */
export async function loadTenantProfile(req: SaaSRequest, res: Response, next: NextFunction) {
  if (!req.authUser?.tenantId) return next();

  try {
    const tenantDoc = await db.collection("tenants").doc(req.authUser.tenantId).get();

    if (!tenantDoc.exists) {
      return res.status(404).json({ error: "TENANT_NOT_FOUND", message: "Company profile not found" });
    }

    const tenantData = tenantDoc.data();

    // Check status
    if (tenantData?.status !== "active") {
      return res.status(403).json({ 
        error: "TENANT_SUSPENDED", 
        message: "Your company access has been suspended. Please contact your billing administrator." 
      });
    }

    // Check subscription validity
    const subscriptionEndDate = tenantData?.subscription?.endDate?.toDate?.() || new Date(tenantData?.subscription?.endDate);
    if (subscriptionEndDate < new Date()) {
      return res.status(403).json({ 
        error: "SUBSCRIPTION_EXPIRED", 
        message: "Your company subscription has expired. Please renew to continue." 
      });
    }

    req.tenant = tenantData;
    next();
  } catch (error) {
    console.error("Error loading tenant profile:", error);
    return res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to verify company status" });
  }
}

/**
 * 3. Load user-specific permissions by resolving roles and permission overrides.
 *
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Next Function
 */
export async function loadUserPermissions(req: SaaSRequest, res: Response, next: NextFunction) {
  if (!req.authUser?.uid || !req.authUser?.tenantId) return next();

  try {
    const tenantId = req.authUser.tenantId;
    const uid = req.authUser.uid;

    // 1. Get User Document
    const userDoc = await db.collection("tenants").doc(tenantId).collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(403).json({ error: "USER_NOT_REGISTERED", message: "User is not mapped to this tenant" });
    }
    const userData = userDoc.data();

    // 2. Load User Roles
    const userRolesSnap = await db.collection("tenants").doc(tenantId).collection("users").doc(uid).collection("user_roles").get();
    const roleIds = userRolesSnap.docs.map(doc => doc.id);

    // 3. Resolve Permissions from Roles
    const permissionSet: Record<string, boolean> = {};

    for (const roleId of roleIds) {
      const permissionsSnap = await db.collection("tenants").doc(tenantId).collection("roles").doc(roleId).collection("permissions").get();
      permissionsSnap.forEach(doc => {
        // Merge permissions (assuming grant strategy: any role giving access grants it)
        const perm = doc.id; // e.g. "asset.create"
        const isGranted = doc.data().granted ?? true;
        if (isGranted) {
          permissionSet[perm] = true;
        }
      });
    }

    req.user = userData;
    req.permissions = permissionSet;
    next();
  } catch (error) {
    console.error("Error loading user permissions:", error);
    return res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to resolve security permissions" });
  }
}

/**
 * 4. Middleware factory for check-point authorization.
 *
 * @param permissionKey - The key of the permission required (e.g. 'asset.create')
 * @returns Middleware function
 */
export function checkPermission(permissionKey: string) {
  return (req: SaaSRequest, res: Response, next: NextFunction) => {
    if (req.permissions && req.permissions[permissionKey]) {
      return next();
    }
    
    return res.status(403).json({ 
      error: "PERMISSION_DENIED", 
      message: `You do not have the required permission: ${permissionKey}` 
    });
  };
}

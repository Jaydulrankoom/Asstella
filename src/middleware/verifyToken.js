import admin from "firebase-admin";

/**
 * Extracts Bearer token from Authorization header and verifies it via Firebase Admin.
 * Decodes standard claims (uid, email) and custom claims (tenant_id, role, permissions).
 * Attaches decoded data to req.authUser.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "AUTH_001",
        message: "Missing or invalid authentication token",
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the ID token first.
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.authUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      tenant_id: decodedToken.tenant_id,
      role: decodedToken.role,
      permissions: decodedToken.permissions || {},
    };

    next();
  } catch (error) {
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        code: "AUTH_002",
        message: "Authentication token has expired",
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(401).json({
      success: false,
      code: "AUTH_001",
      message: "Missing or invalid authentication token",
      timestamp: new Date().toISOString(),
    });
  }
};

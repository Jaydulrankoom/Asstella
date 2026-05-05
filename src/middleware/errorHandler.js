import admin from "firebase-admin";

/**
 * Global Express error handler middleware.
 * Should be placed last in the middleware chain.
 * Maps application errors to generic 500 format and logs via structured logging to Firestore.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const errorHandler = async (err, req, res, next) => {
  const timestamp = new Date().toISOString();

  // Use structured logging info (avoiding plain console.log for production logic)
  const logData = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    tenant_id: req.authUser?.tenant_id || "UNKNOWN",
    uid: req.authUser?.uid || "UNKNOWN",
    timestamp,
    headers: req.headers,
    body: req.body,
  };

  try {
    // Log unexpected or 500 errors to system_logs in Firestore
    const db = admin.firestore();
    await db.collection("system_logs").add(logData);
  } catch (logError) {
    // Failsafe structured log output via process std streams if Firestore write fails
    process.stderr.write(
      JSON.stringify({
        level: "error",
        context: "errorHandler - Failed to persist log",
        originalError: logData,
        logError: logError.message,
      }) + "\n",
    );
  }

  // Handle known error formats implicitly if attached to `err`,
  // otherwise fallback to 500
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    code: err.code || "INTERNAL_SERVER_ERROR",
    message: statusCode === 500 ? "An unexpected error occurred" : err.message,
    timestamp,
  });
};

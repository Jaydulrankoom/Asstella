import * as notificationService from "../services/notificationService.js";
import admin from "firebase-admin";

export const getMyNotifications = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const db = admin.firestore();

    let limit = parseInt(req.query.limit) || 50;

    let query = db
      .collection("notifications")
      .where("tenant_id", "==", tenant_id)
      .where("user_id", "==", uid)
      .orderBy("created_at", "desc")
      .limit(limit);

    if (req.query.unreadOnly === "true") {
      // Need a composite index for this query (tenant_id, user_id, is_read, created_at)
      // query = query.where('is_read', '==', false);
      // For simplicity if index missing, filter in mem for demo:
    }

    const snap = await query.get();
    let notifications = snap.docs.map((doc) => doc.data());

    if (req.query.unreadOnly === "true") {
      notifications = notifications.filter((n) => !n.is_read);
    }

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { tenant_id, uid } = req.authUser;
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds)) {
      return res
        .status(400)
        .json({ success: false, message: "notificationIds must be an array" });
    }

    // Verify ownership implicitly or ideally fetch and check, but tenant validation helps.
    await notificationService.markNotificationsAsRead(
      tenant_id,
      uid,
      notificationIds,
    );
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;
    const { roleId } = req.query;
    if (!roleId)
      return res
        .status(400)
        .json({ success: false, message: "roleId is required" });

    const settings = await notificationService.getNotificationSettings(
      tenant_id,
      roleId,
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { tenant_id } = req.authUser;

    if (!req.body.role_id || !req.body.alert_type) {
      return res.status(400).json({
        success: false,
        message: "role_id and alert_type are required",
      });
    }

    const saved = await notificationService.saveNotificationSetting(
      tenant_id,
      req.body,
    );
    res.json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
};

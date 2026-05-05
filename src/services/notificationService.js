import admin from "firebase-admin";
import nodemailer from "nodemailer";

// Setup Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendEmail = async (to, subject, htmlBody) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[Email] Missing Gmail credentials. Skipping email send.");
    return;
  }
  
  try {
    const info = await transporter.sendMail({
      from: `"Asstella ERP" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: htmlBody,
    });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
  }
};

const sendSMS = async (phone, message) => {
  console.log(`[SMS] Sending to ${phone}: ${message}`);
  // Implement Twilio / SNS / Local SMS Gateway here
};

export const dispatchNotification = async (
  tenantId,
  eventType,
  payload,
  targetUserIds,
) => {
  const db = admin.firestore();

  // 1. Resolve users to get their roles, FCM tokens, email, phone
  const usersToNotify = [];

  // Batch get users
  const chunkedIds = [];
  for (let i = 0; i < targetUserIds.length; i += 10) {
    chunkedIds.push(targetUserIds.slice(i, i + 10));
  }

  for (const chunk of chunkedIds) {
    const usersSnap = await db
      .collection("tenant_users")
      .where("tenant_id", "==", tenantId)
      .where(admin.firestore.FieldPath.documentId(), "in", chunk)
      .get();

    usersSnap.forEach((doc) => {
      usersToNotify.push({ id: doc.id, ...doc.data() });
    });
  }

  // Group by role to fetch settings efficiently
  const roles = [...new Set(usersToNotify.map((u) => u.role_id))];
  const settingsByRole = {};

  if (roles.length > 0) {
    const settingsSnap = await db
      .collection("notification_settings")
      .where("tenant_id", "==", tenantId)
      .where("role_id", "in", roles)
      .where("alert_type", "==", eventType)
      .get();

    settingsSnap.forEach((doc) => {
      const setting = doc.data();
      settingsByRole[setting.role_id] = setting.channels_enabled;
    });
  }

  // Format title and body based on eventType
  const { title, body } = formatNotificationContent(eventType, payload);

  const notificationsToSave = [];
  const fcmTokens = [];
  const emailsToSend = [];
  const smsToSend = [];

  for (const user of usersToNotify) {
    // Default channels if no specific setting exists
    const channels = settingsByRole[user.role_id] || {
      in_app: true,
      email: true,
      push: true,
      sms: false,
    };

    if (channels.in_app) {
      notificationsToSave.push({
        id: db.collection("notifications").doc().id,
        tenant_id: tenantId,
        user_id: user.id,
        title,
        body,
        type: eventType,
        reference_type: payload.reference_type || "system",
        reference_id: payload.reference_id || null,
        is_read: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    if (channels.push && user.fcm_tokens && user.fcm_tokens.length > 0) {
      fcmTokens.push(...user.fcm_tokens);
    }

    if (channels.email && user.email) {
      emailsToSend.push(user.email);
    }

    if (channels.sms && user.phone) {
      smsToSend.push(user.phone);
    }
  }

  // Execute In-App
  if (notificationsToSave.length > 0) {
    const batch = db.batch();
    for (const notif of notificationsToSave) {
      batch.set(db.collection("notifications").doc(notif.id), notif);
    }
    await batch.commit();
  }

  // Execute FCM
  if (fcmTokens.length > 0) {
    const message = {
      notification: { title, body },
      tokens: fcmTokens,
      data: {
        type: eventType,
        reference_type: payload.reference_type || "",
        reference_id: payload.reference_id || "",
      },
    };
    try {
      await admin.messaging().sendMulticast(message);
    } catch (e) {
      console.error("FCM send failed:", e);
    }
  }

  // Execute Emails
  for (const email of emailsToSend) {
    await sendEmail(email, title, body);
  }

  // Execute SMS
  for (const phone of smsToSend) {
    await sendSMS(phone, `${title}: ${body}`);
  }
};

const formatNotificationContent = (eventType, payload) => {
  let title = "Notification";
  let body = "You have a new notification.";

  switch (eventType) {
    case "WARRANTY_EXPIRING_30DAYS":
      title = "Warranty Expiring Soon";
      body = `Warranty for asset ${payload.asset_code} expires in thirty days.`;
      break;
    case "WARRANTY_EXPIRING_7DAYS":
      title = "URGENT: Warranty Expiring";
      body = `Warranty for asset ${payload.asset_code} expires in 7 days!`;
      break;
    case "AMC_RENEWAL_60DAYS":
      title = "AMC Renewal Due";
      body = `AMC Contract ${payload.contract_no} expires in 60 days.`;
      break;
    case "MAINTENANCE_OVERDUE":
      title = "Maintenance Overdue";
      body = `Ticket ${payload.ticket_id} is overdue.`;
      break;
    case "TRANSFER_APPROVAL_NEEDED":
      title = "Transfer Approval Required";
      body = `Transfer request ${payload.transfer_id} requires your approval.`;
      break;
    case "TRANSFER_APPROVED":
      title = "Transfer Approved";
      body = `Your transfer request ${payload.transfer_id} has been approved.`;
      break;
    case "GPS_GEOFENCE_BREACH":
      title = "Geofence Breach Alert";
      body = `Vehicle ${payload.vehicle_name} breached a geofence.`;
      break;
    case "PAYMENT_DUE":
      title = "Subscription Payment Due";
      body = `Your ERP subscription is due soon. Please process payment.`;
      break;
    case "SUSPICIOUS_LOGIN":
      title = "Security Alert: Suspicious Login";
      body = `Suspicious login detected for user ${payload.email} from IP ${payload.ip}.`;
      break;
    default:
      if (payload.title && payload.body) {
        title = payload.title;
        body = payload.body;
      }
      break;
  }
  return { title, body };
};

export const getNotificationSettings = async (tenantId, roleId) => {
  const db = admin.firestore();
  const snap = await db
    .collection("notification_settings")
    .where("tenant_id", "==", tenantId)
    .where("role_id", "==", roleId)
    .get();
  return snap.docs.map((doc) => doc.data());
};

export const saveNotificationSetting = async (tenantId, data) => {
  const db = admin.firestore();
  // UPSERT based on role_id and alert_type
  const query = await db
    .collection("notification_settings")
    .where("tenant_id", "==", tenantId)
    .where("role_id", "==", data.role_id)
    .where("alert_type", "==", data.alert_type)
    .limit(1)
    .get();

  let ref;
  if (!query.empty) {
    ref = query.docs[0].ref;
  } else {
    ref = db.collection("notification_settings").doc();
  }

  const payload = {
    id: ref.id,
    tenant_id: tenantId,
    role_id: data.role_id,
    alert_type: data.alert_type,
    channels_enabled: data.channels_enabled || {
      in_app: true,
      email: false,
      push: true,
      sms: false,
    },
    trigger_days_before: data.trigger_days_before || 0,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await ref.set(payload, { merge: true });
  return payload;
};

export const markNotificationsAsRead = async (
  tenantId,
  userId,
  notificationIds,
) => {
  const db = admin.firestore();
  const batch = db.batch();

  for (const id of notificationIds) {
    const ref = db.collection("notifications").doc(id);
    batch.update(ref, {
      is_read: true,
      read_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  return { success: true };
};

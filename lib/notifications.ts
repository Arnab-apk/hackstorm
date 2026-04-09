import { getNotificationsCollection, generateId } from './db';
import type { DBNotification, NotificationType } from '@/types';

// ===========================================
// NOTIFICATION CREATION
// ===========================================

/**
 * Create a notification for a user
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data: Record<string, any> = {}
): Promise<DBNotification> {
  const collection = await getNotificationsCollection();
  
  const notification: DBNotification = {
    _id: generateId('notif'),
    userId: userId.toLowerCase(),
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date(),
  };

  await collection.insertOne(notification);
  return notification;
}

/**
 * Create credential issued notification
 */
export async function notifyCredentialIssued(
  userId: string,
  credentialId: string,
  credentialType: string
): Promise<DBNotification> {
  return createNotification(
    userId,
    'credential_issued',
    'New Credential Received',
    `You have received a new ${credentialType} credential.`,
    { credentialId, credentialType }
  );
}

/**
 * Create credential revoked notification
 */
export async function notifyCredentialRevoked(
  userId: string,
  credentialId: string,
  credentialType: string,
  reason: string
): Promise<DBNotification> {
  return createNotification(
    userId,
    'credential_revoked',
    'Credential Revoked',
    `Your ${credentialType} credential has been revoked. Reason: ${reason}`,
    { credentialId, credentialType, reason }
  );
}

/**
 * Create verification request notification
 */
export async function notifyVerificationRequest(
  userId: string,
  requestId: string,
  verifierName: string,
  credentialType: string
): Promise<DBNotification> {
  return createNotification(
    userId,
    'verification_request',
    'Verification Request',
    `${verifierName} is requesting verification of your ${credentialType} credential.`,
    { requestId, verifierName, credentialType }
  );
}

/**
 * Create request approved notification (for verifier)
 */
export async function notifyRequestApproved(
  verifierId: string,
  requestId: string,
  credentialType: string
): Promise<DBNotification> {
  return createNotification(
    verifierId,
    'request_approved',
    'Verification Approved',
    `Your verification request for ${credentialType} has been approved.`,
    { requestId, credentialType }
  );
}

/**
 * Create request rejected notification (for verifier)
 */
export async function notifyRequestRejected(
  verifierId: string,
  requestId: string,
  credentialType: string
): Promise<DBNotification> {
  return createNotification(
    verifierId,
    'request_rejected',
    'Verification Rejected',
    `Your verification request for ${credentialType} has been rejected.`,
    { requestId, credentialType }
  );
}

/**
 * Create request expired notification
 */
export async function notifyRequestExpired(
  userId: string,
  requestId: string,
  verifierName: string
): Promise<DBNotification> {
  return createNotification(
    userId,
    'request_expired',
    'Verification Request Expired',
    `The verification request from ${verifierName} has expired.`,
    { requestId, verifierName }
  );
}

// ===========================================
// NOTIFICATION RETRIEVAL
// ===========================================

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
  options: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ notifications: DBNotification[]; total: number; unread: number }> {
  const collection = await getNotificationsCollection();
  const { unreadOnly = false, limit = 20, offset = 0 } = options;

  const filter: any = { userId: userId.toLowerCase() };
  if (unreadOnly) {
    filter.read = false;
  }

  const [notifications, total, unread] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray(),
    collection.countDocuments({ userId: userId.toLowerCase() }),
    collection.countDocuments({ userId: userId.toLowerCase(), read: false }),
  ]);

  return { notifications, total, unread };
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const collection = await getNotificationsCollection();
  return collection.countDocuments({ userId: userId.toLowerCase(), read: false });
}

// ===========================================
// NOTIFICATION MANAGEMENT
// ===========================================

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const collection = await getNotificationsCollection();
  await collection.updateOne(
    { _id: notificationId },
    { $set: { read: true } }
  );
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const collection = await getNotificationsCollection();
  await collection.updateMany(
    { userId: userId.toLowerCase(), read: false },
    { $set: { read: true } }
  );
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const collection = await getNotificationsCollection();
  await collection.deleteOne({ _id: notificationId });
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(userId: string): Promise<void> {
  const collection = await getNotificationsCollection();
  await collection.deleteMany({ userId: userId.toLowerCase() });
}

/**
 * Delete old notifications (older than specified days)
 */
export async function deleteOldNotifications(daysOld: number = 30): Promise<number> {
  const collection = await getNotificationsCollection();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await collection.deleteMany({
    createdAt: { $lt: cutoffDate },
    read: true,
  });

  return result.deletedCount;
}

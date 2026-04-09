import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { 
  successResponse, 
  notFound,
  forbidden,
  handleError 
} from '@/lib/response';
import { getNotificationsCollection } from '@/lib/db';
import { markAsRead, deleteNotification } from '@/lib/notifications';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/recipient/notifications/[id]
 * Mark notification as read
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Get notification
    const notificationsCollection = await getNotificationsCollection();
    const notification = await notificationsCollection.findOne({ _id: id });

    if (!notification) {
      return notFound('Notification');
    }

    // Verify ownership
    if (notification.userId.toLowerCase() !== session.address.toLowerCase()) {
      return forbidden('This notification does not belong to you');
    }

    // Mark as read
    await markAsRead(id);

    return successResponse({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/recipient/notifications/[id]
 * Delete a notification
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Get notification
    const notificationsCollection = await getNotificationsCollection();
    const notification = await notificationsCollection.findOne({ _id: id });

    if (!notification) {
      return notFound('Notification');
    }

    // Verify ownership
    if (notification.userId.toLowerCase() !== session.address.toLowerCase()) {
      return forbidden('This notification does not belong to you');
    }

    // Delete
    await deleteNotification(id);

    return successResponse({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

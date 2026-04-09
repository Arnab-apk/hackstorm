import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleError } from '@/lib/response';
import { 
  getNotifications, 
  markAllAsRead,
  getUnreadCount,
} from '@/lib/notifications';

/**
 * GET /api/recipient/notifications
 * Get notifications for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { notifications, total, unread } = await getNotifications(
      session.address,
      { unreadOnly, limit, offset }
    );

    return successResponse({
      notifications: notifications.map(n => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data,
        read: n.read,
        createdAt: n.createdAt,
      })),
      total,
      unread,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/recipient/notifications
 * Mark all notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const { action } = body;

    if (action === 'markAllRead') {
      await markAllAsRead(session.address);
      return successResponse({ success: true });
    }

    return successResponse({ success: false, message: 'Unknown action' });
  } catch (error) {
    return handleError(error);
  }
}

import { clearSessionCookie } from '@/lib/auth';
import { successResponse, handleError } from '@/lib/response';

/**
 * POST /api/auth/logout
 * Logout and clear session
 */
export async function POST() {
  try {
    await clearSessionCookie();
    return successResponse({ message: 'Logged out successfully' });
  } catch (error) {
    return handleError(error);
  }
}

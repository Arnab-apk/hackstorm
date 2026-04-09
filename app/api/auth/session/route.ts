import { getSession } from '@/lib/auth';
import { successResponse, unauthorized, handleError } from '@/lib/response';

/**
 * GET /api/auth/session
 * Get current session info
 */
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return unauthorized('No active session');
    }

    return successResponse({
      address: session.address,
      did: session.did,
      role: session.role,
      email: session.email,
    });
  } catch (error) {
    return handleError(error);
  }
}

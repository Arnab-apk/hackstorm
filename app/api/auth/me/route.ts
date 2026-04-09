import { getSession } from '@/lib/auth';
import { successResponse, unauthorized, handleError } from '@/lib/response';

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return unauthorized('Not authenticated');
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

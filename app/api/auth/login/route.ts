import { NextRequest } from 'next/server';
import { 
  createSession, 
  setSessionCookie, 
  verifyWeb3AuthToken 
} from '@/lib/auth';
import { 
  successResponse, 
  badRequest, 
  unauthorized,
  handleError 
} from '@/lib/response';
import { getRole } from '@/lib/roles';
import { createDIDFromAddress } from '@/lib/credentials';

/**
 * POST /api/auth/login
 * Login with Web3Auth ID token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, address, email } = body;

    // Validate input
    if (!idToken && !address) {
      return badRequest('Either idToken or address is required');
    }

    let userAddress: string;
    let userEmail: string | undefined;

    // If ID token provided, verify it
    if (idToken) {
      const tokenData = await verifyWeb3AuthToken(idToken);
      if (!tokenData) {
        return unauthorized('Invalid ID token');
      }
      userAddress = tokenData.address;
      userEmail = tokenData.email;
    } else {
      // For development/testing, allow direct address login
      if (process.env.NODE_ENV === 'production') {
        return badRequest('ID token required in production');
      }
      userAddress = address.toLowerCase();
      userEmail = email;
    }

    // Create session
    const token = await createSession(userAddress, userEmail);
    
    // Set session cookie
    await setSessionCookie(token);

    // Get user info
    const role = getRole(userAddress);
    const did = createDIDFromAddress(userAddress);

    return successResponse({
      address: userAddress,
      did,
      role,
      email: userEmail,
    });
  } catch (error) {
    return handleError(error);
  }
}

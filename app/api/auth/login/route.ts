import { NextRequest } from 'next/server';
import { 
  createSession, 
  setSessionCookie,
} from '@/lib/auth';
import { 
  successResponse, 
  badRequest, 
  handleError 
} from '@/lib/response';
import { getRole } from '@/lib/roles';
import { createDIDFromAddress } from '@/lib/credentials';

/**
 * POST /api/auth/login
 * Login with wallet address.
 * Role is determined by matching the address against env vars
 * (ISSUER_WALLET_ADDRESS, VERIFIER_WALLET_ADDRESS).
 * All other addresses default to "user".
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, email } = body;

    if (!address) {
      return badRequest('Wallet address is required');
    }

    const userAddress = address.toLowerCase();
    const userEmail = email;

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

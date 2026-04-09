import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import type { AuthSession, Role } from '@/types';
import { getRole } from './roles';
import { createDIDFromAddress } from './credentials';

// ===========================================
// CONFIGURATION
// ===========================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-characters-long'
);
const SESSION_EXPIRY = process.env.SESSION_EXPIRY || '7d';
const COOKIE_NAME = 'auth_session';

// ===========================================
// SESSION MANAGEMENT
// ===========================================

/**
 * Create a new session for a user
 */
export async function createSession(
  address: string,
  email?: string
): Promise<string> {
  const role = getRole(address);
  const did = createDIDFromAddress(address);

  const payload: Omit<AuthSession, 'iat' | 'exp'> = {
    address: address.toLowerCase(),
    did,
    role,
    email,
  };

  const token = await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a session token
 */
export async function verifySession(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthSession;
  } catch {
    return null;
  }
}

/**
 * Get current session from cookies
 */
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }

  return verifySession(token);
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  // Parse expiry from SESSION_EXPIRY
  const expiryMs = parseExpiry(SESSION_EXPIRY);
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiryMs / 1000, // Convert to seconds
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ===========================================
// AUTH MIDDLEWARE HELPERS
// ===========================================

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  
  if (!session) {
    throw new AuthError('Authentication required', 401);
  }

  return session;
}

/**
 * Require specific role - throws if not authorized
 */
export async function requireRole(role: Role): Promise<AuthSession> {
  const session = await requireAuth();
  
  if (session.role !== role) {
    throw new AuthError(`Role '${role}' required`, 403);
  }

  return session;
}

/**
 * Require issuer role
 */
export async function requireIssuer(): Promise<AuthSession> {
  return requireRole('issuer');
}

/**
 * Require verifier role
 */
export async function requireVerifier(): Promise<AuthSession> {
  return requireRole('verifier');
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: Role): Promise<boolean> {
  const session = await getSession();
  return session?.role === role;
}

// ===========================================
// WEB3AUTH INTEGRATION
// ===========================================

/**
 * Verify Web3Auth token and extract user info
 * This would be called when user logs in via Web3Auth
 */
export async function verifyWeb3AuthToken(
  idToken: string
): Promise<{ address: string; email?: string } | null> {
  // In production, verify the token with Web3Auth's JWKS endpoint
  // For hackathon, we trust the client-provided data after basic validation
  
  try {
    // Decode the JWT (without verification for hackathon)
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    
    // Extract wallet addresses from the token
    const walletAddress = payload.wallets?.[0]?.address;
    const email = payload.email;

    if (!walletAddress) {
      return null;
    }

    return {
      address: walletAddress.toLowerCase(),
      email,
    };
  } catch {
    return null;
  }
}

/**
 * Predict wallet address from email using Web3Auth
 * This is a placeholder - in production, use Web3Auth's server SDK
 */
export async function predictAddressFromEmail(email: string): Promise<string> {
  // In production, use Web3Auth Node SDK:
  // const web3auth = new Web3Auth({ clientId: ... });
  // const address = await web3auth.getPublicAddress({ verifier: ..., verifierId: email });
  
  // For hackathon, we'll need the actual Web3Auth integration
  // This is a placeholder that returns a deterministic hash
  const { keccak_256 } = await import('@noble/hashes/sha3');
  const { bytesToHex } = await import('@noble/hashes/utils');
  
  const hash = keccak_256(new TextEncoder().encode(email));
  const address = '0x' + bytesToHex(hash.slice(0, 20));
  
  return address;
}

// ===========================================
// ERROR HANDLING
// ===========================================

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000; // Default 7 days
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

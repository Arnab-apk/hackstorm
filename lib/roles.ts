import type { Role } from '@/types';

// ===========================================
// ROLE CONFIGURATION
// ===========================================

// Hardcoded addresses for hackathon demo
// In production, these would be stored in a database or smart contract
const ISSUER_ADDRESS = (process.env.ISSUER_WALLET_ADDRESS || '').toLowerCase();
const VERIFIER_ADDRESS = (process.env.VERIFIER_WALLET_ADDRESS || '').toLowerCase();

// ===========================================
// ROLE FUNCTIONS
// ===========================================

/**
 * Get role for a wallet address
 */
export function getRole(address: string): Role {
  const normalizedAddress = address.toLowerCase();

  if (normalizedAddress === ISSUER_ADDRESS && ISSUER_ADDRESS) {
    return 'issuer';
  }

  if (normalizedAddress === VERIFIER_ADDRESS && VERIFIER_ADDRESS) {
    return 'verifier';
  }

  return 'user';
}

/**
 * Check if address is issuer
 */
export function isIssuer(address: string): boolean {
  return getRole(address) === 'issuer';
}

/**
 * Check if address is verifier
 */
export function isVerifier(address: string): boolean {
  return getRole(address) === 'verifier';
}

/**
 * Check if address is regular user
 */
export function isUser(address: string): boolean {
  return getRole(address) === 'user';
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case 'issuer':
      return 'Issuer';
    case 'verifier':
      return 'Verifier';
    case 'user':
      return 'User';
    default:
      return 'Unknown';
  }
}

/**
 * Get role permissions
 */
export function getRolePermissions(role: Role): string[] {
  switch (role) {
    case 'issuer':
      return [
        'issue:credentials',
        'revoke:credentials',
        'view:batches',
        'view:credentials',
      ];
    case 'verifier':
      return [
        'create:verification-requests',
        'view:verification-responses',
        'view:profile',
      ];
    case 'user':
      return [
        'view:credentials',
        'claim:credentials',
        'create:share-tokens',
        'respond:verification-requests',
      ];
    default:
      return [];
  }
}

/**
 * Check if role has permission
 */
export function hasPermission(role: Role, permission: string): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}

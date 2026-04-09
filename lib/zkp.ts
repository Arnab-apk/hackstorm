import { keccak_256 } from '@noble/hashes/sha3';
import { bytesToHex } from '@noble/hashes/utils';
import type { ZKPClaim, ZKPClaimType, ZKPProofResult } from '@/types';

// ===========================================
// ZKP CLAIM PROCESSING
// ===========================================

/**
 * Process a ZKP claim against credential data
 * For hackathon: Uses trusted server model
 * For production: Would use zk-SNARKs or similar
 */
export function processZKPClaim(
  claim: ZKPClaim,
  credentialData: Record<string, any>
): ZKPProofResult {
  const fieldValue = credentialData[claim.field];
  
  let result: boolean;
  let revealedValue: any = undefined;

  switch (claim.type) {
    case 'equals':
      result = fieldValue === claim.value;
      break;

    case 'notEquals':
      result = fieldValue !== claim.value;
      break;

    case 'greaterThan':
      result = typeof fieldValue === 'number' && fieldValue > claim.value;
      break;

    case 'lessThan':
      result = typeof fieldValue === 'number' && fieldValue < claim.value;
      break;

    case 'greaterOrEqual':
      result = typeof fieldValue === 'number' && fieldValue >= claim.value;
      break;

    case 'lessOrEqual':
      result = typeof fieldValue === 'number' && fieldValue <= claim.value;
      break;

    case 'contains':
      result = typeof fieldValue === 'string' && 
               fieldValue.toLowerCase().includes(String(claim.value).toLowerCase());
      break;

    case 'exists':
      result = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
      break;

    case 'reveal':
      result = fieldValue !== undefined;
      revealedValue = fieldValue;
      break;

    default:
      result = false;
  }

  // Generate a proof hash (in production, this would be a zk-SNARK proof)
  const proof = generateProofHash(claim, credentialData[claim.field], result);

  return {
    claim,
    result,
    revealedValue,
    proof,
  };
}

/**
 * Process multiple claims against credential data
 */
export function processZKPClaims(
  claims: ZKPClaim[],
  credentialData: Record<string, any>
): ZKPProofResult[] {
  return claims.map(claim => processZKPClaim(claim, credentialData));
}

/**
 * Validate a claim structure
 */
export function validateClaim(claim: ZKPClaim): { valid: boolean; error?: string } {
  const validTypes: ZKPClaimType[] = [
    'equals',
    'notEquals',
    'greaterThan',
    'lessThan',
    'greaterOrEqual',
    'lessOrEqual',
    'contains',
    'exists',
    'reveal',
  ];

  if (!validTypes.includes(claim.type)) {
    return { valid: false, error: `Invalid claim type: ${claim.type}` };
  }

  if (!claim.field || typeof claim.field !== 'string') {
    return { valid: false, error: 'Claim must have a valid field' };
  }

  // Check if value is required for this claim type
  const typesRequiringValue: ZKPClaimType[] = [
    'equals',
    'notEquals',
    'greaterThan',
    'lessThan',
    'greaterOrEqual',
    'lessOrEqual',
    'contains',
  ];

  if (typesRequiringValue.includes(claim.type) && claim.value === undefined) {
    return { valid: false, error: `Claim type '${claim.type}' requires a value` };
  }

  return { valid: true };
}

/**
 * Validate multiple claims
 */
export function validateClaims(claims: ZKPClaim[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const claim of claims) {
    const validation = validateClaim(claim);
    if (!validation.valid && validation.error) {
      errors.push(validation.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ===========================================
// PROOF GENERATION (Simplified for Hackathon)
// ===========================================

/**
 * Generate a proof hash for a claim
 * In production, this would be replaced with actual ZK proof generation
 */
function generateProofHash(
  claim: ZKPClaim,
  actualValue: any,
  result: boolean
): string {
  // Create a deterministic proof based on the claim and result
  // This is NOT cryptographically secure - just for demo purposes
  const data = JSON.stringify({
    field: claim.field,
    type: claim.type,
    claimValue: claim.value,
    result,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(7),
  });

  const hash = keccak_256(new TextEncoder().encode(data));
  return bytesToHex(hash);
}

/**
 * Verify a proof (simplified for hackathon)
 * In production, this would verify actual ZK proofs
 */
export function verifyProof(proof: string): boolean {
  // For hackathon: just check if it's a valid hex string
  // In production: verify the zk-SNARK proof
  return /^[a-f0-9]{64}$/.test(proof);
}

// ===========================================
// CLAIM BUILDERS
// ===========================================

/**
 * Create an equals claim
 */
export function equals(field: string, value: any): ZKPClaim {
  return { field, type: 'equals', value };
}

/**
 * Create a greaterThan claim
 */
export function greaterThan(field: string, value: number): ZKPClaim {
  return { field, type: 'greaterThan', value };
}

/**
 * Create a lessThan claim
 */
export function lessThan(field: string, value: number): ZKPClaim {
  return { field, type: 'lessThan', value };
}

/**
 * Create a greaterOrEqual claim
 */
export function greaterOrEqual(field: string, value: number): ZKPClaim {
  return { field, type: 'greaterOrEqual', value };
}

/**
 * Create a lessOrEqual claim
 */
export function lessOrEqual(field: string, value: number): ZKPClaim {
  return { field, type: 'lessOrEqual', value };
}

/**
 * Create a contains claim
 */
export function contains(field: string, value: string): ZKPClaim {
  return { field, type: 'contains', value };
}

/**
 * Create an exists claim
 */
export function exists(field: string): ZKPClaim {
  return { field, type: 'exists' };
}

/**
 * Create a reveal claim
 */
export function reveal(field: string): ZKPClaim {
  return { field, type: 'reveal' };
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Get human-readable description of a claim
 */
export function getClaimDescription(claim: ZKPClaim): string {
  switch (claim.type) {
    case 'equals':
      return `${claim.field} equals "${claim.value}"`;
    case 'notEquals':
      return `${claim.field} does not equal "${claim.value}"`;
    case 'greaterThan':
      return `${claim.field} is greater than ${claim.value}`;
    case 'lessThan':
      return `${claim.field} is less than ${claim.value}`;
    case 'greaterOrEqual':
      return `${claim.field} is at least ${claim.value}`;
    case 'lessOrEqual':
      return `${claim.field} is at most ${claim.value}`;
    case 'contains':
      return `${claim.field} contains "${claim.value}"`;
    case 'exists':
      return `${claim.field} exists`;
    case 'reveal':
      return `Reveal ${claim.field}`;
    default:
      return `Unknown claim on ${claim.field}`;
  }
}

/**
 * Check if all claim results are true
 */
export function allClaimsPassed(results: ZKPProofResult[]): boolean {
  return results.every(r => r.result);
}

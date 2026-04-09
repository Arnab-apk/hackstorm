// ===========================================
// CORE TYPES
// ===========================================

export type Role = 'issuer' | 'verifier' | 'user';

export type CredentialStatus = 'active' | 'revoked';

export type ClaimStatus = 'unclaimed' | 'claimed';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type NotificationType = 
  | 'credential_issued'
  | 'credential_revoked'
  | 'verification_request'
  | 'request_approved'
  | 'request_rejected'
  | 'request_expired';

// ===========================================
// DID TYPES
// ===========================================

export interface DIDDocument {
  '@context': string[];
  id: string;
  controller: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase: string;
}

// ===========================================
// CREDENTIAL TYPES
// ===========================================

export interface CredentialSchema {
  id: string;
  name: string;
  description: string;
  version: string;
  fields: SchemaField[];
}

export interface SchemaField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  hideable: boolean;
  options?: string[]; // For select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id: string;
    [key: string]: any;
  };
  proof?: CredentialProof;
}

export interface CredentialProof {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  // Merkle proof fields
  merkleRoot: string;
  leafIndex: number;
  merkleProof: string[];
  proofDirections: ('left' | 'right')[];
  // On-chain anchor
  anchorTransactionHash: string;
  anchorChain: string;
  anchorContract: string;
  // Signature
  signatureValue?: string;
}

// ===========================================
// DATABASE TYPES
// ===========================================

export interface DBCredential {
  _id: string;
  batchId: string;
  leafIndex: number;
  leafHash: string;
  ipfsCID: string;
  recipientEmail: string;
  recipientAddress: string;
  recipientDID: string;
  schemaId: string;
  claimed: boolean;
  claimedAt: Date | null;
  revoked: boolean;
  revokedAt: Date | null;
  revokedReason: string | null;
  issuedAt: Date;
}

export interface DBBatch {
  _id: string;
  merkleRoot: string;
  issuerDID: string;
  issuerAddress: string;
  schemaId: string;
  credentialCount: number;
  merkleTree: MerkleTreeData;
  batchMetadataCID: string;
  anchorTxHash: string;
  anchorBlockNumber: number;
  createdAt: Date;
}

export interface DBShareToken {
  _id: string;
  credentialId: string;
  createdBy: string;
  disclosedFields: string[];
  hiddenFields: string[];
  expiresAt: Date | null;
  maxViews: number | null;
  currentViews: number;
  createdAt: Date;
}

export interface DBVerificationRequest {
  _id: string;
  verifierId: string;
  verifierDID: string;
  verifierName: string;
  targetAddress: string;
  credentialType: string;
  claims: ZKPClaim[];
  message: string;
  status: RequestStatus;
  createdAt: Date;
  expiresAt: Date;
  respondedAt: Date | null;
}

export interface DBVerificationResponse {
  _id: string;
  requestId: string;
  credentialId: string;
  respondedBy: string;
  proofs: ZKPProofResult[];
  merkleProofValid: boolean;
  anchoredOnChain: boolean;
  anchorTxHash: string;
  notRevoked: boolean;
  respondedAt: Date;
}

export interface DBVerifier {
  _id: string;
  walletAddress: string;
  did: string;
  name: string;
  type: 'employer' | 'university' | 'government' | 'service' | 'other';
  website: string | null;
  logo: string | null;
  verified: boolean;
  createdAt: Date;
}

export interface DBNotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface DBIssuer {
  _id: string;
  address: string;
  did: string;
  name: string;
  active: boolean;
  registeredAt: Date;
  updatedAt: Date;
}

// Backward-compatible aliases used by existing route handlers.
export type CredentialDocument = DBCredential;
export type ShareToken = DBShareToken;

// ===========================================
// MERKLE TREE TYPES
// ===========================================

export interface MerkleTreeData {
  root: string;
  leaves: string[];
  layers: string[][];
}

export interface MerkleProof {
  leaf: string;
  leafIndex: number;
  proof: string[];
  directions: ('left' | 'right')[];
  root: string;
}

// ===========================================
// ZKP TYPES
// ===========================================

export type ZKPClaimType = 
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterOrEqual'
  | 'lessOrEqual'
  | 'contains'
  | 'exists'
  | 'reveal';

export interface ZKPClaim {
  field: string;
  type: ZKPClaimType;
  value?: any; // Not needed for 'exists' and 'reveal'
}

export interface ZKPProofResult {
  claim: ZKPClaim;
  result: boolean;
  revealedValue?: any; // Only for 'reveal' type
  proof: string; // Cryptographic proof hash
}

// ===========================================
// API REQUEST/RESPONSE TYPES
// ===========================================

// Auth
export interface AuthSession {
  address: string;
  did: string;
  role: Role;
  email?: string;
  iat: number;
  exp: number;
}

// Issuer
export interface IssueSingleRequest {
  schemaId: string;
  recipientEmail: string;
  credentialData: Record<string, any>;
  expirationDate?: string;
}

export interface IssueBatchRequest {
  schemaId: string;
  credentials: {
    recipientEmail: string;
    data: Record<string, any>;
  }[];
}

export interface IssueResponse {
  success: boolean;
  batchId: string;
  merkleRoot: string;
  txHash: string;
  credentials: {
    id: string;
    recipientEmail: string;
    recipientAddress: string;
  }[];
}

export interface RevokeRequest {
  credentialId: string;
  reason: string;
}

// Recipient
export interface ClaimRequest {
  credentialId: string;
}

export interface CreateShareRequest {
  credentialId: string;
  disclosedFields: string[];
  expiresAt?: string;
  maxViews?: number;
}

export interface CreateShareResponse {
  shareToken: string;
  shareLink: string;
  expiresAt: string | null;
}

export interface RespondToRequestRequest {
  requestId: string;
  credentialId: string;
  approved: boolean;
}

// Verifier
export interface RegisterVerifierRequest {
  name: string;
  type: 'employer' | 'university' | 'government' | 'service' | 'other';
  website?: string;
  logo?: string;
}

export interface CreateVerificationRequest {
  targetAddress?: string;
  targetEmail?: string;
  credentialType: string;
  claims: ZKPClaim[];
  message?: string;
  expiresInDays?: number;
}

// Verification
export interface VerifyShareResponse {
  valid: boolean;
  reason?: string;
  credential?: {
    type: string;
    issuer: string;
    issuedAt: string;
    subject: Record<string, any>;
  };
  verification?: {
    merkleProofValid: boolean;
    anchoredOnChain: boolean;
    anchorTxHash: string;
    revoked: boolean;
  };
  shareInfo?: {
    createdAt: string;
    expiresAt: string | null;
    viewCount: number;
    maxViews: number | null;
  };
}

// Blockchain
export interface AnchorBatchRequest {
  merkleRoot: string;
  credentialCount: number;
}

export interface AnchorBatchResponse {
  success: boolean;
  txHash: string;
  blockNumber: number;
}

export interface TrustedIssuer {
  address: string;
  did: string;
  name: string;
  active: boolean;
  registeredAt: number;
}

// ===========================================
// UTILITY TYPES
// ===========================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

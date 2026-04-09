# Backend Structure Document

## Decentralized Identity Verification System

**Version:** 1.0  
**Date:** April 2026

---

## Table of Contents

1. [Directory Structure](#1-directory-structure)
2. [API Routes Specification](#2-api-routes-specification)
3. [Core Libraries](#3-core-libraries)
4. [Database Layer](#4-database-layer)
5. [Smart Contract Integration](#5-smart-contract-integration)
6. [External Services Integration](#6-external-services-integration)
7. [Type Definitions](#7-type-definitions)
8. [Environment Configuration](#8-environment-configuration)
9. [Scripts](#9-scripts)

---

## 1. Directory Structure

```
/backend
├── /app
│   └── /api
│       ├── /auth
│       │   ├── /session
│       │   │   └── route.ts              # GET: Get current session
│       │   ├── /role
│       │   │   └── route.ts              # GET: Get user role (issuer/verifier/user)
│       │   └── /predict-address
│       │       ├── route.ts              # POST: Single email → address
│       │       └── /batch
│       │           └── route.ts          # POST: Multiple emails → addresses
│       │
│       ├── /issuer
│       │   ├── /credentials
│       │   │   ├── route.ts              # GET: List all issued credentials
│       │   │   └── /[id]
│       │   │       ├── route.ts          # GET: Single credential details
│       │   │       └── /revoke
│       │   │           └── route.ts      # POST: Revoke credential
│       │   ├── /batches
│       │   │   ├── route.ts              # GET: List all batches
│       │   │   └── /[id]
│       │   │       └── route.ts          # GET: Single batch details
│       │   ├── /issue
│       │   │   ├── /single
│       │   │   │   └── route.ts          # POST: Issue single credential
│       │   │   └── /batch
│       │   │       └── route.ts          # POST: Issue batch credentials
│       │   ├── /schemas
│       │   │   └── route.ts              # GET: List available schemas
│       │   ├── /stats
│       │   │   └── route.ts              # GET: Dashboard statistics
│       │   └── /prepare-anchor
│       │       └── route.ts              # POST: Prepare unsigned anchor transaction
│       │
│       ├── /recipient
│       │   ├── /credentials
│       │   │   ├── route.ts              # GET: List user's credentials (by address)
│       │   │   ├── /[id]
│       │   │   │   ├── route.ts          # GET: Single credential
│       │   │   │   └── /claim
│       │   │   │       └── route.ts      # POST: Claim credential
│       │   │   └── /stats
│       │   │       └── route.ts          # GET: Credential counts
│       │   ├── /share
│       │   │   ├── route.ts              # POST: Create share token
│       │   │   ├── /[token]
│       │   │   │   └── route.ts          # GET: Share token details, DELETE: Revoke
│       │   │   └── /by-credential
│       │   │       └── /[credentialId]
│       │   │           └── route.ts      # GET: List shares for credential
│       │   ├── /requests
│       │   │   ├── /pending
│       │   │   │   └── route.ts          # GET: Pending verification requests
│       │   │   ├── /history
│       │   │   │   └── route.ts          # GET: Past requests
│       │   │   └── /[id]
│       │   │       ├── /approve
│       │   │       │   └── route.ts      # POST: Approve request
│       │   │       └── /reject
│       │   │           └── route.ts      # POST: Reject request
│       │   └── /notifications
│       │       ├── route.ts              # GET: List notifications
│       │       └── /[id]
│       │           └── /read
│       │               └── route.ts      # POST: Mark as read
│       │
│       ├── /verifier
│       │   ├── /profile
│       │   │   └── route.ts              # GET: Get profile, POST: Create, PUT: Update
│       │   ├── /requests
│       │   │   ├── route.ts              # GET: List all requests, POST: Create new
│       │   │   └── /[id]
│       │   │       ├── route.ts          # GET: Request details + response
│       │   │       └── /cancel
│       │   │           └── route.ts      # POST: Cancel pending request
│       │   └── /stats
│       │       └── route.ts              # GET: Verifier statistics
│       │
│       ├── /verify
│       │   └── /[token]
│       │       └── route.ts              # GET: Public verification by share token
│       │
│       └── /blockchain
│           ├── /batch
│           │   └── /[merkleRoot]
│           │       └── route.ts          # GET: Get batch info from chain
│           ├── /issuer
│           │   └── /[address]
│           │       └── route.ts          # GET: Check if issuer is trusted
│           └── /anchor-callback
│               └── route.ts              # POST: Callback after anchor transaction
│
├── /lib
│   ├── /core
│   │   ├── merkle.ts                     # Merkle tree building and verification
│   │   ├── credentials.ts                # Credential building and serialization
│   │   ├── schemas.ts                    # Credential schema definitions
│   │   └── zkp.ts                        # ZKP claim verification (simplified)
│   │
│   ├── /blockchain
│   │   ├── client.ts                     # Viem public client setup
│   │   ├── contract.ts                   # Contract read operations
│   │   ├── contract-abi.ts               # ABI definitions
│   │   └── transaction.ts                # Transaction preparation
│   │
│   ├── /storage
│   │   ├── db.ts                         # MongoDB connection and helpers
│   │   ├── ipfs.ts                       # IPFS upload/fetch via Pinata
│   │   └── collections.ts                # Collection name constants
│   │
│   ├── /auth
│   │   ├── web3auth.ts                   # Web3Auth server SDK (address prediction)
│   │   ├── session.ts                    # Session management utilities
│   │   └── roles.ts                      # Role determination logic
│   │
│   ├── /utils
│   │   ├── validation.ts                 # Input validation helpers
│   │   ├── errors.ts                     # Custom error classes
│   │   └── response.ts                   # Standardized API responses
│   │
│   └── /types
│       ├── credentials.ts                # Credential-related types
│       ├── database.ts                   # MongoDB document types
│       ├── api.ts                        # API request/response types
│       └── blockchain.ts                 # Blockchain-related types
│
├── /contracts
│   ├── CredentialRegistry.sol            # Main smart contract
│   └── README.md                         # Contract documentation
│
├── /scripts
│   ├── generate-keys.ts                  # Generate issuer Ed25519 keys
│   ├── deploy-contract.ts                # Deploy contract to Polygon
│   ├── register-issuer.ts                # Register issuer in contract
│   ├── seed-schemas.ts                   # Seed credential schemas
│   └── setup-indexes.ts                  # Create MongoDB indexes
│
└── /public
    └── /.well-known
        └── did.json                      # Issuer DID document
```

---

## 2. API Routes Specification

### 2.1 Authentication Routes

#### `GET /api/auth/session`

**Purpose:** Get current authenticated session

**Response:**
```typescript
{
  authenticated: boolean;
  user: {
    walletAddress: string;
    did: string;
    email?: string;
  } | null;
}
```

---

#### `GET /api/auth/role`

**Purpose:** Determine user's role based on wallet address

**Response:**
```typescript
{
  role: "issuer" | "verifier" | "user";
  profile?: {
    name: string;
    // Additional profile data based on role
  };
}
```

---

#### `POST /api/auth/predict-address`

**Purpose:** Predict wallet address from email

**Request:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  email: string;
  walletAddress: string;
  did: string;
}
```

---

#### `POST /api/auth/predict-address/batch`

**Purpose:** Predict wallet addresses for multiple emails

**Request:**
```typescript
{
  emails: string[];
}
```

**Response:**
```typescript
{
  predictions: Array<{
    email: string;
    walletAddress: string;
    did: string;
  }>;
  errors: Array<{
    email: string;
    error: string;
  }>;
}
```

---

### 2.2 Issuer Routes

#### `GET /api/issuer/schemas`

**Purpose:** Get all available credential schemas

**Response:**
```typescript
{
  schemas: Array<{
    id: string;
    name: string;
    description: string;
    fields: Array<{
      key: string;
      label: string;
      type: "string" | "number" | "date" | "select";
      required: boolean;
      hideable: boolean;
      options?: string[]; // For select type
    }>;
  }>;
}
```

---

#### `POST /api/issuer/issue/single`

**Purpose:** Issue a single credential

**Request:**
```typescript
{
  schemaId: string;
  recipientEmail: string;
  fields: Record<string, any>;
}
```

**Process:**
1. Validate fields against schema
2. Predict recipient wallet address from email
3. Build W3C Verifiable Credential structure
4. Upload credential to IPFS
5. Build single-leaf merkle tree
6. Return unsigned transaction data for anchoring
7. (After anchor callback) Store credential index in MongoDB

**Response:**
```typescript
{
  credentialId: string;
  recipientAddress: string;
  recipientDID: string;
  ipfsCID: string;
  merkleRoot: string;
  unsignedTransaction: {
    to: string;
    data: string;
    value: string;
  };
  credential: VerifiableCredential;
}
```

---

#### `POST /api/issuer/issue/batch`

**Purpose:** Issue multiple credentials from CSV data

**Request:**
```typescript
{
  schemaId: string;
  credentials: Array<{
    recipientEmail: string;
    fields: Record<string, any>;
  }>;
}
```

**Process:**
1. Validate all credentials against schema
2. Predict all recipient addresses
3. Build all W3C VC structures
4. Upload all to IPFS
5. Build merkle tree from all credential hashes
6. Return unsigned transaction for single anchor
7. (After anchor callback) Generate individual proofs, store all in MongoDB

**Response:**
```typescript
{
  batchId: string;
  merkleRoot: string;
  credentialCount: number;
  validCount: number;
  invalidCount: number;
  unsignedTransaction: {
    to: string;
    data: string;
    value: string;
  };
  credentials: Array<{
    tempId: string;
    recipientEmail: string;
    recipientAddress: string;
    ipfsCID: string;
    leafIndex: number;
  }>;
  errors: Array<{
    index: number;
    email: string;
    errors: string[];
  }>;
}
```

---

#### `POST /api/blockchain/anchor-callback`

**Purpose:** Called after frontend successfully anchors transaction

**Request:**
```typescript
{
  merkleRoot: string;
  transactionHash: string;
  batchId?: string; // For batch issuance
  credentialId?: string; // For single issuance
}
```

**Process:**
1. Verify transaction on chain
2. Generate merkle proofs for each credential
3. Add proof to each credential
4. Store final credentials in MongoDB

**Response:**
```typescript
{
  success: boolean;
  credentialsFinalized: number;
}
```

---

#### `GET /api/issuer/credentials`

**Purpose:** List all issued credentials

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `schemaId`: string (optional filter)
- `status`: "pending" | "claimed" | "revoked" (optional filter)
- `search`: string (optional, searches recipient email)

**Response:**
```typescript
{
  credentials: Array<{
    id: string;
    schemaId: string;
    schemaName: string;
    recipientEmail: string;
    recipientAddress: string;
    claimed: boolean;
    claimedAt: string | null;
    revoked: boolean;
    revokedAt: string | null;
    issuedAt: string;
    ipfsCID: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

#### `GET /api/issuer/credentials/[id]`

**Purpose:** Get single credential details

**Response:**
```typescript
{
  id: string;
  batchId: string;
  schemaId: string;
  schemaName: string;
  recipientEmail: string;
  recipientAddress: string;
  recipientDID: string;
  ipfsCID: string;
  leafIndex: number;
  merkleRoot: string;
  merkleProof: string[];
  anchorTxHash: string;
  claimed: boolean;
  claimedAt: string | null;
  revoked: boolean;
  revokedAt: string | null;
  revokedReason: string | null;
  issuedAt: string;
  credential: VerifiableCredential;
}
```

---

#### `POST /api/issuer/credentials/[id]/revoke`

**Purpose:** Revoke a credential

**Request:**
```typescript
{
  reason: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  revokedAt: string;
}
```

---

#### `GET /api/issuer/batches`

**Purpose:** List all batches

**Response:**
```typescript
{
  batches: Array<{
    id: string;
    schemaId: string;
    schemaName: string;
    merkleRoot: string;
    credentialCount: number;
    claimedCount: number;
    anchorTxHash: string;
    createdAt: string;
  }>;
}
```

---

#### `GET /api/issuer/batches/[id]`

**Purpose:** Get batch details

**Response:**
```typescript
{
  id: string;
  schemaId: string;
  schemaName: string;
  merkleRoot: string;
  credentialCount: number;
  claimedCount: number;
  revokedCount: number;
  anchorTxHash: string;
  anchorBlockNumber: number;
  createdAt: string;
  credentials: Array<{
    id: string;
    recipientEmail: string;
    claimed: boolean;
    revoked: boolean;
  }>;
}
```

---

#### `GET /api/issuer/stats`

**Purpose:** Get issuer dashboard statistics

**Response:**
```typescript
{
  totalIssued: number;
  pendingClaims: number;
  claimed: number;
  revoked: number;
  batchCount: number;
  recentActivity: Array<{
    type: "issued" | "claimed" | "revoked";
    credentialId: string;
    recipientEmail: string;
    timestamp: string;
  }>;
}
```

---

### 2.3 Recipient Routes

#### `GET /api/recipient/credentials`

**Purpose:** Get credentials for authenticated user

**Query Parameters:**
- `status`: "available" | "claimed" | "revoked" | "all"

**Response:**
```typescript
{
  credentials: Array<{
    id: string;
    schemaId: string;
    schemaName: string;
    issuerDID: string;
    issuerName: string;
    claimed: boolean;
    claimedAt: string | null;
    revoked: boolean;
    issuedAt: string;
    summary: Record<string, any>; // Key fields for preview
  }>;
  counts: {
    available: number;
    claimed: number;
    revoked: number;
  };
}
```

---

#### `GET /api/recipient/credentials/[id]`

**Purpose:** Get single credential with full details

**Response:**
```typescript
{
  id: string;
  schemaId: string;
  schemaName: string;
  issuerDID: string;
  issuerName: string;
  ipfsCID: string;
  claimed: boolean;
  claimedAt: string | null;
  revoked: boolean;
  revokedAt: string | null;
  revokedReason: string | null;
  issuedAt: string;
  credential: VerifiableCredential;
  verification: {
    merkleProofValid: boolean;
    anchoredOnChain: boolean;
    anchorTxHash: string;
    issuerTrusted: boolean;
  };
  schema: {
    fields: Array<{
      key: string;
      label: string;
      hideable: boolean;
    }>;
  };
}
```

---

#### `POST /api/recipient/credentials/[id]/claim`

**Purpose:** Claim a credential

**Process:**
1. Verify credential belongs to authenticated user
2. Verify not already claimed
3. Fetch full credential from IPFS
4. Update MongoDB: claimed=true, claimedAt=now
5. Return credential for Snap storage

**Response:**
```typescript
{
  success: boolean;
  credential: VerifiableCredential;
  claimedAt: string;
}
```

---

#### `POST /api/recipient/share`

**Purpose:** Create share token for credential

**Request:**
```typescript
{
  credentialId: string;
  disclosedFields: string[];  // Fields to show
  hiddenFields: string[];     // Fields to hide (show as *****)
  expiresAt?: string;         // Optional expiration
  maxViews?: number;          // Optional view limit
}
```

**Response:**
```typescript
{
  shareToken: string;
  shareLink: string;
  expiresAt: string | null;
  maxViews: number | null;
}
```

---

#### `GET /api/recipient/share/[token]`

**Purpose:** Get share token details (for management)

**Response:**
```typescript
{
  token: string;
  credentialId: string;
  disclosedFields: string[];
  hiddenFields: string[];
  expiresAt: string | null;
  maxViews: number | null;
  currentViews: number;
  createdAt: string;
  shareLink: string;
}
```

---

#### `DELETE /api/recipient/share/[token]`

**Purpose:** Revoke/delete share token

**Response:**
```typescript
{
  success: boolean;
}
```

---

#### `GET /api/recipient/share/by-credential/[credentialId]`

**Purpose:** List all share tokens for a credential

**Response:**
```typescript
{
  shares: Array<{
    token: string;
    disclosedFields: string[];
    expiresAt: string | null;
    maxViews: number | null;
    currentViews: number;
    createdAt: string;
    active: boolean;
  }>;
}
```

---

#### `GET /api/recipient/requests/pending`

**Purpose:** Get pending verification requests

**Response:**
```typescript
{
  requests: Array<{
    id: string;
    verifier: {
      did: string;
      name: string;
      type: string;
      website: string;
      verified: boolean;
    };
    credentialType: string;
    claims: Array<{
      field: string;
      type: "equals" | "greaterThan" | "lessThan" | "reveal" | "exists";
      value?: any;
    }>;
    message: string | null;
    expiresAt: string;
    createdAt: string;
  }>;
}
```

---

#### `POST /api/recipient/requests/[id]/approve`

**Purpose:** Approve verification request

**Request:**
```typescript
{
  credentialId: string; // Which credential to use
}
```

**Process:**
1. Validate request belongs to user and is pending
2. Validate credential matches request requirements
3. Generate ZKP responses for each claim
4. Store response in verification_responses
5. Update request status
6. Create notification for verifier

**Response:**
```typescript
{
  success: boolean;
  responseId: string;
}
```

---

#### `POST /api/recipient/requests/[id]/reject`

**Purpose:** Reject verification request

**Request:**
```typescript
{
  reason?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

---

#### `GET /api/recipient/requests/history`

**Purpose:** Get past verification requests

**Response:**
```typescript
{
  requests: Array<{
    id: string;
    verifier: {
      did: string;
      name: string;
    };
    credentialType: string;
    status: "approved" | "rejected" | "expired";
    respondedAt: string;
    createdAt: string;
  }>;
}
```

---

#### `GET /api/recipient/notifications`

**Purpose:** Get user notifications

**Response:**
```typescript
{
  notifications: Array<{
    id: string;
    type: "verification_request" | "credential_revoked" | "credential_issued";
    title: string;
    message: string;
    read: boolean;
    data: Record<string, any>;
    createdAt: string;
  }>;
  unreadCount: number;
}
```

---

#### `POST /api/recipient/notifications/[id]/read`

**Purpose:** Mark notification as read

**Response:**
```typescript
{
  success: boolean;
}
```

---

### 2.4 Verifier Routes

#### `GET /api/verifier/profile`

**Purpose:** Get verifier profile

**Response:**
```typescript
{
  exists: boolean;
  profile: {
    did: string;
    walletAddress: string;
    name: string;
    type: "employer" | "university" | "government" | "service" | "other";
    website: string;
    logo: string | null;
    verified: boolean;
    createdAt: string;
  } | null;
}
```

---

#### `POST /api/verifier/profile`

**Purpose:** Create verifier profile

**Request:**
```typescript
{
  name: string;
  type: "employer" | "university" | "government" | "service" | "other";
  website: string;
  logo?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  profile: VerifierProfile;
}
```

---

#### `PUT /api/verifier/profile`

**Purpose:** Update verifier profile

**Request:**
```typescript
{
  name?: string;
  type?: string;
  website?: string;
  logo?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  profile: VerifierProfile;
}
```

---

#### `POST /api/verifier/requests`

**Purpose:** Create verification request

**Request:**
```typescript
{
  targetEmail?: string;
  targetAddress?: string;  // Either email or address required
  credentialType: string;
  claims: Array<{
    field: string;
    type: "equals" | "greaterThan" | "lessThan" | "greaterOrEqual" | "lessOrEqual" | "contains" | "exists" | "reveal";
    value?: any;  // Required for comparison types
  }>;
  message?: string;
  expiresInDays?: number;  // Default: 7
}
```

**Process:**
1. Validate verifier has profile
2. Predict address if email provided
3. Store request
4. Create notification for target user

**Response:**
```typescript
{
  requestId: string;
  targetAddress: string;
  expiresAt: string;
}
```

---

#### `GET /api/verifier/requests`

**Purpose:** List all verification requests

**Query Parameters:**
- `status`: "pending" | "approved" | "rejected" | "expired" | "all"

**Response:**
```typescript
{
  requests: Array<{
    id: string;
    targetAddress: string;
    credentialType: string;
    status: "pending" | "approved" | "rejected" | "expired";
    createdAt: string;
    expiresAt: string;
    respondedAt: string | null;
  }>;
}
```

---

#### `GET /api/verifier/requests/[id]`

**Purpose:** Get request details including response if approved

**Response:**
```typescript
{
  request: {
    id: string;
    targetAddress: string;
    targetDID: string;
    credentialType: string;
    claims: Array<ClaimRequirement>;
    message: string | null;
    status: "pending" | "approved" | "rejected" | "expired";
    createdAt: string;
    expiresAt: string;
  };
  response: {
    proofs: Array<{
      claim: string;
      type: string;
      result: boolean | any; // boolean for comparisons, value for reveal
    }>;
    credentialVerification: {
      merkleProofValid: boolean;
      anchoredOnChain: boolean;
      anchorTxHash: string;
      issuerTrusted: boolean;
      notRevoked: boolean;
    };
    respondedAt: string;
  } | null;
}
```

---

#### `POST /api/verifier/requests/[id]/cancel`

**Purpose:** Cancel pending request

**Response:**
```typescript
{
  success: boolean;
}
```

---

#### `GET /api/verifier/stats`

**Purpose:** Get verifier statistics

**Response:**
```typescript
{
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
}
```

---

### 2.5 Public Verification Routes

#### `GET /api/verify/[token]`

**Purpose:** Public verification via share token

**Process:**
1. Validate token exists and is active
2. Check expiration
3. Check view limit
4. Fetch credential from IPFS
5. Apply disclosure mask
6. Verify merkle proof
7. Check on-chain anchor
8. Check revocation status
9. Increment view count
10. Return verification result

**Response (Success):**
```typescript
{
  valid: true;
  credential: {
    type: string;
    issuer: {
      did: string;
      name: string;
    };
    issuedAt: string;
    subject: {
      [field: string]: any | "••••••"; // Masked hidden fields
    };
  };
  verification: {
    merkleProofValid: boolean;
    anchoredOnChain: boolean;
    anchorTxHash: string;
    issuerTrusted: boolean;
    notRevoked: boolean;
  };
  shareInfo: {
    createdAt: string;
    expiresAt: string | null;
    viewCount: number;
    maxViews: number | null;
  };
}
```

**Response (Failure):**
```typescript
{
  valid: false;
  reason: "token_not_found" | "token_expired" | "max_views_exceeded" | "credential_revoked" | "verification_failed";
  message: string;
}
```

---

### 2.6 Blockchain Routes

#### `GET /api/blockchain/batch/[merkleRoot]`

**Purpose:** Get batch info from chain

**Response:**
```typescript
{
  exists: boolean;
  batch: {
    merkleRoot: string;
    issuer: string;
    credentialCount: number;
    timestamp: number;
    blockNumber: number;
  } | null;
}
```

---

#### `GET /api/blockchain/issuer/[address]`

**Purpose:** Check if issuer is trusted

**Response:**
```typescript
{
  trusted: boolean;
  issuer: {
    did: string;
    name: string;
    active: boolean;
    registeredAt: number;
  } | null;
}
```

---

## 3. Core Libraries

### 3.1 `/lib/core/merkle.ts`

```typescript
// Types
export interface MerkleTree {
  root: string;
  layers: string[][];
  leafCount: number;
}

export interface MerkleProof {
  root: string;
  proof: string[];
  leafIndex: number;
}

// Functions
export function hashLeaf(data: string): string;
export function hashPair(left: string, right: string): string;
export function buildMerkleTree(leaves: string[]): MerkleTree;
export function generateMerkleProof(tree: MerkleTree, leafIndex: number): MerkleProof;
export function verifyMerkleProof(
  leafData: string,
  proof: string[],
  root: string,
  leafIndex: number
): boolean;
```

---

### 3.2 `/lib/core/credentials.ts`

```typescript
// Types
export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
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
  merkleRoot?: string;
  leafIndex?: number;
  merkleProof?: string[];
  anchorTransactionHash?: string;
  anchorChain?: string;
  anchorContract?: string;
}

export interface CredentialInput {
  schemaId: string;
  schemaType: string;
  recipientDID: string;
  fields: Record<string, any>;
}

// Functions
export function buildCredential(input: CredentialInput, issuerDID: string): VerifiableCredential;
export function serializeCredential(credential: VerifiableCredential): string;
export function hashCredential(credential: VerifiableCredential): string;
export function addProofToCredential(
  credential: VerifiableCredential,
  proofData: {
    merkleRoot: string;
    leafIndex: number;
    merkleProof: string[];
    anchorTxHash: string;
    anchorContract: string;
  },
  issuerDID: string
): VerifiableCredential;
export function validateCredentialFields(
  fields: Record<string, any>,
  schema: CredentialSchema
): { valid: boolean; errors: string[] };
```

---

### 3.3 `/lib/core/schemas.ts`

```typescript
export interface SchemaField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'select';
  required: boolean;
  hideable: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface CredentialSchema {
  id: string;
  name: string;
  description: string;
  vcType: string; // e.g., "UniversityDegreeCredential"
  fields: SchemaField[];
}

export const CREDENTIAL_SCHEMAS: Record<string, CredentialSchema> = {
  'university-degree': {
    id: 'university-degree',
    name: 'University Degree',
    description: 'Academic degree credential',
    vcType: 'UniversityDegreeCredential',
    fields: [
      { key: 'name', label: 'Full Name', type: 'string', required: true, hideable: false },
      { key: 'studentId', label: 'Student ID', type: 'string', required: true, hideable: true },
      { key: 'degreeType', label: 'Degree Type', type: 'select', required: true, hideable: false,
        options: ['Bachelor', 'Master', 'Doctoral', 'Associate'] },
      { key: 'degreeName', label: 'Degree Name', type: 'string', required: true, hideable: false },
      { key: 'major', label: 'Major', type: 'string', required: true, hideable: true },
      { key: 'minor', label: 'Minor', type: 'string', required: false, hideable: true },
      { key: 'gpa', label: 'GPA', type: 'number', required: false, hideable: true,
        validation: { min: 0, max: 4 } },
      { key: 'graduationDate', label: 'Graduation Date', type: 'date', required: true, hideable: true },
      { key: 'honors', label: 'Honors', type: 'select', required: false, hideable: true,
        options: ['None', 'Cum Laude', 'Magna Cum Laude', 'Summa Cum Laude'] },
    ]
  },
  'employee-id': {
    id: 'employee-id',
    name: 'Employee ID',
    description: 'Employment verification credential',
    vcType: 'EmployeeCredential',
    fields: [
      { key: 'name', label: 'Full Name', type: 'string', required: true, hideable: false },
      { key: 'employeeId', label: 'Employee ID', type: 'string', required: true, hideable: true },
      { key: 'department', label: 'Department', type: 'string', required: true, hideable: true },
      { key: 'position', label: 'Position', type: 'string', required: true, hideable: false },
      { key: 'startDate', label: 'Start Date', type: 'date', required: true, hideable: true },
      { key: 'clearanceLevel', label: 'Clearance Level', type: 'number', required: false, hideable: true,
        validation: { min: 1, max: 5 } },
    ]
  },
  'event-ticket': {
    id: 'event-ticket',
    name: 'Event Ticket',
    description: 'Event attendance credential',
    vcType: 'EventTicketCredential',
    fields: [
      { key: 'name', label: 'Attendee Name', type: 'string', required: true, hideable: false },
      { key: 'eventName', label: 'Event Name', type: 'string', required: true, hideable: false },
      { key: 'eventDate', label: 'Event Date', type: 'date', required: true, hideable: false },
      { key: 'ticketType', label: 'Ticket Type', type: 'select', required: true, hideable: true,
        options: ['General', 'VIP', 'Student', 'Early Bird'] },
      { key: 'seatNumber', label: 'Seat Number', type: 'string', required: false, hideable: true },
    ]
  }
};

export function getSchema(schemaId: string): CredentialSchema | null;
export function getCSVTemplate(schemaId: string): string;
export function parseCSV(csv: string, schemaId: string): {
  valid: Array<Record<string, any>>;
  invalid: Array<{ row: number; errors: string[] }>;
};
```

---

### 3.4 `/lib/core/zkp.ts`

```typescript
// Simplified ZKP for hackathon (trusted server model)

export type ClaimType = 
  | 'equals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterOrEqual'
  | 'lessOrEqual'
  | 'contains'
  | 'exists'
  | 'reveal';

export interface ClaimRequirement {
  field: string;
  type: ClaimType;
  value?: any;
}

export interface ClaimProof {
  claim: string; // Human readable claim description
  type: ClaimType;
  result: boolean | any; // boolean for comparisons, actual value for reveal
}

export function verifyClaim(
  credentialValue: any,
  requirement: ClaimRequirement
): ClaimProof;

export function generateClaimProofs(
  credential: VerifiableCredential,
  requirements: ClaimRequirement[]
): ClaimProof[];

// Example implementations:
// equals: credentialValue === requirement.value
// greaterThan: credentialValue > requirement.value
// contains: credentialValue.includes(requirement.value)
// exists: credentialValue !== undefined && credentialValue !== null
// reveal: returns actual value
```

---

### 3.5 `/lib/blockchain/client.ts`

```typescript
import { createPublicClient, http, PublicClient } from 'viem';
import { polygonAmoy } from 'viem/chains';

export const publicClient: PublicClient;
export const CHAIN_CONFIG: {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
};
```

---

### 3.6 `/lib/blockchain/contract.ts`

```typescript
import { Address, Hex } from 'viem';

export interface IssuerInfo {
  did: string;
  name: string;
  active: boolean;
  registeredAt: bigint;
}

export interface BatchInfo {
  merkleRoot: Hex;
  issuer: Address;
  credentialCount: bigint;
  timestamp: bigint;
}

export async function isIssuerTrusted(address: Address): Promise<boolean>;
export async function getIssuerInfo(address: Address): Promise<IssuerInfo | null>;
export async function batchExists(merkleRoot: Hex): Promise<boolean>;
export async function getBatchInfo(merkleRoot: Hex): Promise<BatchInfo | null>;
export function prepareAnchorTransaction(
  merkleRoot: Hex,
  credentialCount: number
): {
  address: Address;
  abi: any;
  functionName: string;
  args: [Hex, bigint];
};
```

---

### 3.7 `/lib/storage/db.ts`

```typescript
import { MongoClient, Db, Collection } from 'mongodb';

export async function connectToDatabase(): Promise<Db>;
export function getCollection<T>(name: string): Collection<T>;

// Collection helpers
export const collections = {
  credentials: () => getCollection<CredentialDocument>('credentials'),
  batches: () => getCollection<BatchDocument>('batches'),
  shareTokens: () => getCollection<ShareTokenDocument>('share_tokens'),
  verificationRequests: () => getCollection<VerificationRequestDocument>('verification_requests'),
  verificationResponses: () => getCollection<VerificationResponseDocument>('verification_responses'),
  verifiers: () => getCollection<VerifierDocument>('verifiers'),
  notifications: () => getCollection<NotificationDocument>('notifications'),
};
```

---

### 3.8 `/lib/storage/ipfs.ts`

```typescript
export async function uploadToIPFS(data: object): Promise<string>; // Returns CID
export async function uploadBatchToIPFS(items: object[]): Promise<string[]>; // Returns CIDs
export async function fetchFromIPFS<T>(cid: string): Promise<T>;
export function getIPFSUrl(cid: string): string;
```

---

### 3.9 `/lib/auth/web3auth.ts`

```typescript
// Server-side Web3Auth for address prediction

export async function predictAddressFromEmail(email: string): Promise<{
  address: string;
  did: string;
}>;

export async function predictAddressesFromEmails(emails: string[]): Promise<Array<{
  email: string;
  address: string;
  did: string;
}>>;

export function walletAddressToDID(address: string): string;
// Returns: did:pkh:eip155:137:{address}
```

---

### 3.10 `/lib/auth/roles.ts`

```typescript
export type UserRole = 'issuer' | 'verifier' | 'user';

export const ISSUER_ADDRESS: string; // From env
export const VERIFIER_ADDRESS: string; // From env

export function determineRole(walletAddress: string): UserRole;
export async function validateIssuerAccess(address: string): Promise<boolean>;
export async function validateVerifierAccess(address: string): Promise<boolean>;
```

---

### 3.11 `/lib/utils/validation.ts`

```typescript
export function validateEmail(email: string): boolean;
export function validateWalletAddress(address: string): boolean;
export function validateSchemaFields(
  fields: Record<string, any>,
  schema: CredentialSchema
): { valid: boolean; errors: string[] };
export function sanitizeInput(input: string): string;
```

---

### 3.12 `/lib/utils/errors.ts`

```typescript
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends APIError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public errors?: string[]) {
    super(400, 'VALIDATION_ERROR', message);
  }
}
```

---

### 3.13 `/lib/utils/response.ts`

```typescript
import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status = 200): NextResponse;
export function errorResponse(error: APIError): NextResponse;
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse;
```

---

## 4. Database Layer

### 4.1 Collections

#### `credentials`

```typescript
interface CredentialDocument {
  _id: string; // cred_{uuid}
  batchId: string;
  schemaId: string;
  
  // IPFS
  ipfsCID: string;
  
  // Merkle
  leafIndex: number;
  leafHash: string;
  
  // Recipient
  recipientEmail: string;
  recipientAddress: string; // lowercase
  recipientDID: string;
  
  // Status
  claimed: boolean;
  claimedAt: Date | null;
  revoked: boolean;
  revokedAt: Date | null;
  revokedReason: string | null;
  
  // Timestamps
  issuedAt: Date;
  
  // Credential summary (for list views without IPFS fetch)
  summary: Record<string, any>;
}
```

---

#### `batches`

```typescript
interface BatchDocument {
  _id: string; // batch_{uuid}
  schemaId: string;
  
  // Merkle
  merkleRoot: string;
  merkleTree: {
    layers: string[][];
    leafCount: number;
  };
  
  // Blockchain
  anchorTxHash: string | null;
  anchorBlockNumber: number | null;
  anchorStatus: 'pending' | 'confirmed' | 'failed';
  
  // Stats
  credentialCount: number;
  
  // Timestamps
  createdAt: Date;
  anchoredAt: Date | null;
}
```

---

#### `share_tokens`

```typescript
interface ShareTokenDocument {
  _id: string; // share_{nanoid}
  credentialId: string;
  createdBy: string; // wallet address
  
  // Disclosure settings (immutable)
  disclosedFields: string[];
  hiddenFields: string[];
  
  // Limits
  expiresAt: Date | null;
  maxViews: number | null;
  currentViews: number;
  
  // Status
  active: boolean;
  
  createdAt: Date;
}
```

---

#### `verification_requests`

```typescript
interface VerificationRequestDocument {
  _id: string; // req_{uuid}
  
  // Verifier
  verifierId: string;
  verifierDID: string;
  verifierName: string;
  
  // Target
  targetAddress: string;
  
  // Request details
  credentialType: string; // schemaId
  claims: Array<{
    field: string;
    type: ClaimType;
    value?: any;
  }>;
  message: string | null;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  
  // Timestamps
  createdAt: Date;
  expiresAt: Date;
  respondedAt: Date | null;
}
```

---

#### `verification_responses`

```typescript
interface VerificationResponseDocument {
  _id: string; // resp_{uuid}
  requestId: string;
  credentialId: string;
  
  // ZKP results
  proofs: Array<{
    claim: string;
    type: ClaimType;
    result: boolean | any;
  }>;
  
  // Credential verification
  verification: {
    merkleProofValid: boolean;
    anchoredOnChain: boolean;
    anchorTxHash: string;
    issuerTrusted: boolean;
    notRevoked: boolean;
  };
  
  respondedAt: Date;
}
```

---

#### `verifiers`

```typescript
interface VerifierDocument {
  _id: string; // verifier_{uuid}
  walletAddress: string;
  did: string;
  
  // Profile
  name: string;
  type: 'employer' | 'university' | 'government' | 'service' | 'other';
  website: string;
  logo: string | null;
  
  // Admin managed
  verified: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### `notifications`

```typescript
interface NotificationDocument {
  _id: string; // notif_{uuid}
  recipientAddress: string;
  
  type: 'verification_request' | 'credential_revoked' | 'credential_issued' | 'request_responded';
  title: string;
  message: string;
  
  // Related entity
  data: {
    requestId?: string;
    credentialId?: string;
    verifierId?: string;
  };
  
  read: boolean;
  createdAt: Date;
}
```

---

### 4.2 Indexes

```javascript
// credentials
db.credentials.createIndex({ recipientAddress: 1 })
db.credentials.createIndex({ recipientAddress: 1, claimed: 1, revoked: 1 })
db.credentials.createIndex({ batchId: 1 })
db.credentials.createIndex({ schemaId: 1 })

// batches
db.batches.createIndex({ merkleRoot: 1 }, { unique: true })

// share_tokens
db.share_tokens.createIndex({ credentialId: 1 })
db.share_tokens.createIndex({ createdBy: 1 })

// verification_requests
db.verification_requests.createIndex({ targetAddress: 1, status: 1 })
db.verification_requests.createIndex({ verifierId: 1 })
db.verification_requests.createIndex({ expiresAt: 1 })

// verification_responses
db.verification_responses.createIndex({ requestId: 1 }, { unique: true })

// verifiers
db.verifiers.createIndex({ walletAddress: 1 }, { unique: true })

// notifications
db.notifications.createIndex({ recipientAddress: 1, read: 1 })
db.notifications.createIndex({ createdAt: -1 })
```

---

## 5. Smart Contract Integration

### 5.1 Contract: `CredentialRegistry.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CredentialRegistry {
    address public owner;
    
    struct Issuer {
        string did;
        string name;
        bool active;
        uint256 registeredAt;
    }
    
    struct Batch {
        bytes32 merkleRoot;
        address issuer;
        uint256 credentialCount;
        uint256 timestamp;
    }
    
    mapping(address => Issuer) public trustedIssuers;
    address[] public issuerList;
    mapping(bytes32 => Batch) public batches;
    
    event IssuerRegistered(address indexed issuerAddress, string did, string name);
    event IssuerRevoked(address indexed issuerAddress);
    event BatchAnchored(bytes32 indexed merkleRoot, address indexed issuer, uint256 credentialCount, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyTrustedIssuer() {
        require(trustedIssuers[msg.sender].active, "Not trusted issuer");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function registerIssuer(
        address issuerAddress,
        string calldata did,
        string calldata name
    ) external onlyOwner {
        trustedIssuers[issuerAddress] = Issuer(did, name, true, block.timestamp);
        issuerList.push(issuerAddress);
        emit IssuerRegistered(issuerAddress, did, name);
    }
    
    function revokeIssuer(address issuerAddress) external onlyOwner {
        trustedIssuers[issuerAddress].active = false;
        emit IssuerRevoked(issuerAddress);
    }
    
    function isIssuerTrusted(address issuerAddress) external view returns (bool) {
        return trustedIssuers[issuerAddress].active;
    }
    
    function getIssuer(address issuerAddress) external view returns (Issuer memory) {
        return trustedIssuers[issuerAddress];
    }
    
    function getIssuerCount() external view returns (uint256) {
        return issuerList.length;
    }
    
    function anchorBatch(
        bytes32 merkleRoot,
        uint256 credentialCount
    ) external onlyTrustedIssuer {
        require(batches[merkleRoot].timestamp == 0, "Batch already exists");
        batches[merkleRoot] = Batch(merkleRoot, msg.sender, credentialCount, block.timestamp);
        emit BatchAnchored(merkleRoot, msg.sender, credentialCount, block.timestamp);
    }
    
    function getBatch(bytes32 merkleRoot) external view returns (Batch memory) {
        return batches[merkleRoot];
    }
    
    function batchExists(bytes32 merkleRoot) external view returns (bool) {
        return batches[merkleRoot].timestamp != 0;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
```

### 5.2 Contract ABI (`/lib/blockchain/contract-abi.ts`)

Full ABI exported as TypeScript constant.

---

## 6. External Services Integration

### 6.1 Web3Auth

**Purpose:** Social login, wallet generation, address prediction

**Server SDK:**
```typescript
import { Web3Auth } from "@web3auth/node-sdk";

const web3auth = new Web3Auth({
  clientId: process.env.WEB3AUTH_CLIENT_ID,
  web3AuthNetwork: "sapphire_devnet",
});
```

**Frontend SDK:**
```typescript
import { Web3Auth } from "@web3auth/modal";

const web3auth = new Web3Auth({
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x13882", // Polygon Amoy
    rpcTarget: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
  },
});
```

---

### 6.2 Pinata (IPFS)

**Purpose:** Decentralized credential storage

```typescript
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY_URL;
```

---

### 6.3 MongoDB Atlas

**Purpose:** Query layer, mutable state

```typescript
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'decentralized_identity';
```

---

### 6.4 Polygon Amoy (Testnet)

**Purpose:** Smart contract deployment, transaction anchoring

```typescript
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
const CONTRACT_ADDRESS = process.env.CREDENTIAL_REGISTRY_CONTRACT;
```

---

## 7. Type Definitions

### 7.1 `/lib/types/credentials.ts`

```typescript
export interface VerifiableCredential { ... }
export interface CredentialProof { ... }
export interface CredentialInput { ... }
export interface CredentialSchema { ... }
export interface SchemaField { ... }
export interface MerkleTree { ... }
export interface MerkleProof { ... }
```

### 7.2 `/lib/types/database.ts`

```typescript
export interface CredentialDocument { ... }
export interface BatchDocument { ... }
export interface ShareTokenDocument { ... }
export interface VerificationRequestDocument { ... }
export interface VerificationResponseDocument { ... }
export interface VerifierDocument { ... }
export interface NotificationDocument { ... }
```

### 7.3 `/lib/types/api.ts`

```typescript
// Request types
export interface IssueCredentialRequest { ... }
export interface IssueBatchRequest { ... }
export interface CreateShareRequest { ... }
export interface CreateVerificationRequest { ... }
export interface ApproveRequestPayload { ... }

// Response types
export interface CredentialListResponse { ... }
export interface CredentialDetailResponse { ... }
export interface VerificationResponse { ... }
export interface StatsResponse { ... }

// Common
export interface PaginationParams { ... }
export interface PaginatedResponse<T> { ... }
```

### 7.4 `/lib/types/blockchain.ts`

```typescript
export interface IssuerInfo { ... }
export interface BatchInfo { ... }
export interface TransactionData { ... }
```

---

## 8. Environment Configuration

### 8.1 Required Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Web3Auth
WEB3AUTH_CLIENT_ID=...
WEB3AUTH_CLIENT_SECRET=...
WEB3AUTH_VERIFIER=...
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=...

# IPFS (Pinata)
PINATA_API_KEY=...
PINATA_SECRET_API_KEY=...
PINATA_GATEWAY_URL=https://gateway.pinata.cloud/ipfs

# Blockchain
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
CREDENTIAL_REGISTRY_CONTRACT=0x...

# Issuer Identity
ISSUER_DID=did:web:your-app.vercel.app
ISSUER_PRIVATE_KEY=... # Ed25519 for signing (if needed)
ISSUER_WALLET_ADDRESS=0x...

# Role Assignment
VERIFIER_WALLET_ADDRESS=0x...

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 9. Scripts

### 9.1 `/scripts/generate-keys.ts`

Generates Ed25519 key pair for credential signing.

### 9.2 `/scripts/deploy-contract.ts`

Deploys CredentialRegistry to Polygon Amoy.

### 9.3 `/scripts/register-issuer.ts`

Registers issuer address in deployed contract.

### 9.4 `/scripts/setup-indexes.ts`

Creates MongoDB indexes for all collections.

### 9.5 `/scripts/seed-schemas.ts`

Seeds credential schemas (if stored in DB instead of code).

---

## Summary

This backend structure provides:

- **39 API endpoints** covering all three user roles
- **7 core libraries** for merkle trees, credentials, blockchain, IPFS, auth, and utilities
- **7 MongoDB collections** with proper indexing
- **1 smart contract** for trusted issuer registry and batch anchoring
- **4 external integrations** (Web3Auth, Pinata, MongoDB Atlas, Polygon)
- **Complete type safety** with TypeScript interfaces throughout

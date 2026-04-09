# Implementation Plans Document

## Decentralized Identity Verification System

**Version:** 1.0  
**Date:** April 2026

---

## Table of Contents

1. [Implementation Overview](#1-implementation-overview)
2. [Phase 1: Project Setup](#2-phase-1-project-setup)
3. [Phase 2: Smart Contract](#3-phase-2-smart-contract)
4. [Phase 3: Core Libraries](#4-phase-3-core-libraries)
5. [Phase 4: Authentication](#5-phase-4-authentication)
6. [Phase 5: Issuer Module](#6-phase-5-issuer-module)
7. [Phase 6: Recipient Module](#7-phase-6-recipient-module)
8. [Phase 7: Verifier Module](#8-phase-7-verifier-module)
9. [Phase 8: Public Verification](#9-phase-8-public-verification)
10. [Phase 9: PWA and Polish](#10-phase-9-pwa-and-polish)
11. [Environment Variables](#11-environment-variables)
12. [Deployment Checklist](#12-deployment-checklist)

---

## 1. Implementation Overview

### 1.1 Implementation Phases

| Phase | Focus | Estimated Effort |
|-------|-------|------------------|
| 1 | Project Setup | 2-3 hours |
| 2 | Smart Contract | 3-4 hours |
| 3 | Core Libraries | 4-6 hours |
| 4 | Authentication | 3-4 hours |
| 5 | Issuer Module | 8-10 hours |
| 6 | Recipient Module | 8-10 hours |
| 7 | Verifier Module | 6-8 hours |
| 8 | Public Verification | 2-3 hours |
| 9 | PWA and Polish | 3-4 hours |
| **Total** | | **39-52 hours** |

### 1.2 Dependencies

```
Implementation Order:

Phase 1 (Setup) ─────────────────────────┐
                                         │
Phase 2 (Contract) ──────────────────────┤
                                         │
Phase 3 (Libraries) ◀────────────────────┤
    │                                    │
    ├── merkle.ts                        │
    ├── credentials.ts                   │
    ├── blockchain.ts                    │
    ├── ipfs.ts                          │
    ├── schemas.ts                       │
    └── db.ts                            │
                                         │
Phase 4 (Auth) ◀─────────────────────────┤
    │                                    │
    ├── web3auth.ts                      │
    └── roles.ts                         │
                                         │
    ┌────────────────┼────────────────┐  │
    ▼                ▼                ▼  │
Phase 5          Phase 6          Phase 7│
(Issuer)        (Recipient)      (Verifier)
    │                │                │  │
    └────────────────┼────────────────┘  │
                     │                   │
                     ▼                   │
                Phase 8 ◀────────────────┘
            (Public Verification)
                     │
                     ▼
                Phase 9
             (PWA & Polish)
```

---

## 2. Phase 1: Project Setup

### 2.1 Initialize Next.js Project

**Tasks:**

1. **Create Next.js application**
   ```bash
   # Project will be created in v0
   # Using Next.js 16 with App Router
   ```

2. **Configure TypeScript**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "target": "ES2022",
       "lib": ["dom", "dom.iterable", "ES2022"],
       "strict": true,
       "module": "esnext",
       "moduleResolution": "bundler",
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

3. **Install and configure Tailwind CSS**
   - Install tailwindcss, postcss, autoprefixer
   - Configure tailwind.config.ts with custom theme

4. **Install shadcn/ui**
   - Initialize shadcn/ui
   - Add required components: Button, Card, Input, Dialog, Tabs, Select, Switch, Badge, Avatar, Dropdown, Toast

### 2.2 Directory Structure Setup

**Create directories:**

```
/app
  /api
  /issuer
  /recipient
  /verifier
  /verify
/components
  /issuer
  /recipient
  /verifier
  /shared
  /ui (shadcn)
/lib
/contracts
/scripts
/public
  /.well-known
/docs
```

### 2.3 Dependencies Installation

**Core dependencies:**
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "mongodb": "^6.0.0",
    "viem": "^2.0.0",
    "@web3auth/modal": "^8.0.0",
    "@web3auth/base": "^8.0.0",
    "@web3auth/node-sdk": "^4.0.0",
    "@noble/hashes": "^1.3.0",
    "@noble/ed25519": "^2.0.0",
    "pinata": "^1.0.0",
    "papaparse": "^5.4.0",
    "html2canvas": "^1.4.0",
    "qrcode.react": "^3.1.0",
    "file-saver": "^2.0.0",
    "sonner": "^1.0.0",
    "lucide-react": "^0.400.0",
    "react-dropzone": "^14.0.0",
    "uuid": "^9.0.0"
  }
}
```

### 2.4 Files to Create

| File | Purpose |
|------|---------|
| `/app/layout.tsx` | Root layout with providers |
| `/app/page.tsx` | Landing page |
| `/app/globals.css` | Global styles with Tailwind |
| `/lib/db.ts` | MongoDB connection |
| `/public/.well-known/did.json` | Issuer DID document (placeholder) |

---

## 3. Phase 2: Smart Contract

### 3.1 Contract Development

**File:** `/contracts/CredentialRegistry.sol`

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
    
    function registerIssuer(address issuerAddress, string calldata did, string calldata name) external onlyOwner {
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
    
    function anchorBatch(bytes32 merkleRoot, uint256 credentialCount) external onlyTrustedIssuer {
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

### 3.2 Deployment Script

**File:** `/scripts/deploy-contract.js`

```javascript
const { createWalletClient, http, createPublicClient } = require('viem');
const { polygonAmoy } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');

// Contract ABI and Bytecode (after compilation)
const CONTRACT_ABI = [/* ABI from compilation */];
const CONTRACT_BYTECODE = '0x...'; // Bytecode from compilation

async function deploy() {
  const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
  
  const walletClient = createWalletClient({
    account,
    chain: polygonAmoy,
    transport: http('https://rpc-amoy.polygon.technology')
  });
  
  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http('https://rpc-amoy.polygon.technology')
  });
  
  // Deploy contract
  const hash = await walletClient.deployContract({
    abi: CONTRACT_ABI,
    bytecode: CONTRACT_BYTECODE,
  });
  
  // Wait for deployment
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  console.log('Contract deployed at:', receipt.contractAddress);
  
  // Register issuer
  const issuerAddress = process.env.ISSUER_WALLET_ADDRESS;
  const issuerDID = process.env.ISSUER_DID;
  const issuerName = 'Demo University';
  
  const registerHash = await walletClient.writeContract({
    address: receipt.contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'registerIssuer',
    args: [issuerAddress, issuerDID, issuerName]
  });
  
  await publicClient.waitForTransactionReceipt({ hash: registerHash });
  
  console.log('Issuer registered:', issuerAddress);
}

deploy().catch(console.error);
```

### 3.3 Contract ABI Export

**File:** `/lib/contract-abi.ts`

```typescript
export const CREDENTIAL_REGISTRY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "name": "merkleRoot", "type": "bytes32" },
      { "name": "credentialCount", "type": "uint256" }
    ],
    "name": "anchorBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "merkleRoot", "type": "bytes32" }],
    "name": "batchExists",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "merkleRoot", "type": "bytes32" }],
    "name": "getBatch",
    "outputs": [
      {
        "components": [
          { "name": "merkleRoot", "type": "bytes32" },
          { "name": "issuer", "type": "address" },
          { "name": "credentialCount", "type": "uint256" },
          { "name": "timestamp", "type": "uint256" }
        ],
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "issuerAddress", "type": "address" }],
    "name": "isIssuerTrusted",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "issuerAddress", "type": "address" }],
    "name": "getIssuer",
    "outputs": [
      {
        "components": [
          { "name": "did", "type": "string" },
          { "name": "name", "type": "string" },
          { "name": "active", "type": "bool" },
          { "name": "registeredAt", "type": "uint256" }
        ],
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
```

---

## 4. Phase 3: Core Libraries

### 4.1 Database Connection

**File:** `/lib/db.ts`

```typescript
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db('decentralized_identity');
  
  // Create indexes
  await db.collection('credentials').createIndex({ recipientAddress: 1 });
  await db.collection('credentials').createIndex({ batchId: 1 });
  await db.collection('credentials').createIndex({ recipientAddress: 1, claimed: 1 });
  await db.collection('share_tokens').createIndex({ credentialId: 1 });
  await db.collection('verification_requests').createIndex({ targetAddress: 1 });
  await db.collection('verification_requests').createIndex({ verifierId: 1 });
  await db.collection('notifications').createIndex({ recipientAddress: 1, read: 1 });
  
  return db;
}

export { db };
```

### 4.2 Merkle Tree Implementation

**File:** `/lib/merkle.ts`

```typescript
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

export interface MerkleProof {
  root: string;
  proof: string[];
  leafIndex: number;
}

export function hashLeaf(data: string): string {
  const bytes = new TextEncoder().encode(data);
  return bytesToHex(sha256(bytes));
}

export function hashPair(left: string, right: string): string {
  const combined = hexToBytes(left).concat(hexToBytes(right));
  return bytesToHex(sha256(new Uint8Array(combined)));
}

export function buildMerkleTree(leaves: string[]): { root: string; layers: string[][] } {
  if (leaves.length === 0) {
    throw new Error('Cannot build tree from empty leaves');
  }
  
  // Hash all leaves
  let currentLayer = leaves.map(leaf => hashLeaf(leaf));
  const layers: string[][] = [currentLayer];
  
  // Build tree bottom-up
  while (currentLayer.length > 1) {
    const nextLayer: string[] = [];
    
    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i];
      const right = currentLayer[i + 1] || left; // Duplicate last if odd
      nextLayer.push(hashPair(left, right));
    }
    
    layers.push(nextLayer);
    currentLayer = nextLayer;
  }
  
  return {
    root: currentLayer[0],
    layers
  };
}

export function generateMerkleProof(
  leaves: string[],
  leafIndex: number
): MerkleProof {
  const { root, layers } = buildMerkleTree(leaves);
  const proof: string[] = [];
  
  let index = leafIndex;
  
  for (let i = 0; i < layers.length - 1; i++) {
    const layer = layers[i];
    const isRight = index % 2 === 1;
    const siblingIndex = isRight ? index - 1 : index + 1;
    
    if (siblingIndex < layer.length) {
      proof.push(layer[siblingIndex]);
    } else {
      proof.push(layer[index]); // Duplicate for odd layers
    }
    
    index = Math.floor(index / 2);
  }
  
  return { root, proof, leafIndex };
}

export function verifyMerkleProof(
  leaf: string,
  proof: string[],
  root: string,
  leafIndex: number
): boolean {
  let hash = hashLeaf(leaf);
  let index = leafIndex;
  
  for (const sibling of proof) {
    const isRight = index % 2 === 1;
    
    if (isRight) {
      hash = hashPair(sibling, hash);
    } else {
      hash = hashPair(hash, sibling);
    }
    
    index = Math.floor(index / 2);
  }
  
  return hash === root;
}
```

### 4.3 Credential Builder

**File:** `/lib/credentials.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';
import { ed25519 } from '@noble/ed25519';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

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
  proof?: {
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
  };
}

export interface CredentialInput {
  schemaId: string;
  schemaType: string;
  recipientDID: string;
  fields: Record<string, any>;
}

export function buildCredential(
  input: CredentialInput,
  issuerDID: string
): VerifiableCredential {
  const credential: VerifiableCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1'
    ],
    id: `urn:uuid:${uuidv4()}`,
    type: ['VerifiableCredential', input.schemaType],
    issuer: issuerDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: input.recipientDID,
      ...input.fields
    }
  };
  
  return credential;
}

export function addProofToCredential(
  credential: VerifiableCredential,
  proof: {
    merkleRoot: string;
    leafIndex: number;
    merkleProof: string[];
    anchorTransactionHash: string;
    anchorContract: string;
  },
  issuerDID: string
): VerifiableCredential {
  return {
    ...credential,
    proof: {
      type: 'MerkleProof2019',
      created: new Date().toISOString(),
      verificationMethod: `${issuerDID}#key-1`,
      proofPurpose: 'assertionMethod',
      merkleRoot: proof.merkleRoot,
      leafIndex: proof.leafIndex,
      merkleProof: proof.merkleProof,
      anchorTransactionHash: proof.anchorTransactionHash,
      anchorChain: 'polygon',
      anchorContract: proof.anchorContract
    }
  };
}

export function serializeCredential(credential: VerifiableCredential): string {
  // Canonical JSON serialization for hashing
  return JSON.stringify(credential, Object.keys(credential).sort());
}
```

### 4.4 Blockchain Interaction

**File:** `/lib/blockchain.ts`

```typescript
import { createPublicClient, http, Address, Hex } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { CREDENTIAL_REGISTRY_ABI } from './contract-abi';

const CONTRACT_ADDRESS = process.env.CREDENTIAL_REGISTRY_CONTRACT as Address;
const RPC_URL = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology';

const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(RPC_URL)
});

export interface BatchInfo {
  merkleRoot: Hex;
  issuer: Address;
  credentialCount: bigint;
  timestamp: bigint;
}

export async function isIssuerTrusted(address: Address): Promise<boolean> {
  const result = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'isIssuerTrusted',
    args: [address]
  });
  return result as boolean;
}

export async function getIssuerInfo(address: Address) {
  const result = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'getIssuer',
    args: [address]
  });
  return result;
}

export async function batchExists(merkleRoot: Hex): Promise<boolean> {
  const result = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'batchExists',
    args: [merkleRoot]
  });
  return result as boolean;
}

export async function getBatchInfo(merkleRoot: Hex): Promise<BatchInfo | null> {
  const exists = await batchExists(merkleRoot);
  if (!exists) return null;
  
  const result = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'getBatch',
    args: [merkleRoot]
  });
  
  return result as BatchInfo;
}

export function prepareAnchorTransaction(
  merkleRoot: Hex,
  credentialCount: number
) {
  return {
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'anchorBatch',
    args: [merkleRoot, BigInt(credentialCount)]
  };
}

export { CONTRACT_ADDRESS, publicClient };
```

### 4.5 IPFS Integration

**File:** `/lib/ipfs.ts`

```typescript
const PINATA_API_KEY = process.env.PINATA_API_KEY!;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_API_KEY!;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export async function uploadToIPFS(data: object): Promise<string> {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY
    },
    body: JSON.stringify({
      pinataContent: data,
      pinataOptions: {
        cidVersion: 1
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`IPFS upload failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.IpfsHash;
}

export async function fetchFromIPFS<T>(cid: string): Promise<T> {
  const response = await fetch(`${PINATA_GATEWAY}/${cid}`);
  
  if (!response.ok) {
    throw new Error(`IPFS fetch failed: ${response.statusText}`);
  }
  
  return response.json();
}

export function getIPFSUrl(cid: string): string {
  return `${PINATA_GATEWAY}/${cid}`;
}
```

### 4.6 Credential Schemas

**File:** `/lib/schemas.ts`

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
  type: string;
  fields: SchemaField[];
}

export const CREDENTIAL_SCHEMAS: CredentialSchema[] = [
  {
    id: 'university-degree',
    name: 'University Degree',
    description: 'Academic degree credential from a university',
    type: 'UniversityDegree',
    fields: [
      { key: 'name', label: 'Full Name', type: 'string', required: true, hideable: false },
      { key: 'degree', label: 'Degree Type', type: 'select', required: true, hideable: false, 
        options: ['Bachelor of Science', 'Bachelor of Arts', 'Master of Science', 'Master of Arts', 'Doctor of Philosophy'] },
      { key: 'major', label: 'Major/Field of Study', type: 'string', required: true, hideable: true },
      { key: 'gpa', label: 'GPA', type: 'number', required: false, hideable: true, 
        validation: { min: 0, max: 4 } },
      { key: 'graduationDate', label: 'Graduation Date', type: 'date', required: true, hideable: true },
      { key: 'studentId', label: 'Student ID', type: 'string', required: false, hideable: true }
    ]
  },
  {
    id: 'employment-certificate',
    name: 'Employment Certificate',
    description: 'Certificate of employment from an organization',
    type: 'EmploymentCertificate',
    fields: [
      { key: 'name', label: 'Employee Name', type: 'string', required: true, hideable: false },
      { key: 'position', label: 'Position/Title', type: 'string', required: true, hideable: false },
      { key: 'department', label: 'Department', type: 'string', required: false, hideable: true },
      { key: 'startDate', label: 'Start Date', type: 'date', required: true, hideable: true },
      { key: 'endDate', label: 'End Date', type: 'date', required: false, hideable: true },
      { key: 'employeeId', label: 'Employee ID', type: 'string', required: false, hideable: true }
    ]
  },
  {
    id: 'professional-certificate',
    name: 'Professional Certificate',
    description: 'Professional certification or license',
    type: 'ProfessionalCertificate',
    fields: [
      { key: 'name', label: 'Certificate Holder', type: 'string', required: true, hideable: false },
      { key: 'certificateName', label: 'Certificate Name', type: 'string', required: true, hideable: false },
      { key: 'issuingBody', label: 'Issuing Organization', type: 'string', required: true, hideable: false },
      { key: 'issueDate', label: 'Issue Date', type: 'date', required: true, hideable: true },
      { key: 'expiryDate', label: 'Expiry Date', type: 'date', required: false, hideable: true },
      { key: 'certificateNumber', label: 'Certificate Number', type: 'string', required: false, hideable: true }
    ]
  },
  {
    id: 'event-attendance',
    name: 'Event Attendance',
    description: 'Proof of attendance at an event',
    type: 'EventAttendance',
    fields: [
      { key: 'name', label: 'Attendee Name', type: 'string', required: true, hideable: false },
      { key: 'eventName', label: 'Event Name', type: 'string', required: true, hideable: false },
      { key: 'eventDate', label: 'Event Date', type: 'date', required: true, hideable: false },
      { key: 'eventLocation', label: 'Location', type: 'string', required: false, hideable: true },
      { key: 'ticketId', label: 'Ticket/Registration ID', type: 'string', required: false, hideable: true }
    ]
  }
];

export function getSchemaById(id: string): CredentialSchema | undefined {
  return CREDENTIAL_SCHEMAS.find(schema => schema.id === id);
}

export function getHideableFields(schemaId: string): string[] {
  const schema = getSchemaById(schemaId);
  if (!schema) return [];
  return schema.fields.filter(f => f.hideable).map(f => f.key);
}

export function getNonHideableFields(schemaId: string): string[] {
  const schema = getSchemaById(schemaId);
  if (!schema) return [];
  return schema.fields.filter(f => !f.hideable).map(f => f.key);
}
```

### 4.7 Roles Configuration

**File:** `/lib/roles.ts`

```typescript
// For hackathon: hardcoded addresses
// In production: fetch from database

const ISSUER_ADDRESS = process.env.ISSUER_WALLET_ADDRESS?.toLowerCase();
const VERIFIER_ADDRESS = process.env.VERIFIER_WALLET_ADDRESS?.toLowerCase();

export type Role = 'issuer' | 'verifier' | 'user';

export function getUserRole(walletAddress: string): Role {
  const address = walletAddress.toLowerCase();
  
  if (address === ISSUER_ADDRESS) return 'issuer';
  if (address === VERIFIER_ADDRESS) return 'verifier';
  return 'user';
}

export function isIssuer(walletAddress: string): boolean {
  return getUserRole(walletAddress) === 'issuer';
}

export function isVerifier(walletAddress: string): boolean {
  return getUserRole(walletAddress) === 'verifier';
}
```

---

## 5. Phase 4: Authentication

### 5.1 Web3Auth Server SDK

**File:** `/lib/web3auth.ts`

```typescript
import { Web3Auth } from '@web3auth/node-sdk';
import { CHAIN_NAMESPACES } from '@web3auth/base';

const web3auth = new Web3Auth({
  clientId: process.env.WEB3AUTH_CLIENT_ID!,
  web3AuthNetwork: 'sapphire_devnet',
});

export async function predictAddressFromEmail(email: string): Promise<string> {
  try {
    const address = await web3auth.getPublicAddress({
      verifier: process.env.WEB3AUTH_VERIFIER!,
      verifierId: email,
    });
    return address;
  } catch (error) {
    console.error('Error predicting address:', error);
    throw new Error('Failed to predict wallet address');
  }
}

export async function predictAddressesBatch(emails: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  // Process in parallel with concurrency limit
  const BATCH_SIZE = 10;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    const predictions = await Promise.all(
      batch.map(async (email) => {
        const address = await predictAddressFromEmail(email);
        return { email, address };
      })
    );
    predictions.forEach(p => results.set(p.email, p.address));
  }
  
  return results;
}
```

### 5.2 Web3Auth Client SDK

**File:** `/lib/web3auth-client.ts`

```typescript
'use client';

import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x13882', // Polygon Amoy
  rpcTarget: 'https://rpc-amoy.polygon.technology',
  displayName: 'Polygon Amoy Testnet',
  blockExplorerUrl: 'https://amoy.polygonscan.com',
  ticker: 'MATIC',
  tickerName: 'MATIC',
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

export const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
  uiConfig: {
    appName: 'Decentralized Identity',
    mode: 'light',
    loginMethodsOrder: ['google', 'email_passwordless'],
  },
});

export async function initWeb3Auth() {
  await web3auth.initModal();
}

export async function login() {
  const provider = await web3auth.connect();
  return provider;
}

export async function logout() {
  await web3auth.logout();
}

export async function getWalletAddress(): Promise<string | null> {
  if (!web3auth.provider) return null;
  
  const accounts = await web3auth.provider.request<string[]>({
    method: 'eth_accounts',
  });
  
  return accounts?.[0] || null;
}

export async function getUserInfo() {
  return web3auth.getUserInfo();
}
```

### 5.3 Auth Context Provider

**File:** `/components/providers/auth-provider.tsx`

```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { web3auth, initWeb3Auth, login, logout, getWalletAddress, getUserInfo } from '@/lib/web3auth-client';
import { getUserRole, Role } from '@/lib/roles';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  walletAddress: string | null;
  userInfo: any | null;
  role: Role | null;
  did: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [did, setDid] = useState<string | null>(null);
  
  useEffect(() => {
    const init = async () => {
      try {
        await initWeb3Auth();
        const address = await getWalletAddress();
        if (address) {
          setWalletAddress(address);
          setIsAuthenticated(true);
          setRole(getUserRole(address));
          setDid(`did:pkh:eip155:137:${address}`);
          const info = await getUserInfo();
          setUserInfo(info);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);
  
  const connect = async () => {
    try {
      await login();
      const address = await getWalletAddress();
      if (address) {
        setWalletAddress(address);
        setIsAuthenticated(true);
        setRole(getUserRole(address));
        setDid(`did:pkh:eip155:137:${address}`);
        const info = await getUserInfo();
        setUserInfo(info);
      }
    } catch (error) {
      console.error('Connect error:', error);
      throw error;
    }
  };
  
  const disconnect = async () => {
    try {
      await logout();
      setWalletAddress(null);
      setIsAuthenticated(false);
      setRole(null);
      setDid(null);
      setUserInfo(null);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      walletAddress,
      userInfo,
      role,
      did,
      connect,
      disconnect
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## 6. Phase 5: Issuer Module

### 6.1 API Routes

**Files to create:**

| Route | Purpose |
|-------|---------|
| `/app/api/issue/single/route.ts` | Issue single credential |
| `/app/api/issue/batch/route.ts` | Issue batch credentials |
| `/app/api/credentials/issued/route.ts` | List issued credentials |
| `/app/api/credentials/[id]/route.ts` | Get credential details |
| `/app/api/revoke/route.ts` | Revoke credential |
| `/app/api/predict-address/route.ts` | Predict address from email |
| `/app/api/predict-address/batch/route.ts` | Batch predict addresses |
| `/app/api/batches/route.ts` | List batches |
| `/app/api/batches/[id]/route.ts` | Get batch details |

### 6.2 Single Issue API

**File:** `/app/api/issue/single/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { buildCredential, addProofToCredential, serializeCredential } from '@/lib/credentials';
import { buildMerkleTree, generateMerkleProof } from '@/lib/merkle';
import { uploadToIPFS } from '@/lib/ipfs';
import { predictAddressFromEmail } from '@/lib/web3auth';
import { getSchemaById } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schemaId, recipientEmail, fields, anchorTxHash } = body;
    
    // Validate schema
    const schema = getSchemaById(schemaId);
    if (!schema) {
      return NextResponse.json({ error: 'Invalid schema' }, { status: 400 });
    }
    
    // Predict recipient address
    const recipientAddress = await predictAddressFromEmail(recipientEmail);
    const recipientDID = `did:pkh:eip155:137:${recipientAddress}`;
    
    // Build credential
    const credential = buildCredential({
      schemaId,
      schemaType: schema.type,
      recipientDID,
      fields
    }, process.env.ISSUER_DID!);
    
    // Upload to IPFS
    const ipfsCID = await uploadToIPFS(credential);
    
    // Generate merkle tree (single leaf)
    const serialized = serializeCredential(credential);
    const { root } = buildMerkleTree([serialized]);
    const merkleProof = generateMerkleProof([serialized], 0);
    
    // Add proof to credential
    const credentialWithProof = addProofToCredential(credential, {
      merkleRoot: root,
      leafIndex: 0,
      merkleProof: merkleProof.proof,
      anchorTransactionHash: anchorTxHash,
      anchorContract: process.env.CREDENTIAL_REGISTRY_CONTRACT!
    }, process.env.ISSUER_DID!);
    
    // Update IPFS with proof
    const finalCID = await uploadToIPFS(credentialWithProof);
    
    // Store in MongoDB
    const db = await connectToDatabase();
    const batchId = `batch_${Date.now()}`;
    
    await db.collection('batches').insertOne({
      _id: batchId,
      merkleRoot: root,
      batchMetadataCID: finalCID,
      issuerDID: process.env.ISSUER_DID,
      issuerAddress: process.env.ISSUER_WALLET_ADDRESS,
      schemaId,
      credentialCount: 1,
      anchorTxHash,
      createdAt: new Date()
    });
    
    const credentialId = `cred_${Date.now()}`;
    await db.collection('credentials').insertOne({
      _id: credentialId,
      batchId,
      leafIndex: 0,
      leafHash: merkleProof.proof[0] || root,
      ipfsCID: finalCID,
      recipientEmail,
      recipientAddress,
      recipientDID,
      schemaId,
      claimed: false,
      claimedAt: null,
      revoked: false,
      revokedAt: null,
      revokedReason: null,
      issuedAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      credentialId,
      batchId,
      merkleRoot: root,
      ipfsCID: finalCID,
      recipientAddress
    });
    
  } catch (error) {
    console.error('Issue error:', error);
    return NextResponse.json({ error: 'Failed to issue credential' }, { status: 500 });
  }
}
```

### 6.3 Batch Issue API

**File:** `/app/api/issue/batch/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { buildCredential, addProofToCredential, serializeCredential } from '@/lib/credentials';
import { buildMerkleTree, generateMerkleProof } from '@/lib/merkle';
import { uploadToIPFS } from '@/lib/ipfs';
import { predictAddressesBatch } from '@/lib/web3auth';
import { getSchemaById } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schemaId, credentials: credentialInputs, anchorTxHash } = body;
    
    const schema = getSchemaById(schemaId);
    if (!schema) {
      return NextResponse.json({ error: 'Invalid schema' }, { status: 400 });
    }
    
    // Predict all addresses
    const emails = credentialInputs.map((c: any) => c.recipientEmail);
    const addressMap = await predictAddressesBatch(emails);
    
    // Build all credentials
    const credentials = credentialInputs.map((input: any) => {
      const address = addressMap.get(input.recipientEmail)!;
      const recipientDID = `did:pkh:eip155:137:${address}`;
      
      return {
        credential: buildCredential({
          schemaId,
          schemaType: schema.type,
          recipientDID,
          fields: input.fields
        }, process.env.ISSUER_DID!),
        recipientEmail: input.recipientEmail,
        recipientAddress: address,
        recipientDID
      };
    });
    
    // Upload all to IPFS
    const ipfsCIDs = await Promise.all(
      credentials.map(async (c: any) => {
        const cid = await uploadToIPFS(c.credential);
        return { ...c, ipfsCID: cid };
      })
    );
    
    // Build merkle tree
    const serializedCredentials = credentials.map((c: any) => 
      serializeCredential(c.credential)
    );
    const { root, layers } = buildMerkleTree(serializedCredentials);
    
    // Generate proofs and update credentials
    const finalCredentials = await Promise.all(
      ipfsCIDs.map(async (c: any, index: number) => {
        const proof = generateMerkleProof(serializedCredentials, index);
        
        const withProof = addProofToCredential(c.credential, {
          merkleRoot: root,
          leafIndex: index,
          merkleProof: proof.proof,
          anchorTransactionHash: anchorTxHash,
          anchorContract: process.env.CREDENTIAL_REGISTRY_CONTRACT!
        }, process.env.ISSUER_DID!);
        
        const finalCID = await uploadToIPFS(withProof);
        
        return {
          ...c,
          credential: withProof,
          ipfsCID: finalCID,
          leafIndex: index,
          merkleProof: proof.proof
        };
      })
    );
    
    // Store in MongoDB
    const db = await connectToDatabase();
    const batchId = `batch_${Date.now()}`;
    
    await db.collection('batches').insertOne({
      _id: batchId,
      merkleRoot: root,
      issuerDID: process.env.ISSUER_DID,
      issuerAddress: process.env.ISSUER_WALLET_ADDRESS,
      schemaId,
      credentialCount: finalCredentials.length,
      anchorTxHash,
      createdAt: new Date()
    });
    
    const credentialDocs = finalCredentials.map((c: any, index: number) => ({
      _id: `cred_${Date.now()}_${index}`,
      batchId,
      leafIndex: c.leafIndex,
      ipfsCID: c.ipfsCID,
      recipientEmail: c.recipientEmail,
      recipientAddress: c.recipientAddress,
      recipientDID: c.recipientDID,
      schemaId,
      claimed: false,
      claimedAt: null,
      revoked: false,
      revokedAt: null,
      revokedReason: null,
      issuedAt: new Date()
    }));
    
    await db.collection('credentials').insertMany(credentialDocs);
    
    return NextResponse.json({
      success: true,
      batchId,
      merkleRoot: root,
      credentialCount: finalCredentials.length,
      anchorTxHash
    });
    
  } catch (error) {
    console.error('Batch issue error:', error);
    return NextResponse.json({ error: 'Failed to issue batch' }, { status: 500 });
  }
}
```

### 6.4 Issuer Pages

**Files to create:**

| Page | Purpose |
|------|---------|
| `/app/issuer/page.tsx` | Issuer dashboard |
| `/app/issuer/issue/page.tsx` | Single credential issuance form |
| `/app/issuer/batch/page.tsx` | Batch issuance with CSV |
| `/app/issuer/credentials/page.tsx` | List issued credentials |
| `/app/issuer/credentials/[id]/page.tsx` | Credential detail |
| `/app/issuer/batches/page.tsx` | List batches |

### 6.5 Issuer Components

**Files to create:**

| Component | Purpose |
|-----------|---------|
| `/components/issuer/schema-selector.tsx` | Dropdown for schema selection |
| `/components/issuer/dynamic-form.tsx` | Form generated from schema |
| `/components/issuer/credential-preview.tsx` | Preview before issuance |
| `/components/issuer/csv-uploader.tsx` | Drag-drop CSV upload |
| `/components/issuer/validation-results.tsx` | CSV validation display |
| `/components/issuer/issuance-progress.tsx` | Progress during batch |
| `/components/issuer/credential-card.tsx` | Credential summary card |
| `/components/issuer/revocation-modal.tsx` | Revocation confirmation |

---

## 7. Phase 6: Recipient Module

### 7.1 API Routes

**Files to create:**

| Route | Purpose |
|-------|---------|
| `/app/api/credentials/me/route.ts` | Get user's credentials |
| `/app/api/credentials/[id]/claim/route.ts` | Claim credential |
| `/app/api/share/route.ts` | Create share token |
| `/app/api/share/[token]/route.ts` | Get/delete share token |
| `/app/api/requests/pending/route.ts` | Get pending requests |
| `/app/api/requests/[id]/approve/route.ts` | Approve request |
| `/app/api/requests/[id]/reject/route.ts` | Reject request |
| `/app/api/notifications/route.ts` | Get notifications |
| `/app/api/notifications/[id]/read/route.ts` | Mark as read |

### 7.2 Get User Credentials API

**File:** `/app/api/credentials/me/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const address = request.headers.get('x-wallet-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const db = await connectToDatabase();
    
    const credentials = await db.collection('credentials')
      .find({ recipientAddress: address.toLowerCase() })
      .sort({ issuedAt: -1 })
      .toArray();
    
    const available = credentials.filter(c => !c.claimed && !c.revoked);
    const claimed = credentials.filter(c => c.claimed && !c.revoked);
    const revoked = credentials.filter(c => c.revoked);
    
    return NextResponse.json({
      available,
      claimed,
      revoked,
      counts: {
        available: available.length,
        claimed: claimed.length,
        revoked: revoked.length,
        total: credentials.length
      }
    });
    
  } catch (error) {
    console.error('Get credentials error:', error);
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
  }
}
```

### 7.3 Create Share Token API

**File:** `/app/api/share/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const address = request.headers.get('x-wallet-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { credentialId, disclosedFields, hiddenFields, expiresAt, maxViews } = body;
    
    const db = await connectToDatabase();
    
    // Verify ownership
    const credential = await db.collection('credentials').findOne({
      _id: credentialId,
      recipientAddress: address.toLowerCase()
    });
    
    if (!credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }
    
    if (!credential.claimed) {
      return NextResponse.json({ error: 'Credential not claimed' }, { status: 400 });
    }
    
    if (credential.revoked) {
      return NextResponse.json({ error: 'Credential is revoked' }, { status: 400 });
    }
    
    // Create share token
    const shareToken = `share_${uuidv4().replace(/-/g, '')}`;
    
    await db.collection('share_tokens').insertOne({
      _id: shareToken,
      credentialId,
      createdBy: address.toLowerCase(),
      disclosedFields,
      hiddenFields,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxViews: maxViews || null,
      currentViews: 0,
      createdAt: new Date()
    });
    
    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${shareToken}`;
    
    return NextResponse.json({
      success: true,
      shareToken,
      shareLink,
      expiresAt,
      maxViews
    });
    
  } catch (error) {
    console.error('Create share error:', error);
    return NextResponse.json({ error: 'Failed to create share' }, { status: 500 });
  }
}
```

### 7.4 Approve Request API

**File:** `/app/api/requests/[id]/approve/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { fetchFromIPFS } from '@/lib/ipfs';
import { verifyMerkleProof } from '@/lib/merkle';
import { batchExists } from '@/lib/blockchain';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const address = request.headers.get('x-wallet-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { credentialId } = body;
    
    const db = await connectToDatabase();
    
    // Get request
    const verificationRequest = await db.collection('verification_requests').findOne({
      _id: params.id,
      targetAddress: address.toLowerCase(),
      status: 'pending'
    });
    
    if (!verificationRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    
    // Check expiration
    if (new Date() > new Date(verificationRequest.expiresAt)) {
      await db.collection('verification_requests').updateOne(
        { _id: params.id },
        { $set: { status: 'expired' } }
      );
      return NextResponse.json({ error: 'Request expired' }, { status: 400 });
    }
    
    // Get credential
    const credential = await db.collection('credentials').findOne({
      _id: credentialId,
      recipientAddress: address.toLowerCase()
    });
    
    if (!credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }
    
    // Fetch from IPFS
    const credentialData = await fetchFromIPFS(credential.ipfsCID);
    
    // Verify credential
    const batch = await db.collection('batches').findOne({ _id: credential.batchId });
    const onChainExists = await batchExists(batch.merkleRoot as `0x${string}`);
    
    // Generate ZKP response
    const proofs = verificationRequest.claims.map((claim: any) => {
      const value = credentialData.credentialSubject[claim.field];
      
      if (claim.type === 'reveal') {
        return {
          claim: `${claim.field}`,
          type: 'revealed',
          result: null,
          value
        };
      }
      
      let result = false;
      switch (claim.type) {
        case 'equals':
          result = value === claim.value;
          break;
        case 'greaterThan':
          result = Number(value) > Number(claim.value);
          break;
        case 'lessThan':
          result = Number(value) < Number(claim.value);
          break;
        case 'greaterOrEqual':
          result = Number(value) >= Number(claim.value);
          break;
        case 'lessOrEqual':
          result = Number(value) <= Number(claim.value);
          break;
        case 'contains':
          result = String(value).includes(claim.value);
          break;
        case 'exists':
          result = value !== undefined && value !== null;
          break;
      }
      
      return {
        claim: `${claim.field} ${claim.type} ${claim.value || ''}`,
        type: 'comparison',
        result,
        value: null
      };
    });
    
    // Store response
    const responseId = `resp_${Date.now()}`;
    await db.collection('verification_responses').insertOne({
      _id: responseId,
      requestId: params.id,
      credentialId,
      proofs,
      merkleProofValid: true,
      anchoredOnChain: onChainExists,
      anchorTxHash: batch.anchorTxHash,
      notRevoked: !credential.revoked,
      respondedAt: new Date()
    });
    
    // Update request status
    await db.collection('verification_requests').updateOne(
      { _id: params.id },
      { $set: { status: 'approved', respondedAt: new Date() } }
    );
    
    // Notify verifier
    await db.collection('notifications').insertOne({
      recipientAddress: verificationRequest.verifierId,
      type: 'request_approved',
      title: 'Verification Request Approved',
      message: 'User has approved your verification request',
      referenceId: params.id,
      read: false,
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      responseId
    });
    
  } catch (error) {
    console.error('Approve error:', error);
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
  }
}
```

### 7.5 Recipient Pages

**Files to create:**

| Page | Purpose |
|------|---------|
| `/app/recipient/page.tsx` | Recipient dashboard with tabs |
| `/app/recipient/credentials/[id]/page.tsx` | Credential detail |
| `/app/recipient/credentials/[id]/share/page.tsx` | Create share link |
| `/app/recipient/requests/page.tsx` | Verification requests |

### 7.6 Recipient Components

**Files to create:**

| Component | Purpose |
|-----------|---------|
| `/components/recipient/credential-list.tsx` | List of credential cards |
| `/components/recipient/credential-detail.tsx` | Full credential display |
| `/components/recipient/credential-tabs.tsx` | Available/Claimed/Revoked tabs |
| `/components/recipient/share-modal.tsx` | Share creation modal |
| `/components/recipient/disclosure-toggles.tsx` | Field toggle switches |
| `/components/recipient/request-card.tsx` | Verification request card |
| `/components/recipient/notification-bell.tsx` | Notification dropdown |

---

## 8. Phase 7: Verifier Module

### 8.1 API Routes

**Files to create:**

| Route | Purpose |
|-------|---------|
| `/app/api/verifier/register/route.ts` | Register verifier profile |
| `/app/api/verifier/profile/route.ts` | Get/update profile |
| `/app/api/verification-requests/route.ts` | Create/list requests |
| `/app/api/verification-requests/[id]/route.ts` | Get request details |
| `/app/api/verification-requests/[id]/cancel/route.ts` | Cancel request |
| `/app/api/verification-responses/[requestId]/route.ts` | Get response |

### 8.2 Register Verifier API

**File:** `/app/api/verifier/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const address = request.headers.get('x-wallet-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, type, website, logo } = body;
    
    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type required' }, { status: 400 });
    }
    
    const db = await connectToDatabase();
    
    // Check if already registered
    const existing = await db.collection('verifiers').findOne({
      walletAddress: address.toLowerCase()
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Already registered' }, { status: 400 });
    }
    
    const verifierId = `verifier_${Date.now()}`;
    await db.collection('verifiers').insertOne({
      _id: verifierId,
      walletAddress: address.toLowerCase(),
      did: `did:pkh:eip155:137:${address.toLowerCase()}`,
      name,
      type,
      website: website || null,
      logo: logo || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      verifierId
    });
    
  } catch (error) {
    console.error('Register verifier error:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
```

### 8.3 Create Verification Request API

**File:** `/app/api/verification-requests/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { predictAddressFromEmail } from '@/lib/web3auth';

export async function POST(request: NextRequest) {
  try {
    const address = request.headers.get('x-wallet-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const db = await connectToDatabase();
    
    // Verify is registered verifier
    const verifier = await db.collection('verifiers').findOne({
      walletAddress: address.toLowerCase()
    });
    
    if (!verifier) {
      return NextResponse.json({ error: 'Not registered verifier' }, { status: 403 });
    }
    
    const body = await request.json();
    const { targetEmailOrAddress, credentialType, claims, message, expiresInDays } = body;
    
    // Resolve target address
    let targetAddress = targetEmailOrAddress;
    if (targetEmailOrAddress.includes('@')) {
      targetAddress = await predictAddressFromEmail(targetEmailOrAddress);
    }
    
    const requestId = `req_${Date.now()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 7));
    
    await db.collection('verification_requests').insertOne({
      _id: requestId,
      verifierId: verifier._id,
      verifierDID: verifier.did,
      verifierName: verifier.name,
      verifierType: verifier.type,
      targetAddress: targetAddress.toLowerCase(),
      credentialType,
      claims,
      message: message || null,
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
      respondedAt: null
    });
    
    // Notify target user
    await db.collection('notifications').insertOne({
      recipientAddress: targetAddress.toLowerCase(),
      type: 'verification_request',
      title: 'New Verification Request',
      message: `${verifier.name} is requesting to verify your ${credentialType}`,
      referenceId: requestId,
      read: false,
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      requestId
    });
    
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const address = request.headers.get('x-wallet-address');
    if (!address) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const db = await connectToDatabase();
    
    const verifier = await db.collection('verifiers').findOne({
      walletAddress: address.toLowerCase()
    });
    
    if (!verifier) {
      return NextResponse.json({ error: 'Not registered' }, { status: 403 });
    }
    
    const requests = await db.collection('verification_requests')
      .find({ verifierId: verifier._id })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ requests });
    
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
```

### 8.4 Verifier Pages

**Files to create:**

| Page | Purpose |
|------|---------|
| `/app/verifier/page.tsx` | Verifier dashboard |
| `/app/verifier/profile/page.tsx` | Profile form |
| `/app/verifier/request/new/page.tsx` | Create request |
| `/app/verifier/requests/page.tsx` | List requests |
| `/app/verifier/requests/[id]/page.tsx` | Request detail + response |

### 8.5 Verifier Components

**Files to create:**

| Component | Purpose |
|-----------|---------|
| `/components/verifier/profile-form.tsx` | Registration form |
| `/components/verifier/request-form.tsx` | Create request form |
| `/components/verifier/claim-builder.tsx` | Claim definition UI |
| `/components/verifier/response-view.tsx` | Display ZKP response |

---

## 9. Phase 8: Public Verification

### 9.1 Verify Share Token API

**File:** `/app/api/verify/[token]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { fetchFromIPFS } from '@/lib/ipfs';
import { batchExists, getBatchInfo } from '@/lib/blockchain';
import { getSchemaById } from '@/lib/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const db = await connectToDatabase();
    
    // Get share token
    const shareToken = await db.collection('share_tokens').findOne({
      _id: params.token
    });
    
    if (!shareToken) {
      return NextResponse.json({
        valid: false,
        reason: 'Invalid share link'
      });
    }
    
    // Check expiration
    if (shareToken.expiresAt && new Date() > new Date(shareToken.expiresAt)) {
      return NextResponse.json({
        valid: false,
        reason: 'Share link has expired'
      });
    }
    
    // Check max views
    if (shareToken.maxViews && shareToken.currentViews >= shareToken.maxViews) {
      return NextResponse.json({
        valid: false,
        reason: 'Share link has reached maximum views'
      });
    }
    
    // Get credential
    const credential = await db.collection('credentials').findOne({
      _id: shareToken.credentialId
    });
    
    if (!credential) {
      return NextResponse.json({
        valid: false,
        reason: 'Credential not found'
      });
    }
    
    // Check revocation
    if (credential.revoked) {
      return NextResponse.json({
        valid: false,
        reason: 'Credential has been revoked'
      });
    }
    
    // Fetch from IPFS
    const credentialData = await fetchFromIPFS(credential.ipfsCID);
    
    // Verify on-chain
    const batch = await db.collection('batches').findOne({ _id: credential.batchId });
    const onChainValid = await batchExists(batch.merkleRoot as `0x${string}`);
    
    // Apply disclosure mask
    const schema = getSchemaById(credential.schemaId);
    const maskedSubject: Record<string, any> = {};
    
    for (const field of schema!.fields) {
      if (shareToken.disclosedFields.includes(field.key)) {
        maskedSubject[field.key] = credentialData.credentialSubject[field.key];
      } else if (shareToken.hiddenFields.includes(field.key)) {
        maskedSubject[field.key] = '••••••';
      } else {
        // Non-hideable fields always shown
        maskedSubject[field.key] = credentialData.credentialSubject[field.key];
      }
    }
    
    // Increment view count
    await db.collection('share_tokens').updateOne(
      { _id: params.token },
      { $inc: { currentViews: 1 } }
    );
    
    return NextResponse.json({
      valid: true,
      credential: {
        type: credentialData.type[1],
        issuer: credentialData.issuer,
        issuedAt: credentialData.issuanceDate,
        subject: maskedSubject
      },
      verification: {
        merkleProofValid: true,
        anchoredOnChain: onChainValid,
        anchorTxHash: batch.anchorTxHash,
        revoked: false
      },
      shareInfo: {
        createdAt: shareToken.createdAt,
        expiresAt: shareToken.expiresAt,
        viewCount: shareToken.currentViews + 1,
        maxViews: shareToken.maxViews
      }
    });
    
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({
      valid: false,
      reason: 'Verification failed'
    }, { status: 500 });
  }
}
```

### 9.2 Public Verification Page

**File:** `/app/verify/[token]/page.tsx`

```typescript
// Server component that displays verification result
// No authentication required
// Shows masked credential data based on share token settings
```

---

## 10. Phase 9: PWA and Polish

### 10.1 PWA Configuration

**File:** `/public/manifest.json`

```json
{
  "name": "Decentralized Identity",
  "short_name": "DecentID",
  "description": "Decentralized identity verification system",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 10.2 Service Worker (Basic Caching)

**File:** `/public/sw.js`

```javascript
const CACHE_NAME = 'decentralized-identity-v1';
const STATIC_ASSETS = [
  '/',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match('/offline.html');
    })
  );
});
```

### 10.3 Final Polish Tasks

| Task | Description |
|------|-------------|
| Error boundaries | Add React error boundaries |
| Loading states | Skeleton loaders for all data fetching |
| Toast notifications | Success/error feedback |
| Form validation | Client-side validation |
| Responsive design | Mobile-friendly layouts |
| Accessibility | ARIA labels, keyboard navigation |
| Meta tags | SEO optimization |

---

## 11. Environment Variables

### 11.1 Required Variables

```bash
# Web3Auth
WEB3AUTH_CLIENT_ID=
WEB3AUTH_VERIFIER=
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=

# MongoDB
MONGODB_URI=

# IPFS (Pinata)
PINATA_API_KEY=
PINATA_SECRET_API_KEY=

# Blockchain
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
CREDENTIAL_REGISTRY_CONTRACT=

# Issuer Configuration
ISSUER_DID=did:web:your-app.vercel.app
ISSUER_WALLET_ADDRESS=

# Role Assignment (Hackathon)
VERIFIER_WALLET_ADDRESS=

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 11.2 Setup Steps

1. Create Web3Auth project at https://dashboard.web3auth.io
2. Create MongoDB Atlas cluster at https://cloud.mongodb.com
3. Create Pinata account at https://pinata.cloud
4. Sign into app with issuer Gmail to get wallet address
5. Sign into app with verifier Gmail to get wallet address
6. Deploy smart contract and register issuer
7. Set all environment variables in Vercel

---

## 12. Deployment Checklist

### 12.1 Pre-Deployment

- [ ] All environment variables set
- [ ] Smart contract deployed on Polygon Amoy
- [ ] Issuer registered in smart contract
- [ ] DID document at `/.well-known/did.json`
- [ ] MongoDB indexes created
- [ ] CORS configured for API routes

### 12.2 Deployment

- [ ] Deploy to Vercel
- [ ] Verify all pages load
- [ ] Test authentication flow
- [ ] Test single credential issuance
- [ ] Test batch credential issuance
- [ ] Test credential claiming
- [ ] Test share link creation
- [ ] Test share link verification
- [ ] Test verification request flow

### 12.3 Post-Deployment

- [ ] Monitor error logs
- [ ] Test on mobile devices
- [ ] Test offline mode (PWA)
- [ ] Verify MetaMask Snap storage

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 2026 | - | Initial document |

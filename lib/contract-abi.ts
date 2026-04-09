export const CREDENTIAL_REGISTRY_ABI = [
  // Owner functions
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // Issuer Management
  {
    inputs: [
      { internalType: 'address', name: '_issuerAddress', type: 'address' },
      { internalType: 'string', name: '_did', type: 'string' },
      { internalType: 'string', name: '_name', type: 'string' },
    ],
    name: 'registerIssuer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_issuerAddress', type: 'address' },
      { internalType: 'string', name: '_did', type: 'string' },
      { internalType: 'string', name: '_name', type: 'string' },
    ],
    name: 'updateIssuer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_issuerAddress', type: 'address' }],
    name: 'revokeIssuer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_issuerAddress', type: 'address' }],
    name: 'reactivateIssuer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_issuerAddress', type: 'address' }],
    name: 'isIssuerTrusted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_issuerAddress', type: 'address' }],
    name: 'getIssuer',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'did', type: 'string' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'bool', name: 'active', type: 'bool' },
          { internalType: 'uint256', name: 'registeredAt', type: 'uint256' },
        ],
        internalType: 'struct CredentialRegistry.Issuer',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllIssuers',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getIssuerCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Batch Management
  {
    inputs: [
      { internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' },
      { internalType: 'uint256', name: '_credentialCount', type: 'uint256' },
    ],
    name: 'anchorBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' }],
    name: 'getBatch',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
          { internalType: 'address', name: 'issuer', type: 'address' },
          { internalType: 'string', name: 'issuerDID', type: 'string' },
          { internalType: 'uint256', name: 'credentialCount', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'bool', name: 'exists', type: 'bool' },
        ],
        internalType: 'struct CredentialRegistry.Batch',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' }],
    name: 'batchExistsCheck',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllBatches',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBatchCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Revocation Management
  {
    inputs: [
      { internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' },
      { internalType: 'uint256', name: '_leafIndex', type: 'uint256' },
      { internalType: 'string', name: '_reason', type: 'string' },
    ],
    name: 'revokeCredential',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' },
      { internalType: 'uint256', name: '_leafIndex', type: 'uint256' },
    ],
    name: 'unrevokeCredential',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' },
      { internalType: 'uint256', name: '_leafIndex', type: 'uint256' },
    ],
    name: 'isCredentialRevoked',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' },
      { internalType: 'uint256', name: '_leafIndex', type: 'uint256' },
    ],
    name: 'getRevocationDetails',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'revoked', type: 'bool' },
          { internalType: 'uint256', name: 'revokedAt', type: 'uint256' },
          { internalType: 'string', name: 'reason', type: 'string' },
        ],
        internalType: 'struct CredentialRegistry.RevocationEntry',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' },
      { internalType: 'uint256', name: '_leafIndex', type: 'uint256' },
    ],
    name: 'verifyCredentialStatus',
    outputs: [
      { internalType: 'bool', name: 'exists', type: 'bool' },
      { internalType: 'bool', name: 'revoked', type: 'bool' },
      { internalType: 'bool', name: 'issuerTrusted', type: 'bool' },
      { internalType: 'string', name: 'issuerDID', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'issuerAddress', type: 'address' },
      { indexed: false, internalType: 'string', name: 'did', type: 'string' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
    ],
    name: 'IssuerRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'issuerAddress', type: 'address' },
      { indexed: false, internalType: 'string', name: 'did', type: 'string' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
    ],
    name: 'IssuerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'issuerAddress', type: 'address' },
    ],
    name: 'IssuerRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'issuerAddress', type: 'address' },
    ],
    name: 'IssuerReactivated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'issuer', type: 'address' },
      { indexed: false, internalType: 'string', name: 'issuerDID', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'credentialCount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'BatchAnchored',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
      { indexed: true, internalType: 'uint256', name: 'leafIndex', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'reason', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'CredentialRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
      { indexed: true, internalType: 'uint256', name: 'leafIndex', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'CredentialUnrevoked',
    type: 'event',
  },
] as const;

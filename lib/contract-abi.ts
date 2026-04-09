export const CREDENTIAL_REGISTRY_ABI = [
  // Anchor a batch (stores merkle root)
  {
    inputs: [
      { internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' },
    ],
    name: 'anchorBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // Verify a batch exists and get details
  {
    inputs: [{ internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' }],
    name: 'verify',
    outputs: [
      { internalType: 'bool', name: 'found', type: 'bool' },
      { internalType: 'address', name: 'issuer', type: 'address' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // Check if a batch exists (gas-efficient)
  {
    inputs: [{ internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' }],
    name: 'exists',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Raw packed data access
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'batches',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Event emitted when a batch is anchored
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'issuer', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'BatchAnchored',
    type: 'event',
  },
] as const;

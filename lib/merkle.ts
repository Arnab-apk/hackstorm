import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import type { MerkleTreeData, MerkleProof } from '@/types';

// ===========================================
// MERKLE TREE IMPLEMENTATION
// ===========================================

/**
 * Hash two nodes together (sorted for consistency)
 */
function hashPair(left: string, right: string): string {
  // Sort to ensure deterministic ordering
  const [first, second] = left < right ? [left, right] : [right, left];
  const combined = hexToBytes(first.replace('0x', '') + second.replace('0x', ''));
  return '0x' + bytesToHex(keccak_256(combined));
}

/**
 * Hash a single value
 */
export function hashLeaf(data: string | Uint8Array): string {
  const bytes = typeof data === 'string' 
    ? new TextEncoder().encode(data)
    : data;
  return '0x' + bytesToHex(keccak_256(bytes));
}

/**
 * Build a merkle tree from an array of leaf hashes
 */
export function buildMerkleTree(leaves: string[]): MerkleTreeData {
  if (leaves.length === 0) {
    throw new Error('Cannot build merkle tree with no leaves');
  }

  // Normalize leaves to have 0x prefix
  const normalizedLeaves = leaves.map(leaf => 
    leaf.startsWith('0x') ? leaf : '0x' + leaf
  );

  // Build layers from bottom up
  const layers: string[][] = [normalizedLeaves];

  while (layers[layers.length - 1].length > 1) {
    const currentLayer = layers[layers.length - 1];
    const nextLayer: string[] = [];

    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i];
      // If odd number of nodes, duplicate the last one
      const right = currentLayer[i + 1] || currentLayer[i];
      nextLayer.push(hashPair(left, right));
    }

    layers.push(nextLayer);
  }

  return {
    root: layers[layers.length - 1][0],
    leaves: normalizedLeaves,
    layers,
  };
}

/**
 * Generate a merkle proof for a specific leaf
 */
export function getMerkleProof(tree: MerkleTreeData, leafIndex: number): MerkleProof {
  if (leafIndex < 0 || leafIndex >= tree.leaves.length) {
    throw new Error(`Leaf index ${leafIndex} out of bounds`);
  }

  const proof: string[] = [];
  const directions: ('left' | 'right')[] = [];
  let currentIndex = leafIndex;

  // Traverse from leaf to root
  for (let i = 0; i < tree.layers.length - 1; i++) {
    const layer = tree.layers[i];
    const isRightNode = currentIndex % 2 === 1;
    const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

    if (siblingIndex < layer.length) {
      proof.push(layer[siblingIndex]);
      directions.push(isRightNode ? 'left' : 'right');
    } else {
      // Odd number of nodes, sibling is self (duplicated)
      proof.push(layer[currentIndex]);
      directions.push('right');
    }

    // Move to parent index
    currentIndex = Math.floor(currentIndex / 2);
  }

  return {
    leaf: tree.leaves[leafIndex],
    leafIndex,
    proof,
    directions,
    root: tree.root,
  };
}

/**
 * Verify a merkle proof
 */
export function verifyMerkleProof(
  leaf: string,
  proof: string[],
  directions: ('left' | 'right')[],
  root: string
): boolean {
  if (proof.length !== directions.length) {
    return false;
  }

  let currentHash = leaf.startsWith('0x') ? leaf : '0x' + leaf;

  for (let i = 0; i < proof.length; i++) {
    const sibling = proof[i].startsWith('0x') ? proof[i] : '0x' + proof[i];
    
    if (directions[i] === 'left') {
      currentHash = hashPair(sibling, currentHash);
    } else {
      currentHash = hashPair(currentHash, sibling);
    }
  }

  const normalizedRoot = root.startsWith('0x') ? root : '0x' + root;
  return currentHash.toLowerCase() === normalizedRoot.toLowerCase();
}

/**
 * Compute merkle root from leaves (without storing tree)
 */
export function computeMerkleRoot(leaves: string[]): string {
  const tree = buildMerkleTree(leaves);
  return tree.root;
}

/**
 * Hash credential JSON to create leaf
 */
export function hashCredential(credential: object): string {
  // Canonicalize JSON (sorted keys, no whitespace)
  const canonicalized = JSON.stringify(credential, Object.keys(credential).sort());
  return hashLeaf(canonicalized);
}

/**
 * Convert merkle root to bytes32 format for smart contract
 */
export function toBytes32(hash: string): `0x${string}` {
  const normalized = hash.startsWith('0x') ? hash : '0x' + hash;
  if (normalized.length !== 66) {
    throw new Error('Invalid hash length for bytes32');
  }
  return normalized as `0x${string}`;
}

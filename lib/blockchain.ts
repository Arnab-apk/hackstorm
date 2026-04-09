import { nanoid } from 'nanoid';
import type { Hash } from 'viem';

// ===========================================
// MOCK BLOCKCHAIN LAYER
// Stores anchoring data in MongoDB instead of
// calling the CredentialRegistry smart contract.
// ===========================================

/**
 * Anchor a batch (mock — no on-chain call).
 * Returns a deterministic "tx hash" so the rest of the
 * pipeline (credential signing, DB records) keeps working.
 */
export async function anchorBatch(
  merkleRoot: string,
  _credentialCount: number
): Promise<{ txHash: Hash; blockNumber: number }> {
  // Generate a fake but realistic-looking tx hash
  const fakeHash = `0x${Buffer.from(nanoid(32)).toString('hex').slice(0, 64).padEnd(64, '0')}` as Hash;
  const fakeBlock = Math.floor(Date.now() / 1000);

  return {
    txHash: fakeHash,
    blockNumber: fakeBlock,
  };
}

/**
 * Verify a batch exists — checks MongoDB batches collection.
 */
export async function verifyBatch(merkleRoot: string): Promise<{
  exists: boolean;
  issuer: string;
  timestamp: number;
} | null> {
  // Lazy import to avoid circular deps
  const { getBatchesCollection } = await import('./db');
  const batches = await getBatchesCollection();
  const batch = await batches.findOne({ merkleRoot });

  if (!batch) return null;

  return {
    exists: true,
    issuer: batch.issuerAddress,
    timestamp: new Date(batch.createdAt).getTime() / 1000,
  };
}

/**
 * Check if a batch exists (simple boolean)
 */
export async function batchExists(merkleRoot: string): Promise<boolean> {
  const result = await verifyBatch(merkleRoot);
  return result !== null && result.exists;
}

/**
 * Alias for verifyBatch
 */
export async function verifyBatchOnChain(merkleRoot: string) {
  return verifyBatch(merkleRoot);
}

/**
 * Prepare anchor transaction (mock — returns stub data)
 */
export async function prepareAnchorTransaction(
  merkleRoot: `0x${string}`
): Promise<{ to: `0x${string}`; data: `0x${string}`; chainId: number }> {
  return {
    to: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    data: merkleRoot,
    chainId: 80002,
  };
}

/**
 * Wait for transaction (mock — immediate return)
 */
export async function waitForTransaction(txHash: `0x${string}`): Promise<{ blockNumber: bigint }> {
  return { blockNumber: BigInt(Math.floor(Date.now() / 1000)) };
}


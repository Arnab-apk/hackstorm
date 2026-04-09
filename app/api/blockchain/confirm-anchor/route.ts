/**
 * Confirm Anchor Transaction
 * POST /api/blockchain/confirm-anchor
 * 
 * Called after the issuer signs and broadcasts the anchor transaction.
 * Updates the batch record with the transaction hash.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { waitForTransaction, verifyBatchOnChain } from '@/lib/blockchain';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { errorResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const session = await authenticateRequest(request);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const roleCheck = await requireRole(session.address, 'issuer');
    if (!roleCheck.authorized) {
      return errorResponse('Issuer role required', 403);
    }

    const body = await request.json();
    const { batchId, txHash, merkleRoot } = body;

    if (!batchId || !txHash || !merkleRoot) {
      return errorResponse('batchId, txHash, and merkleRoot are required', 400);
    }

    // Validate tx hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return errorResponse('Invalid transaction hash format', 400);
    }

    const db = await getDatabase();

    // Verify batch exists
    const batch = await db.collection('batches').findOne({ _id: batchId });
    if (!batch) {
      return errorResponse('Batch not found', 404);
    }

    // Wait for transaction confirmation
    let receipt;
    try {
      receipt = await waitForTransaction(txHash as `0x${string}`);
    } catch (error) {
      return errorResponse('Transaction failed or not found', 400);
    }

    // Verify the anchor is on-chain
    const onChainBatch = await verifyBatchOnChain(merkleRoot);
    if (!onChainBatch || onChainBatch.timestamp === BigInt(0)) {
      return errorResponse('Anchor not found on-chain after transaction', 400);
    }

    // Update batch with anchor details
    await db.collection('batches').updateOne(
      { _id: batchId },
      {
        $set: {
          anchorTxHash: txHash,
          anchorBlockNumber: Number(receipt.blockNumber),
          anchorTimestamp: new Date(Number(onChainBatch.timestamp) * 1000),
          anchorStatus: 'confirmed',
        },
      }
    );

    // Update all credentials in this batch
    await db.collection('credentials').updateMany(
      { batchId },
      {
        $set: {
          'credentialJSON.proof.anchorTxHash': txHash,
          'credentialJSON.proof.anchorBlockNumber': Number(receipt.blockNumber),
        },
      }
    );

    return NextResponse.json({
      success: true,
      batchId,
      txHash,
      blockNumber: Number(receipt.blockNumber),
      timestamp: new Date(Number(onChainBatch.timestamp) * 1000).toISOString(),
      message: 'Batch anchored successfully',
    });

  } catch (error) {
    console.error('Confirm anchor error:', error);
    return errorResponse('Failed to confirm anchor', 500);
  }
}

import { NextRequest } from 'next/server';
import { requireIssuer } from '@/lib/auth';
import { 
  successResponse, 
  notFound,
  forbidden,
  handleError 
} from '@/lib/response';
import { 
  getBatchesCollection,
  getCredentialsCollection,
} from '@/lib/db';
import { getSchema } from '@/lib/schemas';
import { getBatch as getBatchFromChain } from '@/lib/blockchain';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/issuer/batches/[id]
 * Get detailed batch information
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireIssuer();
    const { id } = await params;

    // Get batch
    const batchesCollection = await getBatchesCollection();
    const batch = await batchesCollection.findOne({ _id: id });

    if (!batch) {
      return notFound('Batch');
    }

    // Verify issuer owns this batch
    if (batch.issuerAddress.toLowerCase() !== session.address.toLowerCase()) {
      return forbidden('You are not the issuer of this batch');
    }

    // Get credentials in this batch
    const credentialsCollection = await getCredentialsCollection();
    const credentials = await credentialsCollection
      .find({ batchId: id })
      .sort({ leafIndex: 1 })
      .toArray();

    // Get schema
    const schema = getSchema(batch.schemaId);

    // Get on-chain batch info
    let onChainBatch = null;
    try {
      onChainBatch = await getBatchFromChain(batch.merkleRoot);
    } catch {
      // On-chain fetch failed, continue without it
    }

    // Calculate stats
    const stats = {
      total: credentials.length,
      claimed: credentials.filter(c => c.claimed).length,
      unclaimed: credentials.filter(c => !c.claimed).length,
      revoked: credentials.filter(c => c.revoked).length,
      active: credentials.filter(c => !c.revoked).length,
    };

    return successResponse({
      batch: {
        id: batch._id,
        merkleRoot: batch.merkleRoot,
        issuerDID: batch.issuerDID,
        schemaId: batch.schemaId,
        schemaName: schema?.name || batch.schemaId,
        credentialCount: batch.credentialCount,
        txHash: batch.anchorTxHash,
        blockNumber: batch.anchorBlockNumber,
        batchMetadataCID: batch.batchMetadataCID,
        createdAt: batch.createdAt,
      },
      credentials: credentials.map(c => ({
        id: c._id,
        leafIndex: c.leafIndex,
        recipientEmail: c.recipientEmail,
        recipientAddress: c.recipientAddress,
        claimed: c.claimed,
        claimedAt: c.claimedAt,
        revoked: c.revoked,
        revokedAt: c.revokedAt,
        revokedReason: c.revokedReason,
        issuedAt: c.issuedAt,
      })),
      schema,
      stats,
      onChainBatch,
    });
  } catch (error) {
    return handleError(error);
  }
}

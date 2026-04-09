import { NextRequest } from 'next/server';
import { requireIssuer } from '@/lib/auth';
import { 
  successResponse, 
  handleError 
} from '@/lib/response';
import { 
  getBatchesCollection,
  getCredentialsCollection,
} from '@/lib/db';
import { getSchema } from '@/lib/schemas';

/**
 * GET /api/issuer/batches
 * Get all batches created by the current issuer
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireIssuer();
    const { searchParams } = new URL(request.url);

    // Parse query params
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const schemaId = searchParams.get('schemaId');

    // Build filter
    const filter: any = { issuerAddress: session.address.toLowerCase() };

    if (schemaId) {
      filter.schemaId = schemaId;
    }

    // Get batches
    const batchesCollection = await getBatchesCollection();
    const credentialsCollection = await getCredentialsCollection();
    const skip = (page - 1) * pageSize;

    const [batches, total] = await Promise.all([
      batchesCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      batchesCollection.countDocuments(filter),
    ]);

    // Get stats for each batch
    const enrichedBatches = await Promise.all(
      batches.map(async (batch) => {
        const schema = getSchema(batch.schemaId);
        
        const [claimedCount, revokedCount] = await Promise.all([
          credentialsCollection.countDocuments({ 
            batchId: batch._id, 
            claimed: true 
          }),
          credentialsCollection.countDocuments({ 
            batchId: batch._id, 
            revoked: true 
          }),
        ]);

        return {
          id: batch._id,
          merkleRoot: batch.merkleRoot,
          schemaId: batch.schemaId,
          schemaName: schema?.name || batch.schemaId,
          credentialCount: batch.credentialCount,
          claimedCount,
          revokedCount,
          txHash: batch.anchorTxHash,
          blockNumber: batch.anchorBlockNumber,
          createdAt: batch.createdAt,
        };
      })
    );

    return successResponse({
      batches: enrichedBatches,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (error) {
    return handleError(error);
  }
}

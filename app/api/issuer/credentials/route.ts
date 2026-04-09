import { NextRequest } from 'next/server';
import { requireIssuer } from '@/lib/auth';
import { 
  successResponse, 
  handleError 
} from '@/lib/response';
import { 
  getCredentialsCollection, 
  getBatchesCollection,
} from '@/lib/db';
import { getSchema } from '@/lib/schemas';

/**
 * GET /api/issuer/credentials
 * Get all credentials issued by the current issuer
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireIssuer();
    const { searchParams } = new URL(request.url);

    // Parse query params
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status'); // 'active', 'revoked', 'claimed', 'unclaimed'
    const schemaId = searchParams.get('schemaId');
    const batchId = searchParams.get('batchId');

    // Get batches created by this issuer
    const batchesCollection = await getBatchesCollection();
    const issuerBatches = await batchesCollection
      .find({ issuerAddress: session.address.toLowerCase() })
      .toArray();

    const batchIds = issuerBatches.map(b => b._id);

    if (batchIds.length === 0) {
      return successResponse({
        credentials: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
      });
    }

    // Build filter
    const filter: any = { batchId: { $in: batchIds } };

    if (status === 'active') {
      filter.revoked = false;
    } else if (status === 'revoked') {
      filter.revoked = true;
    } else if (status === 'claimed') {
      filter.claimed = true;
    } else if (status === 'unclaimed') {
      filter.claimed = false;
    }

    if (schemaId) {
      filter.schemaId = schemaId;
    }

    if (batchId) {
      filter.batchId = batchId;
    }

    // Get credentials
    const credentialsCollection = await getCredentialsCollection();
    const skip = (page - 1) * pageSize;

    const [credentials, total] = await Promise.all([
      credentialsCollection
        .find(filter)
        .sort({ issuedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      credentialsCollection.countDocuments(filter),
    ]);

    // Enrich with schema info
    const enrichedCredentials = credentials.map(cred => {
      const schema = getSchema(cred.schemaId);
      return {
        ...cred,
        schemaName: schema?.name || cred.schemaId,
      };
    });

    return successResponse({
      credentials: enrichedCredentials,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (error) {
    return handleError(error);
  }
}

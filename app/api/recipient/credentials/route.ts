import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleError } from '@/lib/response';
import { getCredentialsCollection } from '@/lib/db';
import { getSchema } from '@/lib/schemas';

/**
 * GET /api/recipient/credentials
 * Get all credentials for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse query params
    const status = searchParams.get('status'); // 'unclaimed', 'claimed', 'revoked', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Build filter
    const filter: any = { 
      recipientAddress: session.address.toLowerCase() 
    };

    if (status === 'unclaimed') {
      filter.claimed = false;
      filter.revoked = false;
    } else if (status === 'claimed') {
      filter.claimed = true;
      filter.revoked = false;
    } else if (status === 'revoked') {
      filter.revoked = true;
    }
    // 'all' or no status = no additional filter

    // Get credentials
    const credentialsCollection = await getCredentialsCollection();
    const skip = (page - 1) * pageSize;

    const [credentials, total, counts] = await Promise.all([
      credentialsCollection
        .find(filter)
        .sort({ issuedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      credentialsCollection.countDocuments(filter),
      // Get counts for all statuses
      Promise.all([
        credentialsCollection.countDocuments({ 
          recipientAddress: session.address.toLowerCase(),
          claimed: false,
          revoked: false,
        }),
        credentialsCollection.countDocuments({ 
          recipientAddress: session.address.toLowerCase(),
          claimed: true,
          revoked: false,
        }),
        credentialsCollection.countDocuments({ 
          recipientAddress: session.address.toLowerCase(),
          revoked: true,
        }),
      ]),
    ]);

    // Enrich with schema info
    const enrichedCredentials = credentials.map(cred => {
      const schema = getSchema(cred.schemaId);
      return {
        id: cred._id,
        schemaId: cred.schemaId,
        schemaName: schema?.name || cred.schemaId,
        ipfsCID: cred.ipfsCID,
        claimed: cred.claimed,
        claimedAt: cred.claimedAt,
        revoked: cred.revoked,
        revokedAt: cred.revokedAt,
        revokedReason: cred.revokedReason,
        issuedAt: cred.issuedAt,
      };
    });

    return successResponse({
      credentials: enrichedCredentials,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
      counts: {
        unclaimed: counts[0],
        claimed: counts[1],
        revoked: counts[2],
        total: counts[0] + counts[1] + counts[2],
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

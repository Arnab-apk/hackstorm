import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleError } from '@/lib/response';
import { 
  getVerificationRequestsCollection,
  getVerifiersCollection,
} from '@/lib/db';

/**
 * GET /api/recipient/requests
 * Get verification requests targeted at the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse query params
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', 'expired', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Build filter
    const filter: any = { 
      targetAddress: session.address.toLowerCase() 
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    // Get requests
    const requestsCollection = await getVerificationRequestsCollection();
    const verifiersCollection = await getVerifiersCollection();
    const skip = (page - 1) * pageSize;

    const [requests, total, counts] = await Promise.all([
      requestsCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      requestsCollection.countDocuments(filter),
      // Get counts for all statuses
      Promise.all([
        requestsCollection.countDocuments({ 
          targetAddress: session.address.toLowerCase(),
          status: 'pending',
        }),
        requestsCollection.countDocuments({ 
          targetAddress: session.address.toLowerCase(),
          status: 'approved',
        }),
        requestsCollection.countDocuments({ 
          targetAddress: session.address.toLowerCase(),
          status: 'rejected',
        }),
        requestsCollection.countDocuments({ 
          targetAddress: session.address.toLowerCase(),
          status: 'expired',
        }),
      ]),
    ]);

    // Enrich with verifier info
    const enrichedRequests = await Promise.all(
      requests.map(async (req) => {
        const verifier = await verifiersCollection.findOne({ 
          walletAddress: req.verifierId 
        });

        return {
          id: req._id,
          verifier: verifier ? {
            name: verifier.name,
            did: verifier.did,
            type: verifier.type,
            verified: verifier.verified,
          } : {
            name: req.verifierName,
            did: req.verifierDID,
          },
          credentialType: req.credentialType,
          claims: req.claims,
          message: req.message,
          status: req.status,
          createdAt: req.createdAt,
          expiresAt: req.expiresAt,
          respondedAt: req.respondedAt,
          isExpired: new Date() > req.expiresAt,
        };
      })
    );

    return successResponse({
      requests: enrichedRequests,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
      counts: {
        pending: counts[0],
        approved: counts[1],
        rejected: counts[2],
        expired: counts[3],
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

import { requireVerifier } from '@/lib/auth';
import { successResponse, handleError } from '@/lib/response';
import { getVerificationRequestsCollection } from '@/lib/db';

/**
 * GET /api/verifier/stats
 * Get verifier dashboard statistics
 */
export async function GET() {
  try {
    const session = await requireVerifier();

    const requestsCollection = await getVerificationRequestsCollection();

    // Get request stats
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      expiredRequests,
    ] = await Promise.all([
      requestsCollection.countDocuments({ 
        verifierId: session.address.toLowerCase() 
      }),
      requestsCollection.countDocuments({ 
        verifierId: session.address.toLowerCase(),
        status: 'pending',
      }),
      requestsCollection.countDocuments({ 
        verifierId: session.address.toLowerCase(),
        status: 'approved',
      }),
      requestsCollection.countDocuments({ 
        verifierId: session.address.toLowerCase(),
        status: 'rejected',
      }),
      requestsCollection.countDocuments({ 
        verifierId: session.address.toLowerCase(),
        status: 'expired',
      }),
    ]);

    // Calculate approval rate
    const respondedRequests = approvedRequests + rejectedRequests;
    const approvalRate = respondedRequests > 0 
      ? Math.round((approvedRequests / respondedRequests) * 100) 
      : 0;

    // Get recent activity
    const recentRequests = await requestsCollection
      .find({ verifierId: session.address.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const recentActivity = recentRequests.map(req => ({
      type: req.status,
      requestId: req._id,
      targetAddress: req.targetAddress,
      credentialType: req.credentialType,
      timestamp: req.respondedAt || req.createdAt,
    }));

    return successResponse({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      expiredRequests,
      approvalRate,
      recentActivity,
    });
  } catch (error) {
    return handleError(error);
  }
}

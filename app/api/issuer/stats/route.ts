import { requireIssuer } from '@/lib/auth';
import { successResponse, handleError } from '@/lib/response';
import { 
  getBatchesCollection,
  getCredentialsCollection,
} from '@/lib/db';

/**
 * GET /api/issuer/stats
 * Get issuer dashboard statistics
 */
export async function GET() {
  try {
    const session = await requireIssuer();

    const batchesCollection = await getBatchesCollection();
    const credentialsCollection = await getCredentialsCollection();

    // Get all batches for this issuer
    const issuerBatches = await batchesCollection
      .find({ issuerAddress: session.address.toLowerCase() })
      .toArray();

    const batchIds = issuerBatches.map(b => b._id);

    if (batchIds.length === 0) {
      return successResponse({
        totalBatches: 0,
        totalCredentials: 0,
        claimedCredentials: 0,
        unclaimedCredentials: 0,
        revokedCredentials: 0,
        activeCredentials: 0,
        claimRate: 0,
        recentActivity: [],
      });
    }

    // Get credential stats
    const [
      totalCredentials,
      claimedCredentials,
      revokedCredentials,
    ] = await Promise.all([
      credentialsCollection.countDocuments({ batchId: { $in: batchIds } }),
      credentialsCollection.countDocuments({ batchId: { $in: batchIds }, claimed: true }),
      credentialsCollection.countDocuments({ batchId: { $in: batchIds }, revoked: true }),
    ]);

    const unclaimedCredentials = totalCredentials - claimedCredentials;
    const activeCredentials = totalCredentials - revokedCredentials;
    const claimRate = totalCredentials > 0 
      ? Math.round((claimedCredentials / totalCredentials) * 100) 
      : 0;

    // Get recent activity (last 10 credentials issued or revoked)
    const recentCredentials = await credentialsCollection
      .find({ batchId: { $in: batchIds } })
      .sort({ issuedAt: -1 })
      .limit(10)
      .toArray();

    const recentActivity = recentCredentials.map(cred => ({
      type: cred.revoked ? 'revoked' : cred.claimed ? 'claimed' : 'issued',
      credentialId: cred._id,
      recipientEmail: cred.recipientEmail,
      schemaId: cred.schemaId,
      timestamp: cred.revokedAt || cred.claimedAt || cred.issuedAt,
    }));

    return successResponse({
      totalBatches: issuerBatches.length,
      totalCredentials,
      claimedCredentials,
      unclaimedCredentials,
      revokedCredentials,
      activeCredentials,
      claimRate,
      recentActivity,
    });
  } catch (error) {
    return handleError(error);
  }
}

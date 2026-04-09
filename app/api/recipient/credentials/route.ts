import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleError } from '@/lib/response';
import { getCredentialsCollection } from '@/lib/db';
import { getSchema } from '@/lib/schemas';

/**
 * GET /api/recipient/credentials
 * Get all credentials for the current user.
 * Matches by wallet address OR by email (for email-issued credentials).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Match by wallet address OR email
    const ownerMatch: any[] = [
      { recipientAddress: session.address.toLowerCase() },
    ];
    if (session.email) {
      ownerMatch.push({ recipientEmail: session.email.toLowerCase() });
    }

    // Build filter
    const filter: any = { $or: ownerMatch };

    if (status === 'unclaimed') {
      filter.claimed = false;
      filter.revoked = false;
    } else if (status === 'claimed') {
      filter.claimed = true;
      filter.revoked = false;
    } else if (status === 'revoked') {
      filter.revoked = true;
    }

    const credentialsCollection = await getCredentialsCollection();
    const skip = (page - 1) * pageSize;

    // Base owner filter for counts
    const baseFilter = { $or: ownerMatch };

    const [credentials, total, counts] = await Promise.all([
      credentialsCollection
        .find(filter)
        .sort({ issuedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      credentialsCollection.countDocuments(filter),
      Promise.all([
        credentialsCollection.countDocuments({ ...baseFilter, claimed: false, revoked: false }),
        credentialsCollection.countDocuments({ ...baseFilter, claimed: true, revoked: false }),
        credentialsCollection.countDocuments({ ...baseFilter, revoked: true }),
      ]),
    ]);

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

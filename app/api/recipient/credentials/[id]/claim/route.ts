import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { 
  successResponse, 
  notFound,
  forbidden,
  badRequest,
  handleError 
} from '@/lib/response';
import { getCredentialsCollection } from '@/lib/db';
import { fetchFromIPFS } from '@/lib/ipfs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/recipient/credentials/[id]/claim
 * Claim a credential (mark as claimed)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Get credential
    const credentialsCollection = await getCredentialsCollection();
    const credential = await credentialsCollection.findOne({ _id: id });

    if (!credential) {
      return notFound('Credential');
    }

    // Verify ownership (by wallet address or email)
    const isOwner = 
      credential.recipientAddress?.toLowerCase() === session.address.toLowerCase() ||
      (session.email && credential.recipientEmail?.toLowerCase() === session.email.toLowerCase());
    if (!isOwner) {
      return forbidden('This credential does not belong to you');
    }

    // Check if revoked
    if (credential.revoked) {
      return badRequest('Cannot claim a revoked credential');
    }

    // Get credential JSON from MongoDB first, fallback to IPFS
    let credentialJSON: any = credential.credentialJSON || null;
    if (!credentialJSON && credential.ipfsCID) {
      try {
        credentialJSON = await fetchFromIPFS(credential.ipfsCID);
      } catch {
        // continue without it
      }
    }

    // If already claimed, just return the credential
    if (credential.claimed) {
      return successResponse({
        success: true,
        alreadyClaimed: true,
        credential: credentialJSON,
        claimedAt: credential.claimedAt,
      });
    }

    // Mark as claimed
    const claimedAt = new Date();
    await credentialsCollection.updateOne(
      { _id: id },
      {
        $set: {
          claimed: true,
          claimedAt,
        },
      }
    );

    return successResponse({
      success: true,
      alreadyClaimed: false,
      credential: credentialJSON,
      claimedAt,
    });
  } catch (error) {
    return handleError(error);
  }
}

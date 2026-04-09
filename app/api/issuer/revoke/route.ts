import { NextRequest } from 'next/server';
import { requireIssuer } from '@/lib/auth';
import { 
  successResponse, 
  badRequest, 
  notFound,
  handleError 
} from '@/lib/response';
import { 
  getCredentialsCollection, 
  getBatchesCollection,
} from '@/lib/db';
import { notifyCredentialRevoked } from '@/lib/notifications';
import { getSchema } from '@/lib/schemas';
import type { RevokeRequest } from '@/types';

/**
 * POST /api/issuer/revoke
 * Revoke a credential (MongoDB only - no blockchain call)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireIssuer();
    const body: RevokeRequest = await request.json();

    const { credentialId, reason } = body;

    if (!credentialId) {
      return badRequest('Credential ID is required');
    }
    if (!reason) {
      return badRequest('Revocation reason is required');
    }

    // Get credential
    const credentialsCollection = await getCredentialsCollection();
    const credential = await credentialsCollection.findOne({ _id: credentialId });

    if (!credential) {
      return notFound('Credential');
    }

    if (credential.revoked) {
      return badRequest('Credential is already revoked');
    }

    // Get batch to verify ownership
    const batchesCollection = await getBatchesCollection();
    const batch = await batchesCollection.findOne({ _id: credential.batchId });

    if (!batch) {
      return notFound('Batch');
    }

    // Verify issuer owns this batch
    if (batch.issuerAddress.toLowerCase() !== session.address.toLowerCase()) {
      return badRequest('You are not the issuer of this credential');
    }

    // Update database (revocation is now MongoDB-only)
    const revokedAt = new Date();
    await credentialsCollection.updateOne(
      { _id: credentialId },
      {
        $set: {
          revoked: true,
          revokedAt,
          revokedReason: reason,
        },
      }
    );

    // Notify recipient
    const schema = getSchema(credential.schemaId);
    await notifyCredentialRevoked(
      credential.recipientAddress,
      credentialId,
      schema?.name || credential.schemaId,
      reason
    );

    return successResponse({
      success: true,
      credentialId,
      revokedAt: revokedAt.toISOString(),
    });
  } catch (error) {
    return handleError(error);
  }
}

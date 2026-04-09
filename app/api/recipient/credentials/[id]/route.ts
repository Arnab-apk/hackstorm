import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { 
  successResponse, 
  notFound,
  forbidden,
  handleError 
} from '@/lib/response';
import { 
  getCredentialsCollection, 
  getBatchesCollection,
} from '@/lib/db';
import { getSchema } from '@/lib/schemas';
import { fetchFromIPFS } from '@/lib/ipfs';
import { verifyBatch } from '@/lib/blockchain';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/recipient/credentials/[id]
 * Get detailed credential information
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Get credential
    const credentialsCollection = await getCredentialsCollection();
    const credential = await credentialsCollection.findOne({ _id: id });

    if (!credential) {
      return notFound('Credential');
    }

    // Verify ownership
    if (credential.recipientAddress.toLowerCase() !== session.address.toLowerCase()) {
      return forbidden('This credential does not belong to you');
    }

    // Get batch
    const batchesCollection = await getBatchesCollection();
    const batch = await batchesCollection.findOne({ _id: credential.batchId });

    // Get schema
    const schema = getSchema(credential.schemaId);

    // Fetch full credential from IPFS
    let credentialJSON = null;
    try {
      credentialJSON = await fetchFromIPFS(credential.ipfsCID);
    } catch {
      // IPFS fetch failed, continue without it
    }

    // Verify on-chain status (simplified - only checks if anchored)
    let verification = null;
    if (batch) {
      try {
        const onChainData = await verifyBatch(batch.merkleRoot);
        verification = {
          exists: onChainData !== null && onChainData.exists,
          revoked: credential.revoked, // Revocation is now MongoDB-only
          issuerAddress: onChainData?.issuer || null,
          timestamp: onChainData?.timestamp || null,
        };
      } catch {
        // On-chain verification failed, continue without it
      }
    }

    return successResponse({
      credential: {
        id: credential._id,
        schemaId: credential.schemaId,
        schemaName: schema?.name || credential.schemaId,
        ipfsCID: credential.ipfsCID,
        claimed: credential.claimed,
        claimedAt: credential.claimedAt,
        revoked: credential.revoked,
        revokedAt: credential.revokedAt,
        revokedReason: credential.revokedReason,
        issuedAt: credential.issuedAt,
      },
      credentialJSON,
      schema,
      verification,
      batch: batch ? {
        merkleRoot: batch.merkleRoot,
        txHash: batch.anchorTxHash,
        issuerDID: batch.issuerDID,
      } : null,
    });
  } catch (error) {
    return handleError(error);
  }
}

import { NextRequest } from 'next/server';
import { requireIssuer } from '@/lib/auth';
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
 * GET /api/issuer/credentials/[id]
 * Get detailed credential information
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireIssuer();
    const { id } = await params;

    // Get credential
    const credentialsCollection = await getCredentialsCollection();
    const credential = await credentialsCollection.findOne({ _id: id });

    if (!credential) {
      return notFound('Credential');
    }

    // Get batch
    const batchesCollection = await getBatchesCollection();
    const batch = await batchesCollection.findOne({ _id: credential.batchId });

    if (!batch) {
      return notFound('Batch');
    }

    // Verify issuer owns this credential
    if (batch.issuerAddress.toLowerCase() !== session.address.toLowerCase()) {
      return forbidden('You are not the issuer of this credential');
    }

    // Get schema
    const schema = getSchema(credential.schemaId);

    // Get credential JSON — prefer MongoDB, fallback to IPFS
    let credentialJSON: any = credential.credentialJSON || null;
    if (!credentialJSON && credential.ipfsCID) {
      try {
        credentialJSON = await fetchFromIPFS(credential.ipfsCID);
      } catch {
        // IPFS fetch failed, continue without it
      }
    }

    // Verify on-chain status (simplified - only checks if anchored)
    let onChainStatus = null;
    try {
      const onChainData = await verifyBatch(batch.merkleRoot);
      onChainStatus = {
        exists: onChainData !== null && onChainData.exists,
        revoked: credential.revoked, // Revocation is now MongoDB-only
        issuerAddress: onChainData?.issuer || null,
        timestamp: onChainData?.timestamp || null,
      };
    } catch {
      // On-chain verification failed, continue without it
    }

    return successResponse({
      credential: {
        ...credential,
        schemaName: schema?.name || credential.schemaId,
      },
      batch: {
        id: batch._id,
        merkleRoot: batch.merkleRoot,
        txHash: batch.anchorTxHash,
        blockNumber: batch.anchorBlockNumber,
        credentialCount: batch.credentialCount,
        createdAt: batch.createdAt,
      },
      schema,
      credentialJSON,
      onChainStatus,
    });
  } catch (error) {
    return handleError(error);
  }
}

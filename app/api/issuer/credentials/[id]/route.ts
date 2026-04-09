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
import { verifyCredentialStatus } from '@/lib/blockchain';

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

    // Fetch full credential from IPFS
    let credentialJSON = null;
    try {
      credentialJSON = await fetchFromIPFS(credential.ipfsCID);
    } catch {
      // IPFS fetch failed, continue without it
    }

    // Verify on-chain status
    let onChainStatus = null;
    try {
      onChainStatus = await verifyCredentialStatus(
        batch.merkleRoot,
        credential.leafIndex
      );
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

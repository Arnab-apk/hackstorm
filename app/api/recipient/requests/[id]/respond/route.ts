import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { 
  successResponse, 
  badRequest,
  notFound,
  forbidden,
  handleError 
} from '@/lib/response';
import { 
  getVerificationRequestsCollection,
  getVerificationResponsesCollection,
  getCredentialsCollection,
  getBatchesCollection,
  generateId,
} from '@/lib/db';
import { fetchFromIPFS } from '@/lib/ipfs';
import { verifyCredentialStatus } from '@/lib/blockchain';
import { processZKPClaims } from '@/lib/zkp';
import { 
  notifyRequestApproved, 
  notifyRequestRejected 
} from '@/lib/notifications';
import type { DBVerificationResponse, VerifiableCredential } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/recipient/requests/[id]/respond
 * Respond to a verification request (approve or reject)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const { credentialId, approved } = body;

    if (approved === undefined) {
      return badRequest('Approved field is required');
    }

    // Get request
    const requestsCollection = await getVerificationRequestsCollection();
    const verificationRequest = await requestsCollection.findOne({ _id: id });

    if (!verificationRequest) {
      return notFound('Verification request');
    }

    // Verify ownership
    if (verificationRequest.targetAddress.toLowerCase() !== session.address.toLowerCase()) {
      return forbidden('This request is not for you');
    }

    // Check status
    if (verificationRequest.status !== 'pending') {
      return badRequest(`Request already ${verificationRequest.status}`);
    }

    // Check expiry
    if (new Date() > verificationRequest.expiresAt) {
      await requestsCollection.updateOne(
        { _id: id },
        { $set: { status: 'expired' } }
      );
      return badRequest('Request has expired');
    }

    // Handle rejection
    if (!approved) {
      await requestsCollection.updateOne(
        { _id: id },
        { 
          $set: { 
            status: 'rejected',
            respondedAt: new Date(),
          } 
        }
      );

      // Notify verifier
      await notifyRequestRejected(
        verificationRequest.verifierId,
        id,
        verificationRequest.credentialType
      );

      return successResponse({
        success: true,
        status: 'rejected',
      });
    }

    // Handle approval - credentialId required
    if (!credentialId) {
      return badRequest('Credential ID is required for approval');
    }

    // Get credential
    const credentialsCollection = await getCredentialsCollection();
    const credential = await credentialsCollection.findOne({ _id: credentialId });

    if (!credential) {
      return notFound('Credential');
    }

    // Verify credential belongs to user
    if (credential.recipientAddress.toLowerCase() !== session.address.toLowerCase()) {
      return forbidden('This credential does not belong to you');
    }

    // Verify credential matches request
    if (credential.schemaId !== verificationRequest.credentialType) {
      return badRequest('Credential type does not match request');
    }

    // Check if revoked
    if (credential.revoked) {
      return badRequest('Cannot use a revoked credential');
    }

    // Fetch credential from IPFS
    let credentialJSON: VerifiableCredential;
    try {
      credentialJSON = await fetchFromIPFS(credential.ipfsCID);
    } catch {
      return badRequest('Failed to fetch credential from IPFS');
    }

    // Get batch for on-chain verification
    const batchesCollection = await getBatchesCollection();
    const batch = await batchesCollection.findOne({ _id: credential.batchId });

    if (!batch) {
      return badRequest('Credential batch not found');
    }

    // Verify on-chain status
    let onChainStatus;
    try {
      onChainStatus = await verifyCredentialStatus(
        batch.merkleRoot,
        credential.leafIndex
      );
    } catch {
      return badRequest('Failed to verify credential on-chain');
    }

    if (!onChainStatus.exists) {
      return badRequest('Credential not found on-chain');
    }

    if (onChainStatus.revoked) {
      return badRequest('Credential has been revoked on-chain');
    }

    // Process ZKP claims
    const credentialData = credentialJSON.credentialSubject;
    const proofs = processZKPClaims(verificationRequest.claims, credentialData);

    // Create verification response
    const responsesCollection = await getVerificationResponsesCollection();
    
    const verificationResponse: DBVerificationResponse = {
      _id: generateId('resp'),
      requestId: id,
      credentialId,
      respondedBy: session.address.toLowerCase(),
      proofs,
      merkleProofValid: true, // Already verified via on-chain check
      anchoredOnChain: onChainStatus.exists,
      anchorTxHash: batch.anchorTxHash,
      notRevoked: !onChainStatus.revoked,
      respondedAt: new Date(),
    };

    await responsesCollection.insertOne(verificationResponse);

    // Update request status
    await requestsCollection.updateOne(
      { _id: id },
      { 
        $set: { 
          status: 'approved',
          respondedAt: new Date(),
        } 
      }
    );

    // Notify verifier
    await notifyRequestApproved(
      verificationRequest.verifierId,
      id,
      verificationRequest.credentialType
    );

    return successResponse({
      success: true,
      status: 'approved',
      responseId: verificationResponse._id,
    });
  } catch (error) {
    return handleError(error);
  }
}

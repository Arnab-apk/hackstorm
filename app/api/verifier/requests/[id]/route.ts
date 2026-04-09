import { NextRequest } from 'next/server';
import { requireVerifier } from '@/lib/auth';
import { 
  successResponse, 
  notFound,
  forbidden,
  handleError 
} from '@/lib/response';
import { 
  getVerificationRequestsCollection,
  getVerificationResponsesCollection,
} from '@/lib/db';
import { getSchema } from '@/lib/schemas';
import { getClaimDescription } from '@/lib/zkp';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/verifier/requests/[id]
 * Get detailed verification request information including response
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireVerifier();
    const { id } = await params;

    // Get request
    const requestsCollection = await getVerificationRequestsCollection();
    const verificationRequest = await requestsCollection.findOne({ _id: id });

    if (!verificationRequest) {
      return notFound('Verification request');
    }

    // Verify ownership
    if (verificationRequest.verifierId.toLowerCase() !== session.address.toLowerCase()) {
      return forbidden('This request does not belong to you');
    }

    // Get schema
    const schema = getSchema(verificationRequest.credentialType);

    // Format claims with descriptions
    const formattedClaims = verificationRequest.claims.map(claim => ({
      ...claim,
      description: getClaimDescription(claim),
    }));

    // Get response if approved
    let response = null;
    if (verificationRequest.status === 'approved') {
      const responsesCollection = await getVerificationResponsesCollection();
      const dbResponse = await responsesCollection.findOne({ requestId: id });
      
      if (dbResponse) {
        response = {
          id: dbResponse._id,
          proofs: dbResponse.proofs.map(proof => ({
            claim: {
              ...proof.claim,
              description: getClaimDescription(proof.claim),
            },
            result: proof.result,
            revealedValue: proof.revealedValue,
          })),
          verification: {
            merkleProofValid: dbResponse.merkleProofValid,
            anchoredOnChain: dbResponse.anchoredOnChain,
            anchorTxHash: dbResponse.anchorTxHash,
            notRevoked: dbResponse.notRevoked,
          },
          respondedAt: dbResponse.respondedAt,
        };
      }
    }

    return successResponse({
      request: {
        id: verificationRequest._id,
        targetAddress: verificationRequest.targetAddress,
        credentialType: verificationRequest.credentialType,
        credentialTypeName: schema?.name || verificationRequest.credentialType,
        claims: formattedClaims,
        message: verificationRequest.message,
        status: verificationRequest.status,
        createdAt: verificationRequest.createdAt,
        expiresAt: verificationRequest.expiresAt,
        respondedAt: verificationRequest.respondedAt,
        isExpired: new Date() > verificationRequest.expiresAt,
      },
      response,
      schema,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/verifier/requests/[id]
 * Cancel a pending verification request
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireVerifier();
    const { id } = await params;

    // Get request
    const requestsCollection = await getVerificationRequestsCollection();
    const verificationRequest = await requestsCollection.findOne({ _id: id });

    if (!verificationRequest) {
      return notFound('Verification request');
    }

    // Verify ownership
    if (verificationRequest.verifierId.toLowerCase() !== session.address.toLowerCase()) {
      return forbidden('This request does not belong to you');
    }

    // Can only cancel pending requests
    if (verificationRequest.status !== 'pending') {
      return forbidden('Can only cancel pending requests');
    }

    // Delete the request
    await requestsCollection.deleteOne({ _id: id });

    return successResponse({
      success: true,
      message: 'Request cancelled successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}

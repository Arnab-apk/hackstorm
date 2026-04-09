import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { 
  successResponse, 
  notFound,
  forbidden,
  handleError 
} from '@/lib/response';
import { 
  getVerificationRequestsCollection,
  getVerifiersCollection,
  getCredentialsCollection,
} from '@/lib/db';
import { getSchema } from '@/lib/schemas';
import { getClaimDescription } from '@/lib/zkp';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/recipient/requests/[id]
 * Get detailed verification request information
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

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

    // Get verifier info
    const verifiersCollection = await getVerifiersCollection();
    const verifier = await verifiersCollection.findOne({ 
      walletAddress: verificationRequest.verifierId 
    });

    // Get matching credentials for this user
    const credentialsCollection = await getCredentialsCollection();
    const matchingCredentials = await credentialsCollection
      .find({
        recipientAddress: session.address.toLowerCase(),
        schemaId: verificationRequest.credentialType,
        revoked: false,
      })
      .toArray();

    // Enrich credentials with schema info
    const schema = getSchema(verificationRequest.credentialType);
    const enrichedCredentials = matchingCredentials.map(cred => ({
      id: cred._id,
      schemaId: cred.schemaId,
      schemaName: schema?.name || cred.schemaId,
      claimed: cred.claimed,
      issuedAt: cred.issuedAt,
    }));

    // Format claims with descriptions
    const formattedClaims = verificationRequest.claims.map(claim => ({
      ...claim,
      description: getClaimDescription(claim),
    }));

    return successResponse({
      request: {
        id: verificationRequest._id,
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
      verifier: verifier ? {
        name: verifier.name,
        did: verifier.did,
        type: verifier.type,
        website: verifier.website,
        verified: verifier.verified,
      } : {
        name: verificationRequest.verifierName,
        did: verificationRequest.verifierDID,
      },
      matchingCredentials: enrichedCredentials,
      schema,
    });
  } catch (error) {
    return handleError(error);
  }
}

import { NextRequest } from 'next/server';
import { requireVerifier, predictAddressFromEmail } from '@/lib/auth';
import { 
  successResponse, 
  badRequest,
  notFound,
  handleError 
} from '@/lib/response';
import { 
  getVerifiersCollection,
  getVerificationRequestsCollection,
  generateId,
} from '@/lib/db';
import { isValidSchemaId, getSchema } from '@/lib/schemas';
import { validateClaims } from '@/lib/zkp';
import { notifyVerificationRequest } from '@/lib/notifications';
import type { CreateVerificationRequest, DBVerificationRequest } from '@/types';

/**
 * POST /api/verifier/requests
 * Create a new verification request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireVerifier();
    const body: CreateVerificationRequest = await request.json();

    const { 
      targetAddress, 
      targetEmail, 
      credentialType, 
      claims, 
      message,
      expiresInDays = 7 
    } = body;

    // Validate target
    if (!targetAddress && !targetEmail) {
      return badRequest('Either targetAddress or targetEmail is required');
    }

    // Validate credential type
    if (!credentialType) {
      return badRequest('Credential type is required');
    }
    if (!isValidSchemaId(credentialType)) {
      return badRequest(`Invalid credential type: ${credentialType}`);
    }

    // Validate claims
    if (!claims || !Array.isArray(claims) || claims.length === 0) {
      return badRequest('At least one claim is required');
    }

    const claimsValidation = validateClaims(claims);
    if (!claimsValidation.valid) {
      return badRequest(`Invalid claims: ${claimsValidation.errors.join(', ')}`);
    }

    // Get verifier profile
    const verifiersCollection = await getVerifiersCollection();
    const verifier = await verifiersCollection.findOne({ 
      walletAddress: session.address.toLowerCase() 
    });

    if (!verifier) {
      return notFound('Please register as a verifier first');
    }

    // Determine target address
    let finalTargetAddress: string;
    if (targetAddress) {
      finalTargetAddress = targetAddress.toLowerCase();
    } else {
      finalTargetAddress = await predictAddressFromEmail(targetEmail!);
    }

    // Create expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create request
    const requestsCollection = await getVerificationRequestsCollection();
    
    const verificationRequest: DBVerificationRequest = {
      _id: generateId('req'),
      verifierId: session.address.toLowerCase(),
      verifierDID: session.did,
      verifierName: verifier.name,
      targetAddress: finalTargetAddress,
      credentialType,
      claims,
      message: message || '',
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
      respondedAt: null,
    };

    await requestsCollection.insertOne(verificationRequest);

    // Notify target user
    const schema = getSchema(credentialType);
    await notifyVerificationRequest(
      finalTargetAddress,
      verificationRequest._id,
      verifier.name,
      schema?.name || credentialType
    );

    return successResponse({
      success: true,
      request: {
        id: verificationRequest._id,
        targetAddress: finalTargetAddress,
        credentialType,
        claims,
        status: verificationRequest.status,
        expiresAt: verificationRequest.expiresAt,
        createdAt: verificationRequest.createdAt,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/verifier/requests
 * Get all verification requests created by this verifier
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireVerifier();
    const { searchParams } = new URL(request.url);

    // Parse query params
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', 'expired', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Build filter
    const filter: any = { 
      verifierId: session.address.toLowerCase() 
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    // Get requests
    const requestsCollection = await getVerificationRequestsCollection();
    const skip = (page - 1) * pageSize;

    const [requests, total, counts] = await Promise.all([
      requestsCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      requestsCollection.countDocuments(filter),
      // Get counts for all statuses
      Promise.all([
        requestsCollection.countDocuments({ 
          verifierId: session.address.toLowerCase(),
          status: 'pending',
        }),
        requestsCollection.countDocuments({ 
          verifierId: session.address.toLowerCase(),
          status: 'approved',
        }),
        requestsCollection.countDocuments({ 
          verifierId: session.address.toLowerCase(),
          status: 'rejected',
        }),
        requestsCollection.countDocuments({ 
          verifierId: session.address.toLowerCase(),
          status: 'expired',
        }),
      ]),
    ]);

    // Enrich with schema info
    const enrichedRequests = requests.map(req => {
      const schema = getSchema(req.credentialType);
      return {
        id: req._id,
        targetAddress: req.targetAddress,
        credentialType: req.credentialType,
        credentialTypeName: schema?.name || req.credentialType,
        claimCount: req.claims.length,
        status: req.status,
        createdAt: req.createdAt,
        expiresAt: req.expiresAt,
        respondedAt: req.respondedAt,
        isExpired: new Date() > req.expiresAt,
      };
    });

    return successResponse({
      requests: enrichedRequests,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
      counts: {
        pending: counts[0],
        approved: counts[1],
        rejected: counts[2],
        expired: counts[3],
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

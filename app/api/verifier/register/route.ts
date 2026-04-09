import { NextRequest } from 'next/server';
import { requireVerifier } from '@/lib/auth';
import { 
  successResponse, 
  badRequest,
  conflict,
  handleError 
} from '@/lib/response';
import { getVerifiersCollection, generateId } from '@/lib/db';
import type { RegisterVerifierRequest, DBVerifier } from '@/types';

/**
 * POST /api/verifier/register
 * Register as a verifier
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireVerifier();
    const body: RegisterVerifierRequest = await request.json();

    const { name, type, website, logo } = body;

    if (!name) {
      return badRequest('Name is required');
    }
    if (!type) {
      return badRequest('Type is required');
    }

    const validTypes = ['employer', 'university', 'government', 'service', 'other'];
    if (!validTypes.includes(type)) {
      return badRequest(`Type must be one of: ${validTypes.join(', ')}`);
    }

    // Check if already registered
    const verifiersCollection = await getVerifiersCollection();
    const existing = await verifiersCollection.findOne({ 
      walletAddress: session.address.toLowerCase() 
    });

    if (existing) {
      return conflict('Already registered as a verifier');
    }

    // Create verifier record
    const verifier: DBVerifier = {
      _id: generateId('verifier'),
      walletAddress: session.address.toLowerCase(),
      did: session.did,
      name,
      type,
      website: website || null,
      logo: logo || null,
      verified: false, // Manual verification by admin
      createdAt: new Date(),
    };

    await verifiersCollection.insertOne(verifier);

    return successResponse({
      success: true,
      verifier: {
        id: verifier._id,
        did: verifier.did,
        name: verifier.name,
        type: verifier.type,
        website: verifier.website,
        verified: verifier.verified,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

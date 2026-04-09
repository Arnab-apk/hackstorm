import { NextRequest } from 'next/server';
import { requireVerifier } from '@/lib/auth';
import { 
  successResponse, 
  badRequest,
  notFound,
  handleError 
} from '@/lib/response';
import { getVerifiersCollection } from '@/lib/db';

/**
 * GET /api/verifier/profile
 * Get current verifier's profile
 */
export async function GET() {
  try {
    const session = await requireVerifier();

    const verifiersCollection = await getVerifiersCollection();
    const verifier = await verifiersCollection.findOne({ 
      walletAddress: session.address.toLowerCase() 
    });

    if (!verifier) {
      return notFound('Verifier profile not found. Please register first.');
    }

    return successResponse({
      id: verifier._id,
      did: verifier.did,
      name: verifier.name,
      type: verifier.type,
      website: verifier.website,
      logo: verifier.logo,
      verified: verifier.verified,
      createdAt: verifier.createdAt,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/verifier/profile
 * Update verifier profile
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireVerifier();
    const body = await request.json();

    const { name, type, website, logo } = body;

    const verifiersCollection = await getVerifiersCollection();
    const verifier = await verifiersCollection.findOne({ 
      walletAddress: session.address.toLowerCase() 
    });

    if (!verifier) {
      return notFound('Verifier profile not found. Please register first.');
    }

    // Validate type if provided
    if (type) {
      const validTypes = ['employer', 'university', 'government', 'service', 'other'];
      if (!validTypes.includes(type)) {
        return badRequest(`Type must be one of: ${validTypes.join(', ')}`);
      }
    }

    // Build update
    const update: any = {};
    if (name) update.name = name;
    if (type) update.type = type;
    if (website !== undefined) update.website = website || null;
    if (logo !== undefined) update.logo = logo || null;

    if (Object.keys(update).length === 0) {
      return badRequest('No fields to update');
    }

    await verifiersCollection.updateOne(
      { _id: verifier._id },
      { $set: update }
    );

    return successResponse({
      success: true,
      updated: update,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Public Issuer Lookup API
 * GET /api/verify/issuer/[address]
 * 
 * Look up issuer details from MongoDB registry.
 * Publicly accessible.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIssuersCollection } from '@/lib/db';
import { errorResponse } from '@/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return errorResponse('Issuer address is required', 400);
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return errorResponse('Invalid Ethereum address format', 400);
    }

    // Look up issuer in MongoDB
    const issuersCollection = await getIssuersCollection();
    const issuer = await issuersCollection.findOne({ 
      address: address.toLowerCase() 
    });

    if (!issuer) {
      return NextResponse.json({
        address,
        trusted: false,
        details: null,
        message: 'Issuer is not registered in the trusted registry',
      });
    }

    return NextResponse.json({
      address,
      trusted: issuer.active,
      details: {
        did: issuer.did,
        name: issuer.name,
        active: issuer.active,
        registeredAt: issuer.registeredAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Issuer lookup error:', error);
    return errorResponse('Failed to lookup issuer', 500);
  }
}

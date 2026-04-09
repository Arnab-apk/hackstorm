/**
 * Public Issuer Lookup API
 * GET /api/verify/issuer/[address]
 * 
 * Look up issuer details from the on-chain registry.
 * Publicly accessible.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isIssuerTrusted, getIssuerDetails } from '@/lib/blockchain';
import { errorResponse } from '@/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return errorResponse('Issuer address is required', 400);
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return errorResponse('Invalid Ethereum address format', 400);
    }

    // Check if issuer is trusted
    const trusted = await isIssuerTrusted(address);

    if (!trusted) {
      return NextResponse.json({
        address,
        trusted: false,
        details: null,
        message: 'Issuer is not registered in the trusted registry',
      });
    }

    // Get issuer details
    const details = await getIssuerDetails(address);

    return NextResponse.json({
      address,
      trusted: true,
      details: {
        did: details.did,
        name: details.name,
        active: details.active,
        registeredAt: new Date(Number(details.registeredAt) * 1000).toISOString(),
      },
    });

  } catch (error) {
    console.error('Issuer lookup error:', error);
    return errorResponse('Failed to lookup issuer', 500);
  }
}

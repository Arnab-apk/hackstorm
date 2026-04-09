/**
 * Predict Wallet Address from Email
 * POST /api/utils/predict-address
 * 
 * Uses Web3Auth to predict the wallet address for an email.
 * Used by issuer when creating credentials.
 */

import { NextRequest, NextResponse } from 'next/server';
import { predictAddressFromEmail, predictAddressesFromEmails } from '@/lib/auth';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { errorResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    // Only issuers can predict addresses
    const session = await authenticateRequest(request);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const roleCheck = await requireRole(session.address, 'issuer');
    if (!roleCheck.authorized) {
      return errorResponse('Issuer role required', 403);
    }

    const body = await request.json();
    const { email, emails } = body;

    // Single email prediction
    if (email && typeof email === 'string') {
      const address = await predictAddressFromEmail(email);
      const did = `did:pkh:eip155:137:${address}`;

      return NextResponse.json({
        email,
        address,
        did,
      });
    }

    // Batch email prediction
    if (emails && Array.isArray(emails)) {
      if (emails.length > 1000) {
        return errorResponse('Maximum 1000 emails per batch', 400);
      }

      const predictions = await predictAddressesFromEmails(emails);

      return NextResponse.json({
        predictions: predictions.map(p => ({
          email: p.email,
          address: p.address,
          did: `did:pkh:eip155:137:${p.address}`,
        })),
        count: predictions.length,
      });
    }

    return errorResponse('Either email or emails array is required', 400);

  } catch (error) {
    console.error('Address prediction error:', error);
    return errorResponse('Failed to predict address', 500);
  }
}

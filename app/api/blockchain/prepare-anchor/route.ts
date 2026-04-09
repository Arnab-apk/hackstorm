/**
 * Prepare Anchor Transaction
 * POST /api/blockchain/prepare-anchor
 * 
 * Prepares an unsigned transaction for anchoring a merkle root.
 * The issuer will sign this with MetaMask on the frontend.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prepareAnchorTransaction } from '@/lib/blockchain';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { errorResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const session = await authenticateRequest(request);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const roleCheck = await requireRole(session.address, 'issuer');
    if (!roleCheck.authorized) {
      return errorResponse('Issuer role required', 403);
    }

    const body = await request.json();
    const { merkleRoot, credentialCount } = body;

    if (!merkleRoot || typeof merkleRoot !== 'string') {
      return errorResponse('merkleRoot is required', 400);
    }

    if (!credentialCount || typeof credentialCount !== 'number') {
      return errorResponse('credentialCount is required', 400);
    }

    // Validate merkle root format (32 bytes hex)
    if (!/^0x[a-fA-F0-9]{64}$/.test(merkleRoot)) {
      return errorResponse('Invalid merkleRoot format (expected 32 bytes hex)', 400);
    }

    const txData = await prepareAnchorTransaction(
      merkleRoot as `0x${string}`,
      credentialCount
    );

    return NextResponse.json({
      transaction: {
        to: txData.to,
        data: txData.data,
        chainId: txData.chainId,
      },
      merkleRoot,
      credentialCount,
      message: 'Sign this transaction with MetaMask to anchor the batch',
    });

  } catch (error) {
    console.error('Prepare anchor error:', error);
    return errorResponse('Failed to prepare transaction', 500);
  }
}

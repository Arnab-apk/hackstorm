/**
 * Revocation Status Check API
 * GET /api/verify/revocation-status
 * 
 * Check if a specific credential is revoked by merkle root and leaf index.
 * Publicly accessible.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { errorResponse } from '@/lib/response';
import type { CredentialDocument } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merkleRoot = searchParams.get('merkleRoot');
    const leafIndex = searchParams.get('leafIndex');
    const credentialId = searchParams.get('credentialId');

    // Must provide either credentialId OR (merkleRoot + leafIndex)
    if (!credentialId && (!merkleRoot || leafIndex === null)) {
      return errorResponse(
        'Either credentialId or (merkleRoot + leafIndex) is required',
        400
      );
    }

    const db = await getDatabase();
    let credential: CredentialDocument | null = null;

    if (credentialId) {
      // Find by credential ID
      credential = await db.collection<CredentialDocument>('credentials').findOne({
        _id: credentialId,
      });
    } else {
      // Find by merkle root and leaf index
      // First find the batch
      const batch = await db.collection('batches').findOne({
        merkleRoot: merkleRoot,
      });

      if (batch) {
        credential = await db.collection<CredentialDocument>('credentials').findOne({
          batchId: String(batch._id),
          leafIndex: parseInt(leafIndex!, 10),
        });
      }
    }

    if (!credential) {
      return NextResponse.json({
        found: false,
        revoked: null,
        message: 'Credential not found in registry',
      });
    }

    return NextResponse.json({
      found: true,
      credentialId: credential._id,
      revoked: credential.revoked,
      revokedAt: credential.revokedAt || null,
      revokedReason: credential.revokedReason || null,
    });

  } catch (error) {
    console.error('Revocation status check error:', error);
    return errorResponse('Failed to check revocation status', 500);
  }
}

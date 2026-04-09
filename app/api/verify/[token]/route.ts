/**
 * Public Share Token Verification API
 * GET /api/verify/[token]
 * 
 * Publicly accessible endpoint for verifying shared credentials.
 * No authentication required - anyone with the token can verify.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getIssuersCollection } from '@/lib/db';
import { fetchFromIPFS } from '@/lib/ipfs';
import { verifyMerkleProof } from '@/lib/merkle';
import { verifyBatch } from '@/lib/blockchain';
import { errorResponse } from '@/lib/response';
import type { ShareToken, CredentialDocument, VerifiableCredential } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return errorResponse('Share token is required', 400);
    }

    const db = await getDatabase();

    // 1. Find share token
    const shareToken = await db.collection<ShareToken>('share_tokens').findOne({
      _id: token,
    });

    if (!shareToken) {
      return errorResponse('Share token not found', 404);
    }

    // 2. Check expiration
    if (shareToken.expiresAt && new Date(shareToken.expiresAt) < new Date()) {
      return errorResponse('Share link has expired', 410);
    }

    // 3. Check max views
    if (shareToken.maxViews && shareToken.currentViews >= shareToken.maxViews) {
      return errorResponse('Share link has reached maximum views', 410);
    }

    // 4. Find credential
    const credential = await db.collection<CredentialDocument>('credentials').findOne({
      _id: shareToken.credentialId,
    });

    if (!credential) {
      return errorResponse('Credential not found', 404);
    }

    // 5. Check revocation (from MongoDB)
    if (credential.revoked) {
      return NextResponse.json({
        valid: false,
        reason: 'Credential has been revoked',
        revokedAt: credential.revokedAt,
        shareInfo: {
          createdAt: shareToken.createdAt,
          expiresAt: shareToken.expiresAt,
          viewCount: shareToken.currentViews + 1,
        },
      });
    }

    // 6. Fetch full credential from IPFS
    let fullCredential: VerifiableCredential;
    try {
      fullCredential = await fetchFromIPFS<VerifiableCredential>(credential.ipfsCID);
    } catch {
      return errorResponse('Failed to fetch credential from IPFS', 500);
    }

    const proof = fullCredential.proof;
    if (!proof) {
      return errorResponse('Invalid credential structure - missing proof', 400);
    }

    // 7. Verify merkle proof
    const merkleValid = verifyMerkleProof(
      credential.leafHash,
      proof.merkleProof,
      proof.proofDirections,
      proof.merkleRoot
    );

    // 8. Verify on-chain anchor (only checks merkle root exists)
    let onChainValid = false;
    let anchorDetails = null;
    try {
      const batchData = await verifyBatch(proof.merkleRoot);
      onChainValid = batchData !== null && batchData.exists;
      if (batchData) {
        anchorDetails = {
          txHash: proof.anchorTransactionHash,
          timestamp: batchData.timestamp,
          issuerAddress: batchData.issuer,
        };
      }
    } catch (error) {
      console.error('On-chain verification failed:', error);
    }

    // 9. Verify issuer is trusted (from MongoDB)
    let issuerTrusted = false;
    let issuerDetails = null;
    try {
      const issuerAddress = anchorDetails?.issuerAddress;
      if (issuerAddress) {
        const issuersCollection = await getIssuersCollection();
        const issuer = await issuersCollection.findOne({ 
          address: issuerAddress.toLowerCase() 
        });
        if (issuer && issuer.active) {
          issuerTrusted = true;
          issuerDetails = {
            did: issuer.did,
            name: issuer.name,
          };
        }
      }
    } catch (error) {
      console.error('Issuer verification failed:', error);
    }

    // 10. Apply disclosure mask
    const disclosedSubject: Record<string, any> = {};
    const credentialSubject = fullCredential.credentialSubject;

    for (const [key, value] of Object.entries(credentialSubject)) {
      if (key === 'id') {
        disclosedSubject[key] = value;
      } else if (shareToken.disclosedFields.includes(key)) {
        disclosedSubject[key] = value;
      } else if (shareToken.hiddenFields.includes(key)) {
        disclosedSubject[key] = '••••••••';
      }
    }

    // 11. Increment view count
    await db.collection<ShareToken>('share_tokens').updateOne(
      { _id: token },
      { $inc: { currentViews: 1 } }
    );

    // 12. Build response
    const isValid = merkleValid && onChainValid && issuerTrusted && !credential.revoked;

    return NextResponse.json({
      valid: isValid,
      credential: {
        type: fullCredential.type,
        issuer: fullCredential.issuer,
        issuanceDate: fullCredential.issuanceDate,
        expirationDate: fullCredential.expirationDate,
        subject: disclosedSubject,
      },
      verification: {
        merkleProofValid: merkleValid,
        anchoredOnChain: onChainValid,
        anchorDetails,
        issuerTrusted,
        issuerDetails,
        revoked: credential.revoked,
      },
      shareInfo: {
        createdAt: shareToken.createdAt,
        expiresAt: shareToken.expiresAt,
        viewCount: shareToken.currentViews + 1,
        maxViews: shareToken.maxViews,
        disclosedFields: shareToken.disclosedFields,
        hiddenFields: shareToken.hiddenFields,
      },
    });

  } catch (error) {
    console.error('Share verification error:', error);
    return errorResponse('Verification failed', 500);
  }
}

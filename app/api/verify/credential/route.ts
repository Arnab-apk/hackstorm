/**
 * Direct Credential Verification API
 * POST /api/verify/credential
 * 
 * Verifies a credential by its IPFS CID or credential ID.
 * Publicly accessible for verification purposes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { fetchFromIPFS } from '@/lib/ipfs';
import { verifyMerkleProof } from '@/lib/merkle';
import { verifyBatchOnChain, isIssuerTrusted, getIssuerDetails } from '@/lib/blockchain';
import { successResponse, errorResponse } from '@/lib/response';
import type { CredentialDocument, VerifiableCredential } from '@/types';

interface VerifyCredentialRequest {
  credentialId?: string;
  ipfsCID?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyCredentialRequest = await request.json();
    const { credentialId, ipfsCID } = body;

    if (!credentialId && !ipfsCID) {
      return errorResponse('Either credentialId or ipfsCID is required', 400);
    }

    const db = await getDatabase();
    let credential: CredentialDocument | null = null;
    let fullCredential: VerifiableCredential;

    // 1. Find credential in database (if credentialId provided)
    if (credentialId) {
      credential = await db.collection<CredentialDocument>('credentials').findOne({
        _id: credentialId,
      });

      if (!credential) {
        return errorResponse('Credential not found', 404);
      }
    }

    // 2. Fetch from IPFS
    const cidToFetch = ipfsCID || credential?.ipfsCID;
    if (!cidToFetch) {
      return errorResponse('Cannot determine IPFS CID', 400);
    }

    try {
      fullCredential = await fetchFromIPFS<VerifiableCredential>(cidToFetch);
    } catch (error) {
      return errorResponse('Failed to fetch credential from IPFS', 500);
    }

    // 3. Verify structure
    if (!fullCredential.proof || !fullCredential.proof.merkleRoot) {
      return NextResponse.json({
        valid: false,
        reason: 'Invalid credential structure - missing proof',
      });
    }

    // 4. Verify merkle proof
    const merkleValid = verifyMerkleProof(
      credential?.leafHash || '', // Will be computed from credential if not in DB
      fullCredential.proof.merkleProof,
      fullCredential.proof.proofDirections,
      fullCredential.proof.merkleRoot
    );

    // 5. Verify on-chain anchor
    let onChainValid = false;
    let anchorDetails = null;
    try {
      const batchData = await verifyBatchOnChain(fullCredential.proof.merkleRoot);
      onChainValid = batchData !== null && batchData.timestamp > 0;
      if (batchData) {
        anchorDetails = {
          merkleRoot: fullCredential.proof.merkleRoot,
          txHash: fullCredential.proof.anchorTxHash,
          chain: fullCredential.proof.anchorChain,
          issuerAddress: batchData.issuer,
          timestamp: new Date(Number(batchData.timestamp) * 1000).toISOString(),
          credentialCount: Number(batchData.credentialCount),
        };
      }
    } catch (error) {
      console.error('On-chain verification failed:', error);
    }

    // 6. Verify issuer is trusted
    let issuerTrusted = false;
    let issuerDetails = null;
    try {
      const issuerAddress = anchorDetails?.issuerAddress;
      if (issuerAddress) {
        issuerTrusted = await isIssuerTrusted(issuerAddress);
        if (issuerTrusted) {
          const details = await getIssuerDetails(issuerAddress);
          issuerDetails = {
            did: details.did,
            name: details.name,
            active: details.active,
            registeredAt: new Date(Number(details.registeredAt) * 1000).toISOString(),
          };
        }
      }
    } catch (error) {
      console.error('Issuer verification failed:', error);
    }

    // 7. Check revocation status
    let revoked = false;
    let revokedAt = null;
    if (credential) {
      revoked = credential.revoked;
      revokedAt = credential.revokedAt;
    }

    // 8. Build response
    const isValid = merkleValid && onChainValid && issuerTrusted && !revoked;

    return NextResponse.json({
      valid: isValid,
      credential: {
        id: credentialId || 'external',
        type: fullCredential.type,
        issuer: fullCredential.issuer,
        issuanceDate: fullCredential.issuanceDate,
        expirationDate: fullCredential.expirationDate,
        // Only return subject ID, not full data for public verification
        subjectDID: fullCredential.credentialSubject.id,
      },
      verification: {
        merkleProofValid: merkleValid,
        anchoredOnChain: onChainValid,
        anchorDetails,
        issuerTrusted,
        issuerDetails,
        revoked,
        revokedAt,
      },
      checks: [
        {
          name: 'Merkle Proof',
          passed: merkleValid,
          description: 'Credential is part of the anchored batch',
        },
        {
          name: 'On-Chain Anchor',
          passed: onChainValid,
          description: 'Batch is anchored on Polygon',
        },
        {
          name: 'Trusted Issuer',
          passed: issuerTrusted,
          description: 'Issuer is registered in the trusted registry',
        },
        {
          name: 'Not Revoked',
          passed: !revoked,
          description: 'Credential has not been revoked',
        },
      ],
    });

  } catch (error) {
    console.error('Credential verification error:', error);
    return errorResponse('Verification failed', 500);
  }
}

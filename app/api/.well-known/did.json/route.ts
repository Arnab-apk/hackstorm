/**
 * DID Document Resolution
 * GET /api/.well-known/did.json
 * 
 * Returns the issuer's DID document for did:web resolution.
 * This allows verifiers to resolve did:web:your-app.vercel.app
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000';
  const issuerDID = process.env.ISSUER_DID || `did:web:${new URL(baseUrl).hostname}`;
  const issuerPublicKey = process.env.ISSUER_PUBLIC_KEY || '';

  // Convert hex public key to multibase format (z prefix for base58btc)
  // For production, this should be properly encoded
  const publicKeyMultibase = `z${issuerPublicKey}`;

  const didDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
    ],
    id: issuerDID,
    controller: issuerDID,
    verificationMethod: [
      {
        id: `${issuerDID}#key-1`,
        type: 'Ed25519VerificationKey2020',
        controller: issuerDID,
        publicKeyMultibase: publicKeyMultibase,
      },
    ],
    authentication: [`${issuerDID}#key-1`],
    assertionMethod: [`${issuerDID}#key-1`],
    service: [
      {
        id: `${issuerDID}#credential-registry`,
        type: 'CredentialRegistry',
        serviceEndpoint: `${baseUrl}/api/verify`,
      },
    ],
  };

  return NextResponse.json(didDocument, {
    headers: {
      'Content-Type': 'application/did+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

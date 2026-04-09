// ===========================================
// IPFS/PINATA INTEGRATION
// ===========================================

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_JWT = process.env.PINATA_JWT;
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

const PINATA_API_URL = 'https://api.pinata.cloud';

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface PinataMetadata {
  name?: string;
  keyvalues?: Record<string, string>;
}

// ===========================================
// PIN FUNCTIONS
// ===========================================

/**
 * Pin JSON data to IPFS via Pinata
 */
export async function pinJSON(
  data: object,
  metadata?: PinataMetadata
): Promise<string> {
  const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      pinataContent: data,
      pinataMetadata: metadata,
      pinataOptions: {
        cidVersion: 1,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to pin to IPFS: ${error}`);
  }

  const result: PinataResponse = await response.json();
  return result.IpfsHash;
}

/**
 * Pin a credential to IPFS
 */
export async function pinCredential(
  credential: object,
  credentialId: string
): Promise<string> {
  return pinJSON(credential, {
    name: `credential-${credentialId}`,
    keyvalues: {
      type: 'credential',
      id: credentialId,
    },
  });
}

/**
 * Pin batch metadata to IPFS
 */
export async function pinBatchMetadata(
  batchId: string,
  merkleRoot: string,
  credentialCIDs: string[],
  schemaId: string
): Promise<string> {
  const metadata = {
    batchId,
    merkleRoot,
    schemaId,
    credentialCount: credentialCIDs.length,
    credentials: credentialCIDs,
    createdAt: new Date().toISOString(),
  };

  return pinJSON(metadata, {
    name: `batch-${batchId}`,
    keyvalues: {
      type: 'batch',
      id: batchId,
    },
  });
}

// ===========================================
// FETCH FUNCTIONS
// ===========================================

/**
 * Fetch content from IPFS
 */
export async function fetchFromIPFS<T = any>(cid: string): Promise<T> {
  const url = `${IPFS_GATEWAY}/${cid}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch credential from IPFS
 */
export async function fetchCredential(cid: string): Promise<object> {
  return fetchFromIPFS(cid);
}

/**
 * Check if CID exists on IPFS
 */
export async function cidExists(cid: string): Promise<boolean> {
  try {
    const response = await fetch(`${IPFS_GATEWAY}/${cid}`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ===========================================
// UNPIN FUNCTIONS
// ===========================================

/**
 * Unpin content from Pinata
 */
export async function unpin(cid: string): Promise<void> {
  const response = await fetch(`${PINATA_API_URL}/pinning/unpin/${cid}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok && response.status !== 404) {
    const error = await response.text();
    throw new Error(`Failed to unpin from IPFS: ${error}`);
  }
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Get authentication headers for Pinata API
 */
function getHeaders(): HeadersInit {
  if (PINATA_JWT) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PINATA_JWT}`,
    };
  }

  if (PINATA_API_KEY && PINATA_SECRET_KEY) {
    return {
      'Content-Type': 'application/json',
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY,
    };
  }

  throw new Error('IPFS credentials not configured');
}

/**
 * Get IPFS gateway URL for a CID
 */
export function getIPFSUrl(cid: string): string {
  return `${IPFS_GATEWAY}/${cid}`;
}

/**
 * Extract CID from IPFS URL
 */
export function extractCID(url: string): string | null {
  const match = url.match(/ipfs\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Validate CID format
 */
export function isValidCID(cid: string): boolean {
  // Basic validation for CIDv0 and CIDv1
  const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidv1Regex = /^b[a-z2-7]{58}$/;
  return cidv0Regex.test(cid) || cidv1Regex.test(cid);
}

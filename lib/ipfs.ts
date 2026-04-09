import { nanoid } from 'nanoid';

// ===========================================
// IPFS-LIKE STORAGE (MongoDB-backed)
// Stores credential & batch JSON directly in
// MongoDB instead of calling Pinata/IPFS.
// ===========================================

const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

/**
 * Generate a fake CID (content identifier) that looks realistic.
 */
function generateCID(): string {
  return `Qm${nanoid(44).replace(/[^a-zA-Z0-9]/g, 'x')}`;
}

// ===========================================
// PIN FUNCTIONS (store in MongoDB)
// ===========================================

/**
 * Pin JSON — stores in MongoDB `ipfs_objects` collection, returns a CID.
 */
export async function pinJSON(
  data: object,
  metadata?: { name?: string; keyvalues?: Record<string, string> }
): Promise<string> {
  const { connectToDatabase } = await import('./db');
  const { db } = await connectToDatabase();
  const collection = db.collection<any>('ipfs_objects');

  const cid = generateCID();
  await collection.insertOne({
    _id: cid,
    content: data,
    metadata: metadata || {},
    pinnedAt: new Date(),
  });

  return cid;
}

/**
 * Pin a credential to "IPFS" (MongoDB).
 */
export async function pinCredential(
  credential: object,
  credentialId: string
): Promise<string> {
  return pinJSON(credential, {
    name: `credential-${credentialId}`,
    keyvalues: { type: 'credential', id: credentialId },
  });
}

/**
 * Pin batch metadata to "IPFS" (MongoDB).
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
    keyvalues: { type: 'batch', id: batchId },
  });
}

// ===========================================
// FETCH FUNCTIONS
// ===========================================

/**
 * Fetch content from "IPFS" (MongoDB).
 */
export async function fetchFromIPFS<T = any>(cid: string): Promise<T> {
  const { connectToDatabase } = await import('./db');
  const { db } = await connectToDatabase();
  const collection = db.collection<any>('ipfs_objects');

  const doc = await collection.findOne({ _id: cid });
  if (!doc) {
    throw new Error(`CID not found: ${cid}`);
  }

  return doc.content as T;
}

/**
 * Fetch credential from "IPFS" (MongoDB).
 */
export async function fetchCredential(cid: string): Promise<object> {
  return fetchFromIPFS(cid);
}

/**
 * Check if CID exists.
 */
export async function cidExists(cid: string): Promise<boolean> {
  try {
    const { connectToDatabase } = await import('./db');
    const { db } = await connectToDatabase();
    const collection = db.collection<any>('ipfs_objects');
    const doc = await collection.findOne({ _id: cid }, { projection: { _id: 1 } });
    return !!doc;
  } catch {
    return false;
  }
}

// ===========================================
// UNPIN FUNCTIONS
// ===========================================

/**
 * Unpin (delete from MongoDB).
 */
export async function unpin(cid: string): Promise<void> {
  const { connectToDatabase } = await import('./db');
  const { db } = await connectToDatabase();
  const collection = db.collection<any>('ipfs_objects');
  await collection.deleteOne({ _id: cid });
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

export function getIPFSUrl(cid: string): string {
  return `${IPFS_GATEWAY}/${cid}`;
}

export function extractCID(url: string): string | null {
  const match = url.match(/ipfs\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export function isValidCID(cid: string): boolean {
  const cidv0Regex = /^Qm[a-zA-Z0-9]{44}$/;
  const cidv1Regex = /^b[a-z2-7]{58}$/;
  return cidv0Regex.test(cid) || cidv1Regex.test(cid);
}

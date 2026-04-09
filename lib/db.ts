import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import type {
  DBCredential,
  DBBatch,
  DBShareToken,
  DBVerificationRequest,
  DBVerificationResponse,
  DBVerifier,
  DBNotification,
} from '@/types';

// ===========================================
// MONGODB CLIENT SINGLETON
// ===========================================

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'decentralized-identity';

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// ===========================================
// COLLECTION ACCESSORS
// ===========================================

export async function getCredentialsCollection(): Promise<Collection<DBCredential>> {
  const { db } = await connectToDatabase();
  return db.collection<DBCredential>('credentials');
}

export async function getBatchesCollection(): Promise<Collection<DBBatch>> {
  const { db } = await connectToDatabase();
  return db.collection<DBBatch>('batches');
}

export async function getShareTokensCollection(): Promise<Collection<DBShareToken>> {
  const { db } = await connectToDatabase();
  return db.collection<DBShareToken>('share_tokens');
}

export async function getVerificationRequestsCollection(): Promise<Collection<DBVerificationRequest>> {
  const { db } = await connectToDatabase();
  return db.collection<DBVerificationRequest>('verification_requests');
}

export async function getVerificationResponsesCollection(): Promise<Collection<DBVerificationResponse>> {
  const { db } = await connectToDatabase();
  return db.collection<DBVerificationResponse>('verification_responses');
}

export async function getVerifiersCollection(): Promise<Collection<DBVerifier>> {
  const { db } = await connectToDatabase();
  return db.collection<DBVerifier>('verifiers');
}

export async function getNotificationsCollection(): Promise<Collection<DBNotification>> {
  const { db } = await connectToDatabase();
  return db.collection<DBNotification>('notifications');
}

// ===========================================
// DATABASE INITIALIZATION
// ===========================================

export async function initializeDatabase(): Promise<void> {
  const { db } = await connectToDatabase();

  // Create indexes for credentials collection
  const credentials = db.collection('credentials');
  await credentials.createIndex({ recipientAddress: 1 });
  await credentials.createIndex({ recipientAddress: 1, claimed: 1 });
  await credentials.createIndex({ recipientAddress: 1, revoked: 1 });
  await credentials.createIndex({ batchId: 1 });
  await credentials.createIndex({ leafHash: 1 }, { unique: true });

  // Create indexes for batches collection
  const batches = db.collection('batches');
  await batches.createIndex({ merkleRoot: 1 }, { unique: true });
  await batches.createIndex({ issuerAddress: 1 });

  // Create indexes for share_tokens collection
  const shareTokens = db.collection('share_tokens');
  await shareTokens.createIndex({ credentialId: 1 });
  await shareTokens.createIndex({ createdBy: 1 });
  await shareTokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  // Create indexes for verification_requests collection
  const verificationRequests = db.collection('verification_requests');
  await verificationRequests.createIndex({ targetAddress: 1 });
  await verificationRequests.createIndex({ verifierId: 1 });
  await verificationRequests.createIndex({ status: 1 });
  await verificationRequests.createIndex({ expiresAt: 1 });

  // Create indexes for verification_responses collection
  const verificationResponses = db.collection('verification_responses');
  await verificationResponses.createIndex({ requestId: 1 }, { unique: true });

  // Create indexes for verifiers collection
  const verifiers = db.collection('verifiers');
  await verifiers.createIndex({ walletAddress: 1 }, { unique: true });
  await verifiers.createIndex({ did: 1 }, { unique: true });

  // Create indexes for notifications collection
  const notifications = db.collection('notifications');
  await notifications.createIndex({ userId: 1 });
  await notifications.createIndex({ userId: 1, read: 1 });
  await notifications.createIndex({ createdAt: -1 });

  console.log('Database indexes created successfully');
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

export function generateId(prefix: string = ''): string {
  const id = new ObjectId().toHexString();
  return prefix ? `${prefix}_${id}` : id;
}

export function toObjectId(id: string): ObjectId {
  // Remove prefix if present
  const rawId = id.includes('_') ? id.split('_').pop()! : id;
  return new ObjectId(rawId);
}

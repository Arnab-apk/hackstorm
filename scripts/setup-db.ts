/**
 * MongoDB Setup Script
 * Run with: npx tsx scripts/setup-db.ts
 * 
 * Creates database indexes and seeds initial data.
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'hackstorm';

async function setup() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in .env.local');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB_NAME);
  console.log(`✅ Connected to database: ${MONGODB_DB_NAME}`);

  // =========================================
  // CREATE INDEXES
  // =========================================
  console.log('\n📇 Creating indexes...');

  // Credentials
  const credentials = db.collection('credentials');
  await credentials.createIndex({ recipientAddress: 1 });
  await credentials.createIndex({ recipientAddress: 1, claimed: 1 });
  await credentials.createIndex({ recipientAddress: 1, revoked: 1 });
  await credentials.createIndex({ batchId: 1 });
  await credentials.createIndex({ recipientEmail: 1 });
  await credentials.createIndex({ schemaId: 1 });
  console.log('  ✅ credentials indexes');

  // Batches
  const batches = db.collection('batches');
  await batches.createIndex({ issuerAddress: 1 });
  await batches.createIndex({ schemaId: 1 });
  console.log('  ✅ batches indexes');

  // Share tokens
  const shareTokens = db.collection('share_tokens');
  await shareTokens.createIndex({ credentialId: 1 });
  await shareTokens.createIndex({ createdBy: 1 });
  await shareTokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  console.log('  ✅ share_tokens indexes');

  // Verification requests
  const verificationRequests = db.collection('verification_requests');
  await verificationRequests.createIndex({ targetAddress: 1 });
  await verificationRequests.createIndex({ verifierId: 1 });
  await verificationRequests.createIndex({ status: 1 });
  console.log('  ✅ verification_requests indexes');

  // Verification responses
  const verificationResponses = db.collection('verification_responses');
  await verificationResponses.createIndex({ requestId: 1 });
  console.log('  ✅ verification_responses indexes');

  // Notifications
  const notifications = db.collection('notifications');
  await notifications.createIndex({ userId: 1 });
  await notifications.createIndex({ userId: 1, read: 1 });
  await notifications.createIndex({ createdAt: -1 });
  console.log('  ✅ notifications indexes');

  // IPFS objects (MongoDB-backed storage)
  const ipfsObjects = db.collection('ipfs_objects');
  await ipfsObjects.createIndex({ 'metadata.keyvalues.type': 1 });
  console.log('  ✅ ipfs_objects indexes');

  // =========================================
  // VERIFY COLLECTIONS
  // =========================================
  console.log('\n📦 Collection status:');
  const collections = await db.listCollections().toArray();
  const collNames = collections.map(c => c.name);

  const expected = [
    'credentials', 'batches', 'share_tokens',
    'verification_requests', 'verification_responses',
    'notifications', 'ipfs_objects',
  ];

  for (const name of expected) {
    const count = await db.collection(name).countDocuments();
    const exists = collNames.includes(name);
    console.log(`  ${exists ? '✅' : '⚠️ '} ${name}: ${count} documents`);
  }

  // =========================================
  // PRINT ROLE CONFIG
  // =========================================
  console.log('\n🔐 Role configuration:');
  console.log(`  Issuer wallet:   ${process.env.ISSUER_WALLET_ADDRESS || '(not set)'}`);
  console.log(`  Verifier wallet: ${process.env.VERIFIER_WALLET_ADDRESS || '(not set)'}`);
  console.log('  All other wallets → "user" (recipient) role');

  console.log('\n✅ Setup complete! You can now run: npm run dev');

  await client.close();
}

setup().catch(err => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});

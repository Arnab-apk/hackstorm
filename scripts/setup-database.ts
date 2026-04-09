/**
 * Database Setup Script
 * 
 * Creates MongoDB collections and indexes.
 * Run once before first deployment.
 * 
 * Usage: npx ts-node scripts/setup-database.ts
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function setupDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Create collections
    const collections = [
      'credentials',
      'batches',
      'share_tokens',
      'verification_requests',
      'verification_responses',
      'verifiers',
      'notifications',
    ];

    for (const collectionName of collections) {
      const exists = await db.listCollections({ name: collectionName }).hasNext();
      if (!exists) {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      } else {
        console.log(`Collection already exists: ${collectionName}`);
      }
    }

    // Create indexes for credentials collection
    console.log('\nCreating indexes for credentials...');
    await db.collection('credentials').createIndex({ recipientAddress: 1 });
    await db.collection('credentials').createIndex({ recipientAddress: 1, claimed: 1 });
    await db.collection('credentials').createIndex({ recipientAddress: 1, revoked: 1 });
    await db.collection('credentials').createIndex({ batchId: 1 });
    await db.collection('credentials').createIndex({ batchId: 1, leafIndex: 1 }, { unique: true });
    await db.collection('credentials').createIndex({ ipfsCID: 1 }, { unique: true });
    await db.collection('credentials').createIndex({ issuedAt: -1 });
    console.log('Credentials indexes created');

    // Create indexes for batches collection
    console.log('\nCreating indexes for batches...');
    await db.collection('batches').createIndex({ merkleRoot: 1 }, { unique: true });
    await db.collection('batches').createIndex({ issuerAddress: 1 });
    await db.collection('batches').createIndex({ createdAt: -1 });
    console.log('Batches indexes created');

    // Create indexes for share_tokens collection
    console.log('\nCreating indexes for share_tokens...');
    await db.collection('share_tokens').createIndex({ credentialId: 1 });
    await db.collection('share_tokens').createIndex({ createdBy: 1 });
    await db.collection('share_tokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log('Share tokens indexes created');

    // Create indexes for verification_requests collection
    console.log('\nCreating indexes for verification_requests...');
    await db.collection('verification_requests').createIndex({ verifierId: 1 });
    await db.collection('verification_requests').createIndex({ targetAddress: 1 });
    await db.collection('verification_requests').createIndex({ targetAddress: 1, status: 1 });
    await db.collection('verification_requests').createIndex({ status: 1 });
    await db.collection('verification_requests').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db.collection('verification_requests').createIndex({ createdAt: -1 });
    console.log('Verification requests indexes created');

    // Create indexes for verification_responses collection
    console.log('\nCreating indexes for verification_responses...');
    await db.collection('verification_responses').createIndex({ requestId: 1 }, { unique: true });
    await db.collection('verification_responses').createIndex({ respondedAt: -1 });
    console.log('Verification responses indexes created');

    // Create indexes for verifiers collection
    console.log('\nCreating indexes for verifiers...');
    await db.collection('verifiers').createIndex({ walletAddress: 1 }, { unique: true });
    await db.collection('verifiers').createIndex({ did: 1 }, { unique: true });
    console.log('Verifiers indexes created');

    // Create indexes for notifications collection
    console.log('\nCreating indexes for notifications...');
    await db.collection('notifications').createIndex({ recipientAddress: 1 });
    await db.collection('notifications').createIndex({ recipientAddress: 1, read: 1 });
    await db.collection('notifications').createIndex({ createdAt: -1 });
    // Auto-delete notifications after 30 days
    await db.collection('notifications').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 30 * 24 * 60 * 60 }
    );
    console.log('Notifications indexes created');

    console.log('\n✅ Database setup complete!');

  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setupDatabase();

/**
 * Seed Demo Data Script
 * 
 * Creates sample data for hackathon demo.
 * Run after database setup and contract deployment.
 * 
 * Usage: npx ts-node scripts/seed-demo-data.ts
 */

import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seedDemoData() {
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

    // Demo verifier
    const demoVerifier = {
      _id: 'verifier_demo_001',
      walletAddress: process.env.VERIFIER_ADDRESS?.toLowerCase() || '0x0000000000000000000000000000000000000001',
      did: `did:pkh:eip155:137:${process.env.VERIFIER_ADDRESS?.toLowerCase() || '0x0000000000000000000000000000000000000001'}`,
      name: 'Acme Corporation',
      type: 'employer',
      website: 'https://acme.example.com',
      description: 'Demo employer for hackathon',
      verified: true,
      createdAt: new Date(),
    };

    // Check if verifier exists
    const existingVerifier = await db.collection('verifiers').findOne({ _id: demoVerifier._id });
    if (!existingVerifier) {
      await db.collection('verifiers').insertOne(demoVerifier);
      console.log('Created demo verifier:', demoVerifier.name);
    } else {
      console.log('Demo verifier already exists');
    }

    // Demo batch (without actual credentials - those need to be created through the API)
    const demoBatch = {
      _id: 'batch_demo_001',
      merkleRoot: '0x' + '0'.repeat(64), // Placeholder
      issuerDID: process.env.ISSUER_DID || 'did:web:localhost',
      issuerAddress: process.env.ISSUER_ADDRESS?.toLowerCase() || '0x0000000000000000000000000000000000000000',
      schemaId: 'university-degree',
      credentialCount: 0,
      anchorTxHash: null,
      anchorBlockNumber: null,
      anchorStatus: 'pending',
      createdAt: new Date(),
    };

    const existingBatch = await db.collection('batches').findOne({ _id: demoBatch._id });
    if (!existingBatch) {
      await db.collection('batches').insertOne(demoBatch);
      console.log('Created demo batch placeholder');
    } else {
      console.log('Demo batch already exists');
    }

    console.log('\n✅ Demo data seeded!');
    console.log('\nNext steps:');
    console.log('1. Deploy the smart contract: npx hardhat run scripts/deploy-contract.ts --network polygon-amoy');
    console.log('2. Register the issuer on the contract');
    console.log('3. Start the app and create credentials through the API');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedDemoData();

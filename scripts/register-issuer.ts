import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'decentralized-identity';
const ISSUER_WALLET_ADDRESS = process.env.ISSUER_WALLET_ADDRESS;
const ISSUER_DID = process.env.ISSUER_DID || 'did:web:localhost';

async function registerIssuer() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not set in .env.local');
    process.exit(1);
  }

  if (!ISSUER_WALLET_ADDRESS) {
    console.error('Error: ISSUER_WALLET_ADDRESS is not set in .env.local');
    console.error('Please log in with your issuer account first to get the wallet address.');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB_NAME);
    const issuersCollection = db.collection('issuers');

    // Check if issuer already exists
    const existingIssuer = await issuersCollection.findOne({
      address: { $regex: new RegExp(`^${ISSUER_WALLET_ADDRESS}$`, 'i') }
    });

    if (existingIssuer) {
      console.log('Issuer already registered:');
      console.log(`  Address: ${existingIssuer.address}`);
      console.log(`  DID: ${existingIssuer.did}`);
      console.log(`  Name: ${existingIssuer.name}`);
      console.log(`  Active: ${existingIssuer.active}`);
      return;
    }

    // Register new issuer
    const issuer = {
      _id: `issuer-${Date.now()}`,
      address: ISSUER_WALLET_ADDRESS,
      did: ISSUER_DID,
      name: 'Demo University',
      active: true,
      registeredAt: new Date(),
      updatedAt: new Date(),
    };

    await issuersCollection.insertOne(issuer);

    console.log('========================================');
    console.log('ISSUER REGISTERED SUCCESSFULLY');
    console.log('========================================');
    console.log('');
    console.log(`Address: ${issuer.address}`);
    console.log(`DID: ${issuer.did}`);
    console.log(`Name: ${issuer.name}`);
    console.log('');
    console.log('The issuer can now issue verifiable credentials.');
    console.log('========================================');

  } catch (error) {
    console.error('Error registering issuer:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

registerIssuer();

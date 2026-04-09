import { NextRequest } from 'next/server';
import { requireIssuer } from '@/lib/auth';
import { 
  successResponse, 
  badRequest, 
  validationError,
  handleError 
} from '@/lib/response';
import { 
  buildCredential, 
  signCredential, 
  validateCredentialData,
  createDIDFromAddress,
  generateCredentialId,
  generateBatchId,
} from '@/lib/credentials';
import { getSchema } from '@/lib/schemas';
import { buildMerkleTree, getMerkleProof, hashCredential } from '@/lib/merkle';
import { anchorBatch } from '@/lib/blockchain';
import { pinCredential, pinBatchMetadata } from '@/lib/ipfs';
import { predictAddressFromEmail } from '@/lib/auth';
import { 
  getCredentialsCollection, 
  getBatchesCollection,
  generateId 
} from '@/lib/db';
import { notifyCredentialIssued } from '@/lib/notifications';
import type { IssueSingleRequest, DBCredential, DBBatch } from '@/types';

/**
 * POST /api/issuer/issue/single
 * Issue a single credential
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireIssuer();
    const body: IssueSingleRequest = await request.json();

    // Validate request
    const { schemaId, recipientEmail, credentialData, expirationDate } = body;

    if (!schemaId) {
      return badRequest('Schema ID is required');
    }
    if (!recipientEmail) {
      return badRequest('Recipient email is required');
    }
    if (!credentialData) {
      return badRequest('Credential data is required');
    }

    // Get schema
    const schema = getSchema(schemaId);
    if (!schema) {
      return badRequest(`Invalid schema: ${schemaId}`);
    }

    // Validate credential data against schema
    const validation = validateCredentialData(schema, credentialData);
    if (!validation.valid) {
      return validationError(validation.errors);
    }

    // Predict recipient wallet address from email
    const recipientAddress = await predictAddressFromEmail(recipientEmail);
    const recipientDID = createDIDFromAddress(recipientAddress);

    // Build credential
    const credentialId = generateCredentialId();
    const unsignedCredential = buildCredential(
      schema,
      credentialData,
      recipientDID,
      { expirationDate }
    );

    // Build merkle tree (single credential)
    const leafHash = hashCredential(unsignedCredential);
    const merkleTree = buildMerkleTree([leafHash]);
    const merkleProof = getMerkleProof(merkleTree, 0);

    // Anchor on blockchain
    const { txHash, blockNumber } = await anchorBatch(
      merkleTree.root,
      1
    );

    // Sign credential with merkle proof and anchor data
    const signedCredential = await signCredential(
      unsignedCredential,
      merkleProof,
      {
        txHash,
        chain: 'polygon',
        contract: process.env.CREDENTIAL_REGISTRY_CONTRACT!,
      }
    );

    // Pin to IPFS
    const ipfsCID = await pinCredential(signedCredential, credentialId);

    // Generate batch ID
    const batchId = generateBatchId();

    // Pin batch metadata to IPFS
    const batchMetadataCID = await pinBatchMetadata(
      batchId,
      merkleTree.root,
      [ipfsCID],
      schemaId
    );

    // Store in database
    const credentialsCollection = await getCredentialsCollection();
    const batchesCollection = await getBatchesCollection();

    const dbCredential: DBCredential = {
      _id: credentialId,
      batchId,
      leafIndex: 0,
      leafHash,
      ipfsCID,
      recipientEmail,
      recipientAddress,
      recipientDID,
      schemaId,
      claimed: false,
      claimedAt: null,
      revoked: false,
      revokedAt: null,
      revokedReason: null,
      issuedAt: new Date(),
    };

    const dbBatch: DBBatch = {
      _id: batchId,
      merkleRoot: merkleTree.root,
      issuerDID: session.did,
      issuerAddress: session.address,
      schemaId,
      credentialCount: 1,
      merkleTree,
      batchMetadataCID,
      anchorTxHash: txHash,
      anchorBlockNumber: blockNumber,
      createdAt: new Date(),
    };

    await Promise.all([
      credentialsCollection.insertOne(dbCredential),
      batchesCollection.insertOne(dbBatch),
    ]);

    // Create notification for recipient
    await notifyCredentialIssued(recipientAddress, credentialId, schema.name);

    return successResponse({
      success: true,
      batchId,
      merkleRoot: merkleTree.root,
      txHash,
      credentials: [{
        id: credentialId,
        recipientEmail,
        recipientAddress,
        ipfsCID,
      }],
    });
  } catch (error) {
    return handleError(error);
  }
}

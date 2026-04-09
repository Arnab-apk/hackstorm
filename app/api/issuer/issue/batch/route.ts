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
} from '@/lib/db';
import { notifyCredentialIssued } from '@/lib/notifications';
import type { IssueBatchRequest, DBCredential, DBBatch } from '@/types';

interface BatchCredentialInput {
  recipientEmail: string;
  data: Record<string, any>;
}

interface ProcessedCredential {
  credentialId: string;
  recipientEmail: string;
  recipientAddress: string;
  recipientDID: string;
  unsignedCredential: any;
  leafHash: string;
}

/**
 * POST /api/issuer/issue/batch
 * Issue multiple credentials in a batch
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireIssuer();
    const body: IssueBatchRequest = await request.json();

    // Validate request
    const { schemaId, credentials } = body;

    if (!schemaId) {
      return badRequest('Schema ID is required');
    }
    if (!credentials || !Array.isArray(credentials) || credentials.length === 0) {
      return badRequest('At least one credential is required');
    }
    if (credentials.length > 1000) {
      return badRequest('Maximum 1000 credentials per batch');
    }

    // Get schema
    const schema = getSchema(schemaId);
    if (!schema) {
      return badRequest(`Invalid schema: ${schemaId}`);
    }

    // Validate all credentials first
    const validationErrors: string[] = [];
    for (let i = 0; i < credentials.length; i++) {
      const cred = credentials[i];
      if (!cred.recipientEmail) {
        validationErrors.push(`Credential ${i + 1}: Recipient email is required`);
        continue;
      }
      const validation = validateCredentialData(schema, cred.data);
      if (!validation.valid) {
        validation.errors.forEach(err => {
          validationErrors.push(`Credential ${i + 1}: ${err}`);
        });
      }
    }

    if (validationErrors.length > 0) {
      return validationError(validationErrors);
    }

    // Process all credentials
    const processedCredentials: ProcessedCredential[] = [];

    for (const cred of credentials) {
      const credentialId = generateCredentialId();
      const recipientAddress = await predictAddressFromEmail(cred.recipientEmail);
      const recipientDID = createDIDFromAddress(recipientAddress);

      const unsignedCredential = buildCredential(
        schema,
        cred.data,
        recipientDID
      );

      const leafHash = hashCredential(unsignedCredential);

      processedCredentials.push({
        credentialId,
        recipientEmail: cred.recipientEmail,
        recipientAddress,
        recipientDID,
        unsignedCredential,
        leafHash,
      });
    }

    // Build merkle tree from all leaf hashes
    const leafHashes = processedCredentials.map(c => c.leafHash);
    const merkleTree = buildMerkleTree(leafHashes);

    // Anchor on blockchain
    const { txHash, blockNumber } = await anchorBatch(
      merkleTree.root,
      credentials.length
    );

    // Generate batch ID
    const batchId = generateBatchId();

    // Sign and pin all credentials
    const signedCredentials: { 
      credentialId: string;
      recipientEmail: string;
      recipientAddress: string;
      ipfsCID: string;
      leafIndex: number;
    }[] = [];

    for (let i = 0; i < processedCredentials.length; i++) {
      const proc = processedCredentials[i];
      const merkleProof = getMerkleProof(merkleTree, i);

      const signedCredential = await signCredential(
        proc.unsignedCredential,
        merkleProof,
        {
          txHash,
          chain: 'polygon',
          contract: process.env.CREDENTIAL_REGISTRY_CONTRACT!,
        }
      );

      const ipfsCID = await pinCredential(signedCredential, proc.credentialId);

      signedCredentials.push({
        credentialId: proc.credentialId,
        recipientEmail: proc.recipientEmail,
        recipientAddress: proc.recipientAddress,
        ipfsCID,
        leafIndex: i,
      });
    }

    // Pin batch metadata to IPFS
    const credentialCIDs = signedCredentials.map(c => c.ipfsCID);
    const batchMetadataCID = await pinBatchMetadata(
      batchId,
      merkleTree.root,
      credentialCIDs,
      schemaId
    );

    // Store in database
    const credentialsCollection = await getCredentialsCollection();
    const batchesCollection = await getBatchesCollection();

    // Create DB records for all credentials
    const dbCredentials: DBCredential[] = signedCredentials.map((cred, index) => ({
      _id: cred.credentialId,
      batchId,
      leafIndex: cred.leafIndex,
      leafHash: processedCredentials[index].leafHash,
      ipfsCID: cred.ipfsCID,
      recipientEmail: cred.recipientEmail,
      recipientAddress: cred.recipientAddress,
      recipientDID: processedCredentials[index].recipientDID,
      schemaId,
      claimed: false,
      claimedAt: null,
      revoked: false,
      revokedAt: null,
      revokedReason: null,
      issuedAt: new Date(),
    }));

    const dbBatch: DBBatch = {
      _id: batchId,
      merkleRoot: merkleTree.root,
      issuerDID: session.did,
      issuerAddress: session.address,
      schemaId,
      credentialCount: credentials.length,
      merkleTree,
      batchMetadataCID,
      anchorTxHash: txHash,
      anchorBlockNumber: blockNumber,
      createdAt: new Date(),
    };

    await Promise.all([
      credentialsCollection.insertMany(dbCredentials),
      batchesCollection.insertOne(dbBatch),
    ]);

    // Create notifications for all recipients
    await Promise.all(
      signedCredentials.map(cred =>
        notifyCredentialIssued(cred.recipientAddress, cred.credentialId, schema.name)
      )
    );

    return successResponse({
      success: true,
      batchId,
      merkleRoot: merkleTree.root,
      txHash,
      credentials: signedCredentials.map(c => ({
        id: c.credentialId,
        recipientEmail: c.recipientEmail,
        recipientAddress: c.recipientAddress,
        ipfsCID: c.ipfsCID,
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

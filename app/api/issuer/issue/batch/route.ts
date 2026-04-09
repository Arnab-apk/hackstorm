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
import { predictAddressFromEmail } from '@/lib/auth';
import { 
  getCredentialsCollection, 
  getBatchesCollection,
} from '@/lib/db';
import { notifyCredentialIssued } from '@/lib/notifications';
import type { IssueBatchRequest, DBCredential, DBBatch } from '@/types';

/**
 * POST /api/issuer/issue/batch
 * Issue multiple credentials in a batch — stores everything in MongoDB.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireIssuer();
    const body: IssueBatchRequest = await request.json();

    const { schemaId, credentials } = body;

    if (!schemaId) return badRequest('Schema ID is required');
    if (!credentials || !Array.isArray(credentials) || credentials.length === 0) {
      return badRequest('At least one credential is required');
    }
    if (credentials.length > 1000) {
      return badRequest('Maximum 1000 credentials per batch');
    }

    const schema = getSchema(schemaId);
    if (!schema) return badRequest(`Invalid schema: ${schemaId}`);

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
    interface ProcessedCredential {
      credentialId: string;
      recipientEmail: string;
      recipientAddress: string;
      recipientDID: string;
      unsignedCredential: any;
      leafHash: string;
    }

    const processedCredentials: ProcessedCredential[] = [];

    for (const cred of credentials) {
      const credentialId = generateCredentialId();
      const recipientAddress = await predictAddressFromEmail(cred.recipientEmail);
      const recipientDID = createDIDFromAddress(recipientAddress);

      const unsignedCredential = buildCredential(schema, cred.data, recipientDID);
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

    // Build merkle tree
    const leafHashes = processedCredentials.map(c => c.leafHash);
    const merkleTree = buildMerkleTree(leafHashes);

    // Mock anchor (no contract call)
    const { txHash, blockNumber } = await anchorBatch(merkleTree.root, credentials.length);

    const batchId = generateBatchId();

    // Sign all credentials and build DB records
    const dbCredentials: DBCredential[] = [];
    const resultCredentials: { id: string; recipientEmail: string; recipientAddress: string }[] = [];

    for (let i = 0; i < processedCredentials.length; i++) {
      const proc = processedCredentials[i];
      const merkleProof = getMerkleProof(merkleTree, i);

      const signedCredential = await signCredential(
        proc.unsignedCredential,
        merkleProof,
        {
          txHash,
          chain: 'polygon',
          contract: process.env.CREDENTIAL_REGISTRY_CONTRACT || '0x0',
        }
      );

      dbCredentials.push({
        _id: proc.credentialId,
        batchId,
        leafIndex: i,
        leafHash: proc.leafHash,
        ipfsCID: '',
        recipientEmail: proc.recipientEmail,
        recipientAddress: proc.recipientAddress,
        recipientDID: proc.recipientDID,
        schemaId,
        credentialJSON: signedCredential,
        claimed: false,
        claimedAt: null,
        revoked: false,
        revokedAt: null,
        revokedReason: null,
        issuedAt: new Date(),
      });

      resultCredentials.push({
        id: proc.credentialId,
        recipientEmail: proc.recipientEmail,
        recipientAddress: proc.recipientAddress,
      });
    }

    const dbBatch: DBBatch = {
      _id: batchId,
      merkleRoot: merkleTree.root,
      issuerDID: session.did,
      issuerAddress: session.address,
      schemaId,
      credentialCount: credentials.length,
      merkleTree,
      batchMetadataCID: '',
      anchorTxHash: txHash,
      anchorBlockNumber: blockNumber,
      createdAt: new Date(),
    };

    // Store in MongoDB
    const credentialsCollection = await getCredentialsCollection();
    const batchesCollection = await getBatchesCollection();

    await Promise.all([
      credentialsCollection.insertMany(dbCredentials),
      batchesCollection.insertOne(dbBatch),
    ]);

    // Notifications
    await Promise.all(
      processedCredentials.map(proc =>
        notifyCredentialIssued(proc.recipientAddress, proc.credentialId, schema.name)
      )
    );

    return successResponse({
      success: true,
      batchId,
      merkleRoot: merkleTree.root,
      txHash,
      credentials: resultCredentials,
    });
  } catch (error) {
    return handleError(error);
  }
}

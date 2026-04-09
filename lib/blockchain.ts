import { 
  createPublicClient, 
  createWalletClient, 
  encodeFunctionData,
  http,
  type PublicClient,
  type WalletClient,
  type Hash,
  type TransactionReceipt,
} from 'viem';
import { polygonAmoy } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { CREDENTIAL_REGISTRY_ABI } from './contract-abi';
import type { TrustedIssuer } from '@/types';

// ===========================================
// CONFIGURATION
// ===========================================

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology';
const CONTRACT_ADDRESS = process.env.CREDENTIAL_REGISTRY_CONTRACT as `0x${string}`;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

// Custom chain config for Polygon Amoy testnet
const polygonAmoyConfig = {
  ...polygonAmoy,
  rpcUrls: {
    default: {
      http: [POLYGON_RPC_URL],
    },
    public: {
      http: [POLYGON_RPC_URL],
    },
  },
};

// ===========================================
// CLIENT CREATION
// ===========================================

let publicClient: PublicClient | null = null;
let walletClient: WalletClient | null = null;

export function getPublicClient(): PublicClient {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: polygonAmoyConfig,
      transport: http(POLYGON_RPC_URL),
    });
  }
  return publicClient;
}

export function getWalletClient(): WalletClient {
  if (!walletClient) {
    if (!DEPLOYER_PRIVATE_KEY) {
      throw new Error('DEPLOYER_PRIVATE_KEY not configured');
    }
    const account = privateKeyToAccount(`0x${DEPLOYER_PRIVATE_KEY.replace('0x', '')}`);
    walletClient = createWalletClient({
      account,
      chain: polygonAmoyConfig,
      transport: http(POLYGON_RPC_URL),
    });
  }
  return walletClient;
}

// ===========================================
// CONTRACT READ FUNCTIONS
// ===========================================

/**
 * Check if an address is a trusted issuer
 */
export async function isIssuerTrusted(issuerAddress: string): Promise<boolean> {
  const client = getPublicClient();
  
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'isIssuerTrusted',
    args: [issuerAddress as `0x${string}`],
  });
  
  return result as boolean;
}

/**
 * Get issuer details
 */
export async function getIssuer(issuerAddress: string): Promise<TrustedIssuer | null> {
  const client = getPublicClient();
  
  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CREDENTIAL_REGISTRY_ABI,
      functionName: 'getIssuer',
      args: [issuerAddress as `0x${string}`],
    }) as {
      did: string;
      name: string;
      active: boolean;
      registeredAt: bigint;
    };
    
    if (!result.active && result.registeredAt === BigInt(0)) {
      return null;
    }
    
    return {
      address: issuerAddress,
      did: result.did,
      name: result.name,
      active: result.active,
      registeredAt: Number(result.registeredAt),
    };
  } catch {
    return null;
  }
}

/**
 * Check if a batch exists
 */
export async function batchExists(merkleRoot: string): Promise<boolean> {
  const client = getPublicClient();
  
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'batchExistsCheck',
    args: [merkleRoot as `0x${string}`],
  });
  
  return result as boolean;
}

/**
 * Get batch details
 */
export async function getBatch(merkleRoot: string): Promise<{
  merkleRoot: string;
  issuer: string;
  issuerDID: string;
  credentialCount: number;
  timestamp: number;
  exists: boolean;
} | null> {
  const client = getPublicClient();
  
  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CREDENTIAL_REGISTRY_ABI,
      functionName: 'getBatch',
      args: [merkleRoot as `0x${string}`],
    }) as {
      merkleRoot: string;
      issuer: string;
      issuerDID: string;
      credentialCount: bigint;
      timestamp: bigint;
      exists: boolean;
    };
    
    if (!result.exists) {
      return null;
    }
    
    return {
      merkleRoot: result.merkleRoot,
      issuer: result.issuer,
      issuerDID: result.issuerDID,
      credentialCount: Number(result.credentialCount),
      timestamp: Number(result.timestamp),
      exists: result.exists,
    };
  } catch {
    return null;
  }
}

/**
 * Check if a credential is revoked
 */
export async function isCredentialRevoked(
  merkleRoot: string, 
  leafIndex: number
): Promise<boolean> {
  const client = getPublicClient();
  
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'isCredentialRevoked',
    args: [merkleRoot as `0x${string}`, BigInt(leafIndex)],
  });
  
  return result as boolean;
}

/**
 * Get revocation details
 */
export async function getRevocationDetails(
  merkleRoot: string,
  leafIndex: number
): Promise<{ revoked: boolean; revokedAt: number; reason: string }> {
  const client = getPublicClient();
  
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'getRevocationDetails',
    args: [merkleRoot as `0x${string}`, BigInt(leafIndex)],
  }) as {
    revoked: boolean;
    revokedAt: bigint;
    reason: string;
  };
  
  return {
    revoked: result.revoked,
    revokedAt: Number(result.revokedAt),
    reason: result.reason,
  };
}

/**
 * Verify full credential status
 */
export async function verifyCredentialStatus(
  merkleRoot: string,
  leafIndex: number
): Promise<{
  exists: boolean;
  revoked: boolean;
  issuerTrusted: boolean;
  issuerDID: string;
}> {
  const client = getPublicClient();
  
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'verifyCredentialStatus',
    args: [merkleRoot as `0x${string}`, BigInt(leafIndex)],
  }) as readonly [boolean, boolean, boolean, string];
  
  return {
    exists: result[0],
    revoked: result[1],
    issuerTrusted: result[2],
    issuerDID: result[3],
  };
}

// ===========================================
// CONTRACT WRITE FUNCTIONS
// ===========================================

/**
 * Anchor a batch of credentials
 */
export async function anchorBatch(
  merkleRoot: string,
  credentialCount: number
): Promise<{ txHash: Hash; blockNumber: number }> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  
  const hash = await wallet.writeContract({
    account: wallet.account!,
    chain: polygonAmoyConfig,
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'anchorBatch',
    args: [merkleRoot as `0x${string}`, BigInt(credentialCount)],
  });
  
  const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ 
    hash,
    confirmations: 1,
  });
  
  return {
    txHash: hash,
    blockNumber: Number(receipt.blockNumber),
  };
}

/**
 * Revoke a credential
 */
export async function revokeCredentialOnChain(
  merkleRoot: string,
  leafIndex: number,
  reason: string
): Promise<Hash> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  
  const hash = await wallet.writeContract({
    account: wallet.account!,
    chain: polygonAmoyConfig,
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'revokeCredential',
    args: [merkleRoot as `0x${string}`, BigInt(leafIndex), reason],
  });
  
  await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
  
  return hash;
}

/**
 * Unrevoke a credential
 */
export async function unrevokeCredentialOnChain(
  merkleRoot: string,
  leafIndex: number
): Promise<Hash> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  
  const hash = await wallet.writeContract({
    account: wallet.account!,
    chain: polygonAmoyConfig,
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'unrevokeCredential',
    args: [merkleRoot as `0x${string}`, BigInt(leafIndex)],
  });
  
  await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
  
  return hash;
}

/**
 * Register a new issuer (owner only)
 */
export async function registerIssuer(
  issuerAddress: string,
  did: string,
  name: string
): Promise<Hash> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  
  const hash = await wallet.writeContract({
    account: wallet.account!,
    chain: polygonAmoyConfig,
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'registerIssuer',
    args: [issuerAddress as `0x${string}`, did, name],
  });
  
  await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
  
  return hash;
}

/**
 * Revoke an issuer (owner only)
 */
export async function revokeIssuer(issuerAddress: string): Promise<Hash> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  
  const hash = await wallet.writeContract({
    account: wallet.account!,
    chain: polygonAmoyConfig,
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'revokeIssuer',
    args: [issuerAddress as `0x${string}`],
  });
  
  await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
  
  return hash;
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Get current gas price
 */
export async function getGasPrice(): Promise<bigint> {
  const client = getPublicClient();
  return await client.getGasPrice();
}

/**
 * Get account balance
 */
export async function getBalance(address: string): Promise<bigint> {
  const client = getPublicClient();
  return await client.getBalance({ address: address as `0x${string}` });
}

/**
 * Get transaction receipt
 */
export async function getTransactionReceipt(txHash: Hash): Promise<TransactionReceipt | null> {
  const client = getPublicClient();
  try {
    return await client.getTransactionReceipt({ hash: txHash });
  } catch {
    return null;
  }
}

// ===========================================
// LEGACY COMPATIBILITY HELPERS
// ===========================================

/**
 * Build unsigned transaction data for frontend wallet signing.
 */
export async function prepareAnchorTransaction(
  merkleRoot: `0x${string}`,
  credentialCount: number
): Promise<{ to: `0x${string}`; data: `0x${string}`; chainId: number }> {
  const data = encodeFunctionData({
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'anchorBatch',
    args: [merkleRoot, BigInt(credentialCount)],
  });

  return {
    to: CONTRACT_ADDRESS,
    data,
    chainId: polygonAmoyConfig.id,
  };
}

/**
 * Wait for a transaction to be confirmed.
 */
export async function waitForTransaction(txHash: `0x${string}`): Promise<TransactionReceipt> {
  const client = getPublicClient();
  return client.waitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  });
}

/**
 * Verify that a batch root is anchored on chain.
 */
export async function verifyBatchOnChain(merkleRoot: string): Promise<{
  merkleRoot: string;
  issuer: string;
  issuerDID: string;
  credentialCount: bigint;
  timestamp: bigint;
  exists: boolean;
} | null> {
  const client = getPublicClient();

  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CREDENTIAL_REGISTRY_ABI,
      functionName: 'getBatch',
      args: [merkleRoot as `0x${string}`],
    }) as {
      merkleRoot: string;
      issuer: string;
      issuerDID: string;
      credentialCount: bigint;
      timestamp: bigint;
      exists: boolean;
    };

    if (!result.exists) {
      return null;
    }

    return {
      merkleRoot: result.merkleRoot,
      issuer: result.issuer,
      issuerDID: result.issuerDID,
      credentialCount: result.credentialCount,
      timestamp: result.timestamp,
      exists: result.exists,
    };
  } catch {
    return null;
  }
}

/**
 * Legacy alias kept for older routes.
 */
export async function getIssuerDetails(issuerAddress: string): Promise<TrustedIssuer> {
  const issuer = await getIssuer(issuerAddress);
  if (!issuer) {
    throw new Error('Issuer not found');
  }
  return issuer;
}

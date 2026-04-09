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
 * Verify a batch exists on-chain and get its details
 */
export async function verifyBatch(merkleRoot: string): Promise<{
  exists: boolean;
  issuer: string;
  timestamp: number;
} | null> {
  const client = getPublicClient();
  
  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CREDENTIAL_REGISTRY_ABI,
      functionName: 'verify',
      args: [merkleRoot as `0x${string}`],
    }) as [boolean, string, bigint];
    
    // First element is the exists flag
    if (!result[0]) {
      return null;
    }
    
    return {
      exists: result[0],
      issuer: result[1],
      timestamp: Number(result[2]),
    };
  } catch {
    return null;
  }
}

/**
 * Check if a batch exists (simple boolean check)
 */
export async function batchExists(merkleRoot: string): Promise<boolean> {
  const result = await verifyBatch(merkleRoot);
  return result !== null && result.exists;
}

// ===========================================
// CONTRACT WRITE FUNCTIONS
// ===========================================

/**
 * Anchor a batch of credentials (stores merkle root on-chain)
 */
export async function anchorBatch(
  merkleRoot: string,
  _credentialCount: number // kept for API compatibility, not used by contract
): Promise<{ txHash: Hash; blockNumber: number }> {
  const wallet = getWalletClient();
  const client = getPublicClient();
  
  const hash = await wallet.writeContract({
    account: wallet.account!,
    chain: polygonAmoyConfig,
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'anchorBatch',
    args: [merkleRoot as `0x${string}`],
  });
  
  const receipt: TransactionReceipt = await client.waitForTransactionReceipt({ 
    hash,
    confirmations: 1,
  });
  
  return {
    txHash: hash,
    blockNumber: Number(receipt.blockNumber),
  };
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

/**
 * Build unsigned transaction data for frontend wallet signing
 */
export async function prepareAnchorTransaction(
  merkleRoot: `0x${string}`
): Promise<{ to: `0x${string}`; data: `0x${string}`; chainId: number }> {
  const data = encodeFunctionData({
    abi: CREDENTIAL_REGISTRY_ABI,
    functionName: 'anchorBatch',
    args: [merkleRoot],
  });

  return {
    to: CONTRACT_ADDRESS,
    data,
    chainId: polygonAmoyConfig.id,
  };
}

/**
 * Wait for a transaction to be confirmed
 */
export async function waitForTransaction(txHash: `0x${string}`): Promise<TransactionReceipt> {
  const client = getPublicClient();
  return client.waitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  });
}

/**
 * Verify that a batch root is anchored on chain (alias for verifyBatch)
 */
export async function verifyBatchOnChain(merkleRoot: string) {
  return verifyBatch(merkleRoot);
}

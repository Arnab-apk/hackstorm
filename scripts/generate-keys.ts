import { randomBytes, createHash } from "node:crypto";

/**
 * Robust Base58btc encoder using native BigInt
 * (No external dependencies like multiformats)
 */
function encodeBase58Btc(bytes: Uint8Array): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  let x = BigInt(0);
  for (const b of bytes) {
    x = x * 256n + BigInt(b);
  }
  while (x > 0n) {
    result = ALPHABET[Number(x % 58n)] + result;
    x /= 58n;
  }
  // Add leading '1's for leading zeros in bytes
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    result = "1" + result;
  }
  return "z" + result; // 'z' prefix for base58btc
}

/**
 * Generate Ed25519 key pair using node:crypto
 * and Ethereum wallet for blockchain transactions
 */
async function main() {
  console.log("========================================");
  console.log("Decentralized Identity - Key Generation");
  console.log("========================================\n");

  // 1. Generate Ed25519 key pair for credential signing
  console.log("1. Generating Ed25519 Key Pair (for credential signing)");
  console.log("   ─────────────────────────────────────────────────────\n");

  // Since we want raw access to the public key for DID docs, 
  // we use @noble/ed25519 if available, but for a standalone script, 
  // we can use node:crypto's generateKeyPairSync
  const { generateKeyPairSync } = await import("node:crypto");
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");

  // Export to raw bytes
  const privateKeyRaw = privateKey.export({ type: "pkcs8", format: "der" }).slice(-32);
  const publicKeyRaw = publicKey.export({ type: "spki", format: "der" }).slice(-32);

  const privateKeyHex = Buffer.from(privateKeyRaw).toString("hex");
  const publicKeyHex = Buffer.from(publicKeyRaw).toString("hex");
  
  // Create multibase encoded public key (for DID document)
  const multicodecPrefix = new Uint8Array([0xed, 0x01]); // ed25519-pub multicodec
  const publicKeyWithPrefix = new Uint8Array([...multicodecPrefix, ...publicKeyRaw]);
  const publicKeyMultibase = encodeBase58Btc(publicKeyWithPrefix);

  console.log("   Private Key (hex):");
  console.log(`   ${privateKeyHex}\n`);
  console.log("   Public Key (hex):");
  console.log(`   ${publicKeyHex}\n`);
  console.log("   Public Key (multibase for DID document):");
  console.log(`   ${publicKeyMultibase}\n`);

  // 2. Generate Ethereum wallet
  console.log("2. Generating Ethereum Wallet (for blockchain transactions)");
  console.log("   ────────────────────────────────────────────────────────\n");

  const ethPrivateKey = randomBytes(32);
  const ethPrivateKeyHex = ethPrivateKey.toString("hex");

  // For address derivation without heavy deps:
  // Note: Finding the public key from private key without libs is hard.
  // We'll suggest using a library or online tool for the address if we can't derive it here safely.
  // However, many users already have an address.
  console.log("   Private Key (add 0x prefix for MetaMask import):");
  console.log(`   ${ethPrivateKeyHex}\n`);
  console.log("   Note: Import this private key into MetaMask to get your public address.\n");

  // 3. Environment variables summary
  console.log("3. Environment Variables");
  console.log("   ──────────────────────\n");
  console.log("   Add these to your .env.local file:\n");
  console.log("   # Ed25519 Keys (Credential Signing)");
  console.log(`   ISSUER_PRIVATE_KEY=${privateKeyHex}`);
  console.log(`   ISSUER_PUBLIC_KEY=${publicKeyHex}`);
  console.log(`   ISSUER_DID=did:web:your-domain.com\n`);
  console.log("   # Ethereum Wallet (Blockchain Transactions)");
  console.log(`   DEPLOYER_PRIVATE_KEY=${ethPrivateKeyHex}\n`);

  console.log("========================================");
  console.log("Key generation complete!");
  console.log("========================================");
}

main().catch(console.error);

import { randomBytes } from "crypto";
import { base58btc } from "multiformats/bases/base58";

/**
 * Generate Ed25519 key pair for credential signing
 * and Ethereum wallet for blockchain transactions
 */
async function main() {
  console.log("========================================");
  console.log("Decentralized Identity - Key Generation");
  console.log("========================================\n");

  // Generate Ed25519 key pair for credential signing
  console.log("1. Generating Ed25519 Key Pair (for credential signing)");
  console.log("   ─────────────────────────────────────────────────────\n");

  const ed25519PrivateKey = randomBytes(32);
  
  // For Ed25519, we need to use the actual library
  // This is a simplified version - in production use @noble/ed25519
  const { getPublicKey } = await import("@noble/ed25519");
  const ed25519PublicKey = await getPublicKey(ed25519PrivateKey);

  const privateKeyHex = Buffer.from(ed25519PrivateKey).toString("hex");
  const publicKeyHex = Buffer.from(ed25519PublicKey).toString("hex");
  
  // Create multibase encoded public key (for DID document)
  const multicodecPrefix = new Uint8Array([0xed, 0x01]); // ed25519-pub multicodec
  const publicKeyWithPrefix = new Uint8Array([...multicodecPrefix, ...ed25519PublicKey]);
  const publicKeyMultibase = base58btc.encode(publicKeyWithPrefix);

  console.log("   Private Key (hex):");
  console.log(`   ${privateKeyHex}\n`);
  console.log("   Public Key (hex):");
  console.log(`   ${publicKeyHex}\n`);
  console.log("   Public Key (multibase for DID document):");
  console.log(`   ${publicKeyMultibase}\n`);

  // Generate Ethereum wallet for blockchain transactions
  console.log("2. Generating Ethereum Wallet (for blockchain transactions)");
  console.log("   ────────────────────────────────────────────────────────\n");

  const ethPrivateKey = randomBytes(32);
  const ethPrivateKeyHex = Buffer.from(ethPrivateKey).toString("hex");

  // Derive address using keccak256 of public key
  const { secp256k1 } = await import("@noble/curves/secp256k1.js");
  const { keccak_256 } = await import("@noble/hashes/sha3.js");
  
  const ethPublicKey = secp256k1.getPublicKey(ethPrivateKey, false).slice(1); // Remove 0x04 prefix
  const addressHash = keccak_256(ethPublicKey);
  const ethAddress = "0x" + Buffer.from(addressHash.slice(-20)).toString("hex");

  console.log("   Private Key (add 0x prefix for MetaMask import):");
  console.log(`   ${ethPrivateKeyHex}\n`);
  console.log("   Address:");
  console.log(`   ${ethAddress}\n`);

  // Generate DID document template
  console.log("3. DID Document Template");
  console.log("   ──────────────────────\n");

  const appDomain = "your-app.vercel.app"; // Replace with your domain
  const didDocument = {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    id: `did:web:${appDomain}`,
    controller: `did:web:${appDomain}`,
    verificationMethod: [
      {
        id: `did:web:${appDomain}#key-1`,
        type: "Ed25519VerificationKey2020",
        controller: `did:web:${appDomain}`,
        publicKeyMultibase: publicKeyMultibase
      }
    ],
    authentication: ["#key-1"],
    assertionMethod: ["#key-1"]
  };

  console.log("   Save this as /public/.well-known/did.json:\n");
  console.log(JSON.stringify(didDocument, null, 2));

  // Environment variables summary
  console.log("\n\n4. Environment Variables");
  console.log("   ──────────────────────\n");
  console.log("   Add these to your .env.local file:\n");
  console.log("   # Ed25519 Keys (Credential Signing)");
  console.log(`   ISSUER_PRIVATE_KEY=${privateKeyHex}`);
  console.log(`   ISSUER_PUBLIC_KEY=${publicKeyHex}`);
  console.log(`   ISSUER_DID=did:web:${appDomain}\n`);
  console.log("   # Ethereum Wallet (Blockchain Transactions)");
  console.log(`   DEPLOYER_PRIVATE_KEY=${ethPrivateKeyHex}`);
  console.log(`   # After first login, set:`);
  console.log(`   # ISSUER_WALLET_ADDRESS=${ethAddress}\n`);

  console.log("========================================");
  console.log("Key generation complete!");
  console.log("========================================");
  console.log("\nIMPORTANT SECURITY NOTES:");
  console.log("- NEVER commit private keys to version control");
  console.log("- Store private keys securely");
  console.log("- Use different keys for testnet and mainnet");
  console.log("- Back up your keys in a secure location");
}

main().catch(console.error);

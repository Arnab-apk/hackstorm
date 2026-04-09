import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CredentialRegistry contract...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC\n");

  // Deploy the contract
  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const registry = await CredentialRegistry.deploy();
  
  await registry.waitForDeployment();
  
  const contractAddress = await registry.getAddress();
  console.log("CredentialRegistry deployed to:", contractAddress);
  console.log("\nAdd this to your .env file:");
  console.log(`CREDENTIAL_REGISTRY_CONTRACT=${contractAddress}`);

  // Optionally register the deployer as the first issuer
  const registerIssuer = process.env.AUTO_REGISTER_ISSUER === "true";
  
  if (registerIssuer) {
    const issuerDID = process.env.ISSUER_DID || `did:web:localhost`;
    const issuerName = process.env.ISSUER_NAME || "Demo Issuer";
    
    console.log("\nRegistering deployer as trusted issuer...");
    const tx = await registry.registerIssuer(deployer.address, issuerDID, issuerName);
    await tx.wait();
    
    console.log("Issuer registered successfully!");
    console.log("  Address:", deployer.address);
    console.log("  DID:", issuerDID);
    console.log("  Name:", issuerName);
  }

  console.log("\n========================================");
  console.log("Deployment complete!");
  console.log("========================================");
  console.log("\nNext steps:");
  console.log("1. Copy the contract address to your .env file");
  console.log("2. Register issuers using the registerIssuer function");
  console.log("3. Verify the contract on Polygonscan (optional):");
  console.log(`   npx hardhat verify --network polygon_amoy ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

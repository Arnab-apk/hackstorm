import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("Deploying CredentialRegistry contract (minimal version)...\n");

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

  console.log("\n========================================");
  console.log("Deployment complete!");
  console.log("========================================");
  console.log("\nThis minimal contract only supports:");
  console.log("  - anchor(merkleRoot) - Store a merkle root");
  console.log("  - verify(merkleRoot) - Check if root exists");
  console.log("\nIssuer management & revocation are handled in MongoDB.");
  console.log("\nNext steps:");
  console.log("1. Copy the contract address to your .env file");
  console.log("2. Verify the contract on Polygonscan (optional):");
  console.log(`   npx hardhat verify --network polygon_amoy ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

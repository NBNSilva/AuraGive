const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check if USDC address is provided in env, else deploy a test MockERC20
  let usdcAddress = process.env.USDC_TOKEN_ADDRESS || process.env.VITE_USDC_TOKEN_ADDRESS;

  if (!usdcAddress) {
    console.log("No USDC_TOKEN_ADDRESS specified. Deploying MockUSDC token for testing...");
    
    // Minimal Mock ERC20 definition
    const MockToken = await hre.ethers.getContractFactory("MockERC20", {
      // Inline bytecode / abi if needed or use simple factory
    }).catch(async () => {
      return null;
    });

    if (!MockToken) {
      // Polygon Amoy official Circle USDC faucet or testnet token address
      // Can be set to a custom test token address
      usdcAddress = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"; // Polygon Amoy Testnet USDC
      console.log(`Using default Polygon Amoy testnet USDC address: ${usdcAddress}`);
    }
  }

  const DonationEscrow = await hre.ethers.getContractFactory("DonationEscrow");
  const escrow = await DonationEscrow.deploy(usdcAddress);
  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  console.log("==================================================");
  console.log("DonationEscrow deployed to:", escrowAddress);
  console.log("Connected USDC Token:", usdcAddress);
  console.log("Network:", hre.network.name);
  console.log("==================================================");
  console.log(`\nNext step: update your .env files with:`);
  console.log(`VITE_SMART_CONTRACT_ADDRESS=${escrowAddress}`);
  console.log(`SMART_CONTRACT_ADDRESS=${escrowAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

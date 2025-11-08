const hre = require("hardhat");

async function main() {
  console.log("Deploying PatientRecords contract...");

  const PatientRecords = await hre.ethers.getContractFactory("PatientRecords");
  const patientRecords = await PatientRecords.deploy();

  await patientRecords.waitForDeployment();

  const address = await patientRecords.getAddress();
  console.log("PatientRecords deployed to:", address);

  // Save deployment address to a file for frontend use
  const fs = require("fs");
  const deploymentInfo = {
    address: address,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "./deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment.json");
  console.log("\nTo use this contract in your frontend, add this to your .env.local file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


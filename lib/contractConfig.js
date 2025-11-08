// Contract configuration
// This file handles loading the contract address from deployment.json or environment variables

let contractAddress = '';

// In Next.js, NEXT_PUBLIC_* variables are available in both server and client
// Try to get from environment variable first (works in both contexts)
let envAddress = null;
if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
  envAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
} else if (typeof window !== 'undefined' && window.__NEXT_DATA__ && window.__NEXT_DATA__.env) {
  envAddress = window.__NEXT_DATA__.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
}

if (envAddress) {
  contractAddress = envAddress;
} else {
  // Fallback: try to load from deployment.json (only works server-side)
  try {
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const deploymentPath = path.join(process.cwd(), 'deployment.json');
      if (fs.existsSync(deploymentPath)) {
        const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        contractAddress = deployment.address || '';
      }
    }
  } catch (e) {
    // Ignore errors - will use empty string
  }
}

export function getContractAddress() {
  // If still empty, try one more time to get from env (for client-side)
  if (!contractAddress) {
    if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
      contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    }
  }
  return contractAddress;
}

export function setContractAddress(address) {
  contractAddress = address;
}


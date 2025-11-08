import { ethers } from 'ethers';
import { getContractAddress as getContractAddressFromConfig } from './contractConfig';

let provider;
let signer;
let contract;
let contractAddress;

// Contract ABI (simplified - in production, use the full ABI from artifacts)
const CONTRACT_ABI = [
  "function createRecord(string memory _ipfsHash, address _patient, string memory _recordType) public returns (uint256)",
  "function updateRecord(uint256 _recordId, string memory _newIpfsHash)",
  "function grantAccess(address _provider, bool _readAccess, bool _writeAccess)",
  "function revokeAccess(address _provider)",
  "function getPatientRecords(address _patient) public view returns (uint256[])",
  "function getRecord(uint256 _recordId) public view returns (tuple(string ipfsHash, address patient, address provider, uint256 timestamp, string recordType, bool isActive))",
  "function getAccessList(address _patient) public view returns (tuple(address provider, bool hasReadAccess, bool hasWriteAccess, uint256 grantedAt)[])",
  "function hasAccess(address, address) public view returns (bool)",
  "event RecordCreated(uint256 indexed recordId, address indexed patient, address indexed provider, string ipfsHash, string recordType)",
  "event AccessGranted(address indexed patient, address indexed provider, bool readAccess, bool writeAccess)",
  "event AccessRevoked(address indexed patient, address indexed provider)",
  "event RecordUpdated(uint256 indexed recordId, string newIpfsHash)"
];

export async function connectWallet() {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Load contract address from config
      contractAddress = getContractAddressFromConfig();
      if (!contractAddress) {
        throw new Error('Contract not deployed. Please run "npm run deploy" first or set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.');
      }
      contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      return { address, provider, signer, contract };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  } else {
    throw new Error('MetaMask not detected. Please install MetaMask.');
  }
}

export function getProvider() {
  return provider;
}

export function getSigner() {
  return signer;
}

export function getContract() {
  return contract;
}

export function getContractAddress() {
  return contractAddress;
}

export async function getCurrentAccount() {
  if (signer) {
    return await signer.getAddress();
  }
  return null;
}


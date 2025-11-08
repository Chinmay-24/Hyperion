# Hyperion

A secure, decentralized patient record management system built on blockchain and Web3 technologies. Hyperion ensures patient data privacy and security without relying on centralized servers.

## Features

- **Blockchain Storage**: Patient record metadata and access control stored on Ethereum blockchain
- **IPFS Integration**: Actual medical records stored on IPFS (InterPlanetary File System) for decentralized file storage
- **End-to-End Encryption**: All patient data is encrypted before storage
- **Access Control**: Patients can grant/revoke access to healthcare providers
- **Immutable Records**: Once created, records cannot be tampered with
- **No Centralized Servers**: Fully decentralized architecture

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Blockchain**: Ethereum (Hardhat for development)
- **Smart Contracts**: Solidity
- **Storage**: IPFS (InterPlanetary File System)
- **Web3**: Ethers.js
- **Encryption**: CryptoJS (AES encryption)

## Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Hardhat for smart contract development
- IPFS node (or use public IPFS gateway)

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Create a `.env.local` file:
```
NEXT_PUBLIC_IPFS_AUTH=your_ipfs_auth_token_if_using_infura
```

3. **Compile smart contracts**:
```bash
npm run compile
```

4. **Deploy smart contracts** (to local Hardhat network):
```bash
npx hardhat node  # In one terminal
npm run deploy    # In another terminal
```

5. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For Patients

1. **Connect Wallet**: Click "Connect Wallet" and approve the MetaMask connection
2. **Create Records**: Enter your medical record data and create a new record
3. **View Records**: View all your records and decrypt them using your wallet
4. **Manage Access**: Grant or revoke access to healthcare providers

### For Healthcare Providers

1. **Request Access**: Ask patients to grant you access to their records
2. **View Records**: Once granted access, you can view patient records
3. **Create Records**: Create new records for patients (if write access is granted)

## Architecture

### Smart Contract (`PatientRecords.sol`)

- **Record Storage**: Stores IPFS hashes and metadata on blockchain
- **Access Control**: Manages provider access permissions
- **Events**: Emits events for record creation, updates, and access changes

### Frontend Application

- **Web3 Integration**: Connects to MetaMask and interacts with smart contracts
- **IPFS Client**: Uploads and retrieves encrypted data from IPFS
- **Encryption Service**: Handles encryption/decryption of patient data

### Data Flow

1. Patient creates a record with medical data
2. Data is encrypted using patient's wallet-derived key
3. Encrypted data is uploaded to IPFS
4. IPFS hash is stored on blockchain via smart contract
5. Access control is managed on-chain
6. Authorized providers can retrieve and decrypt records

## Security Considerations

- **Encryption**: All data is encrypted before storage
- **Access Control**: Only authorized parties can access records
- **Immutable Audit Trail**: All record operations are logged on blockchain
- **No Central Point of Failure**: Decentralized architecture

## Development

### Testing Smart Contracts

```bash
npm run test
```

### Deploying to Testnet

1. Update `hardhat.config.js` with testnet configuration
2. Add private keys to `.env` (never commit this!)
3. Run deployment script with network flag

## License

MIT

## Disclaimer

This is a proof-of-concept system. For production use, consider:
- Enhanced encryption methods
- HIPAA compliance requirements
- Key management systems
- Backup and recovery mechanisms
- Legal and regulatory compliance


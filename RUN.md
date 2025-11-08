# How to Run Hyperion

## Prerequisites

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Install MetaMask** browser extension (for wallet connection)

## Step-by-Step Instructions

### 1. Start Local Blockchain (Terminal 1)

Open a terminal and run:
```bash
npx hardhat node
```

This starts a local Hardhat network on `http://127.0.0.1:8545`. Keep this terminal running.

### 2. Deploy Smart Contract (Terminal 2)

Open a **new terminal** and run:
```bash
npm run deploy
```

This will:
- Deploy the PatientRecords contract to the local network
- Save the contract address to `deployment.json`
- Display the contract address

**Important**: Copy the contract address and add it to `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...your_contract_address...
```

### 3. Start Development Server (Terminal 2 or 3)

Run:
```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### 4. Connect MetaMask

1. Open http://localhost:3000 in your browser
2. Click "Connect Wallet"
3. Approve the MetaMask connection
4. **Important**: Add the local Hardhat network to MetaMask:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

## Quick Command Reference

```bash
# Install dependencies
npm install

# Compile smart contracts
npm run compile

# Start local blockchain (keep running)
npx hardhat node

# Deploy contract (in new terminal)
npm run deploy

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Troubleshooting

### "Contract not deployed" error
- Make sure you've run `npm run deploy`
- Check that `deployment.json` exists and has an address
- Or set `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`

### MetaMask connection issues
- Make sure MetaMask is installed
- Add the local Hardhat network (Chain ID: 1337)
- Import one of the Hardhat test accounts (private keys shown when you run `npx hardhat node`)

### IPFS errors
- IPFS functions only work in the browser (client-side)
- For production, set up an IPFS node or use Infura IPFS with authentication

## Development Workflow

1. **Terminal 1**: `npx hardhat node` (keep running)
2. **Terminal 2**: `npm run dev` (keep running)
3. **Terminal 3**: Use for deploying contracts when needed

Open http://localhost:3000 and start using Hyperion!


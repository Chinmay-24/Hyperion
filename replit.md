# Hyperion - Decentralized Patient Record System

## Overview
Hyperion is a blockchain-based patient record system built with Next.js 14, Ethereum smart contracts (Hardhat), and IPFS for decentralized storage. The application enables secure patient record management with role-based access control for patients, hospitals, insurance providers, and administrators.

## Project Architecture

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Web3 Integration**: ethers.js, Web3.js, MetaMask
- **Storage**: IPFS (via ipfs-http-client)
- **Encryption**: crypto-js for client-side data encryption

### Smart Contracts
- **Framework**: Hardhat
- **Language**: Solidity 0.8.20
- **Contract**: PatientRecords.sol - manages patient record storage and access control

### Key Components
- `app/` - Next.js app router pages (patient, hospital, insurance, admin dashboards)
- `components/` - React components (AccessControl, Navigation, MedicalTimeline, RecordSearch, EmergencyContacts, PrescriptionTracker)
- `contracts/` - Solidity smart contracts
- `lib/` - Utility libraries (web3, IPFS, encryption, contract config, exportPDF)
- `scripts/` - Deployment scripts
- `test/` - Contract tests

## Replit Environment Setup

### Port Configuration
The application is configured to run on port 5000 with 0.0.0.0 binding for Replit compatibility:
- Development: `next dev -p 5000 -H 0.0.0.0`
- Production: `next start -p 5000 -H 0.0.0.0`

### Security Configuration
The `next.config.js` includes secure cross-origin configuration:
- Uses `REPLIT_DOMAINS` environment variable to restrict allowed dev origins
- Fallback to localhost:5000 and 127.0.0.1:5000 for local development
- Never uses wildcard (`*`) origins for security

### Environment Variables
Required environment variables (set via Replit Secrets):
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Deployed smart contract address
- `NEXT_PUBLIC_IPFS_AUTH` - IPFS/Infura authorization header (optional)

### Deployment Configuration
- **Target**: Autoscale (stateless Next.js application)
- **Build**: `npm run build`
- **Start**: `npm run start`

## Recent Changes (November 2025)

### Migration from Vercel to Replit
- Updated package.json scripts to bind to 0.0.0.0:5000
- Configured allowedDevOrigins with REPLIT_DOMAINS for secure cross-origin requests
- Set up dev-server workflow for automatic Next.js development server
- Configured autoscale deployment settings for production

### UI Modernization
- Implemented modern animations (float, glow, shimmer effects)
- Enhanced glass morphism effects throughout the application
- Added gradient animated text and logo
- Redesigned navigation with better hover states and mobile responsiveness
- Improved home page with color-coded portal cards
- Enhanced patient portal with better tab navigation

### New Features Added
1. **Medical History Timeline** - Visual chronological timeline of patient records with expandable details
2. **Search and Filter** - Advanced search functionality with filters by record type and date range
3. **Emergency Contacts** - Manage emergency contact information with full CRUD operations
4. **Prescription Tracker** - Track medications, dosages, frequencies, and active prescriptions
5. **Export to PDF** - Export medical records to PDF format for printing or sharing
6. **Enhanced Patient Portal** - Six-tab navigation (Records, Timeline, Meds, Emergency, Create, Access)

## Development Workflow

### Running Locally
```bash
npm install
npm run dev
```

The application will be available at http://localhost:5000

### Smart Contract Development
```bash
# Compile contracts
npm run compile

# Deploy contracts
npm run deploy

# Run tests
npm run test
```

### Building for Production
```bash
npm run build
npm run start
```

## Important Notes
- The application requires MetaMask or another Web3 wallet for blockchain interactions
- IPFS is used for decentralized storage of encrypted patient records
- All sensitive patient data is encrypted client-side before being stored on IPFS
- Smart contract address must be set after deployment via `NEXT_PUBLIC_CONTRACT_ADDRESS`
- When running outside Replit, ensure REPLIT_DOMAINS fallback to localhost is sufficient

## User Preferences
- No specific user preferences documented yet

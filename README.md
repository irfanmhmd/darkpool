# Darkpool Aptos - Decentralized Prediction Market

A privacy-focused prediction market built on Aptos blockchain with commit-reveal scheme for secure betting.

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Aptos CLI
- Git

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Deploy Smart Contract
```bash
# Navigate to move directory
cd move

# Compile the contract
aptos move compile

# Deploy to testnet (replace with your account)
aptos move publish --profile testnet
```

### 3. Run Frontend
```bash
# Development server
pnpm dev

# Production build
pnpm build
pnpm start
```

## Project Structure

```
├── move/                   # Smart contracts
│   ├── sources/           # Move source files
│   └── Move.toml         # Move package config
├── app/                   # Next.js pages
├── components/           # React components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and types
└── public/              # Static assets
```

## Testing

```bash
# Test Move contracts
cd move && aptos move test

# Lint frontend
pnpm lint
```

## Environment Setup

Create `.env.local`:
```
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_MODULE_ADDRESS=0x...
```

## Features

✅ **Core Functionality**
- Privacy-preserving commit-reveal betting
- Complete market lifecycle (create → commit → reveal → resolve → claim)
- Automated oracle integration (Pyth + mock for demo)
- XP/leveling gamification system

✅ **Security & Privacy**
- Cryptographic salt generation and storage
- SHA3-256 commitment hashing
- Input validation and error handling
- Anti-front-running protection

✅ **User Experience**
- Wallet integration (Petra, Martian, etc.)
- Real-time market statistics
- Demo data for quick testing
- Responsive UI with dark/light themes

✅ **Developer Experience**
- Comprehensive documentation
- Deployment scripts
- Environment configuration
- Backend service stubs

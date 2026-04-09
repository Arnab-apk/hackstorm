# Project Structure

## Overview

This is a full-stack Next.js 14 application implementing a decentralized identity credential management system with three roles: Issuer, Recipient, and Verifier.

## Directory Tree

```
/
├── app/                                    # Next.js App Router
│   ├── (issuer)/                           # Issuer route group
│   │   ├── layout.tsx                      # Issuer layout with sidebar
│   │   └── issuer/
│   │       ├── page.tsx                    # Dashboard
│   │       ├── issue/page.tsx              # Single credential issuance
│   │       ├── batch/page.tsx              # Batch issuance
│   │       └── credentials/
│   │           ├── page.tsx                # Credentials list
│   │           └── [id]/page.tsx           # Credential detail + revoke
│   │
│   ├── (recipient)/                        # Recipient route group
│   │   ├── layout.tsx                      # Recipient layout with sidebar
│   │   └── wallet/
│   │       ├── page.tsx                    # Wallet dashboard (3 tabs)
│   │       ├── inbox/page.tsx              # Verification requests inbox
│   │       ├── shared/page.tsx             # Active share links
│   │       ├── credentials/[id]/page.tsx   # Credential detail + share
│   │       └── requests/[id]/page.tsx      # Respond to verification request
│   │
│   ├── (verifier)/                         # Verifier route group
│   │   ├── layout.tsx                      # Verifier layout with sidebar
│   │   └── verifier/
│   │       ├── page.tsx                    # Dashboard
│   │       ├── scan/page.tsx               # Scan/verify credential
│   │       └── requests/
│   │           ├── page.tsx                # Requests list
│   │           └── new/page.tsx            # Create verification request
│   │
│   ├── api/                                # API Routes (Backend)
│   │   ├── auth/
│   │   │   ├── login/route.ts              # POST - Login with Web3Auth
│   │   │   ├── logout/route.ts             # POST - Logout
│   │   │   └── session/route.ts            # GET - Get current session
│   │   │
│   │   ├── issuer/
│   │   │   ├── issue/
│   │   │   │   ├── single/route.ts         # POST - Issue single credential
│   │   │   │   └── batch/route.ts          # POST - Issue batch credentials
│   │   │   ├── revoke/route.ts             # POST - Revoke credential
│   │   │   ├── credentials/
│   │   │   │   ├── route.ts                # GET - List all credentials
│   │   │   │   └── [id]/route.ts           # GET - Credential detail
│   │   │   ├── batches/
│   │   │   │   ├── route.ts                # GET - List batches
│   │   │   │   └── [id]/route.ts           # GET - Batch detail
│   │   │   ├── schemas/
│   │   │   │   ├── route.ts                # GET - List schemas
│   │   │   │   └── [id]/route.ts           # GET - Schema detail
│   │   │   └── stats/route.ts              # GET - Dashboard stats
│   │   │
│   │   ├── recipient/
│   │   │   ├── credentials/
│   │   │   │   ├── route.ts                # GET - My credentials
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts            # GET - Credential detail
│   │   │   │       └── claim/route.ts      # POST - Claim credential
│   │   │   ├── share/
│   │   │   │   ├── route.ts                # GET/POST - List/create shares
│   │   │   │   └── [token]/route.ts        # DELETE - Revoke share
│   │   │   ├── requests/
│   │   │   │   ├── route.ts                # GET - Verification requests
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts            # GET - Request detail
│   │   │   │       └── respond/route.ts    # POST - Approve/reject
│   │   │   └── notifications/
│   │   │       ├── route.ts                # GET - List notifications
│   │   │       └── [id]/route.ts           # PATCH - Mark as read
│   │   │
│   │   ├── verifier/
│   │   │   ├── register/route.ts           # POST - Register verifier
│   │   │   ├── profile/route.ts            # GET/PUT - Verifier profile
│   │   │   ├── requests/
│   │   │   │   ├── route.ts                # GET/POST - List/create requests
│   │   │   │   └── [id]/route.ts           # GET/DELETE - Detail/cancel
│   │   │   ├── stats/route.ts              # GET - Dashboard stats
│   │   │   └── notifications/route.ts      # GET - Notifications
│   │   │
│   │   ├── verify/
│   │   │   ├── [token]/route.ts            # GET - Verify share token
│   │   │   ├── credential/route.ts         # POST - Verify raw credential
│   │   │   ├── revocation-status/route.ts  # GET - Check revocation
│   │   │   └── issuer/[address]/route.ts   # GET - Issuer info
│   │   │
│   │   ├── blockchain/
│   │   │   ├── prepare-anchor/route.ts     # POST - Prepare anchor tx
│   │   │   └── confirm-anchor/route.ts     # POST - Confirm anchor
│   │   │
│   │   ├── utils/
│   │   │   └── predict-address/route.ts    # POST - Predict wallet address
│   │   │
│   │   ├── .well-known/
│   │   │   └── did.json/route.ts           # GET - DID document
│   │   │
│   │   └── health/route.ts                 # GET - Health check
│   │
│   ├── login/page.tsx                      # Login page
│   ├── verify/[token]/page.tsx             # Public verification page
│   ├── page.tsx                            # Landing page
│   ├── layout.tsx                          # Root layout
│   └── globals.css                         # Global styles (Spotify theme)
│
├── components/
│   ├── ui/                                 # Base UI components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── data-table.tsx
│   │   ├── dialog.tsx
│   │   ├── empty-state.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── stat-card.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   │
│   └── shared/                             # Shared components
│       ├── app-shell.tsx                   # Main layout wrapper
│       ├── credential-card.tsx             # Credential display card
│       ├── header.tsx                      # Top header with notifications
│       ├── page-header.tsx                 # Page title component
│       └── sidebar.tsx                     # Navigation sidebar
│
├── contracts/
│   └── CredentialRegistry.sol              # Solidity smart contract
│
├── docs/
│   ├── 01-project-requirements-document.md
│   ├── 02-user-flows.md
│   ├── 03-implementation-plans.md
│   ├── 04-screen-requirements.md
│   ├── 05-backend-structure.md
│   └── 06-project-structure.md             # This file
│
├── hooks/
│   ├── use-auth.ts                         # Authentication hook
│   ├── use-credentials.ts                  # Credentials data hook
│   ├── use-notifications.ts                # Notifications hook
│   └── use-requests.ts                     # Verification requests hook
│
├── lib/
│   ├── auth.ts                             # JWT & session management
│   ├── blockchain.ts                       # Blockchain client & interactions
│   ├── contract-abi.ts                     # Smart contract ABI
│   ├── credentials.ts                      # Credential building & signing
│   ├── db.ts                               # MongoDB connection & operations
│   ├── ipfs.ts                             # IPFS/Pinata client
│   ├── merkle.ts                           # Merkle tree operations
│   ├── notifications.ts                    # Notification management
│   ├── response.ts                         # API response helpers
│   ├── roles.ts                            # Role management
│   ├── schemas.ts                          # Credential schemas
│   ├── utils.ts                            # Utility functions
│   └── zkp.ts                              # Zero-knowledge proof helpers
│
├── scripts/
│   ├── deploy-contract.ts                  # Contract deployment script
│   ├── generate-keys.ts                    # Ed25519 key generation
│   ├── seed-demo-data.ts                   # Demo data seeding
│   └── setup-database.ts                   # MongoDB indexes setup
│
├── types/
│   └── index.ts                            # TypeScript type definitions
│
├── .env.example                            # Environment variables template
├── hardhat.config.ts                       # Hardhat configuration
├── middleware.ts                           # Next.js middleware (auth)
├── next.config.js                          # Next.js configuration
├── package.json                            # Dependencies
├── postcss.config.js                       # PostCSS configuration
├── tailwind.config.ts                      # Tailwind CSS configuration
└── tsconfig.json                           # TypeScript configuration
```

## File Counts

| Category | Count |
|----------|-------|
| API Routes | 39 |
| Frontend Pages | 18 |
| UI Components | 15 |
| Shared Components | 5 |
| Core Libraries | 13 |
| Hooks | 4 |
| Scripts | 4 |
| Documentation | 6 |

## Key Architecture Decisions

### 1. Route Groups
Using Next.js route groups `(issuer)`, `(recipient)`, `(verifier)` to:
- Share layouts within each role
- Keep URL structure clean (no `/issuer/issuer/`)
- Enable role-specific sidebars and headers

### 2. Custom UI Components
All UI components are custom implementations (no Radix UI) to:
- Reduce bundle size
- Full control over styling
- Match Spotify-inspired dark theme

### 3. API Structure
Backend follows RESTful conventions:
- Grouped by role/resource
- Consistent response format via `lib/response.ts`
- Authentication via JWT in cookies

### 4. Data Flow

```
Frontend Page
    ↓
SWR Hook (use-*.ts)
    ↓
API Route (/api/*)
    ↓
Library Functions (/lib/*)
    ↓
External Services (MongoDB, IPFS, Blockchain)
```

### 5. Authentication Flow

```
Web3Auth (Social Login)
    ↓
Backend validates token
    ↓
JWT issued (stored in httpOnly cookie)
    ↓
Middleware checks JWT on protected routes
    ↓
Role determined from wallet address
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Database | MongoDB Atlas |
| Storage | IPFS (Pinata) |
| Blockchain | Polygon Amoy (testnet) |
| Authentication | Web3Auth |
| Smart Contracts | Solidity, Hardhat |
| Cryptography | @noble/ed25519, @noble/hashes |

## Configuration Files

| File | Purpose |
|------|---------|
| `.env.example` | Environment variables template |
| `next.config.js` | Next.js settings, externals |
| `tailwind.config.ts` | Theme colors, animations |
| `hardhat.config.ts` | Smart contract compilation & deployment |
| `tsconfig.json` | TypeScript paths, strict mode |

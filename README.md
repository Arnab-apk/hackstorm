# CredVault

CredVault is a decentralized identity MVP for issuing, storing, sharing, and verifying credentials. It uses a Next.js app for the product experience, MongoDB for the demo data layer, Merkle proofs for credential integrity, and a Solidity contract for batch-root anchoring.

The project is built for a hackathon-style credential lifecycle:

1. An issuer creates a credential.
2. The credential is hashed and added to a Merkle tree.
3. The batch Merkle root is anchored.
4. A recipient claims and shares selected fields.
5. A verifier checks proof, anchor, issuer trust, and revocation state.

## Features

- Role-based dashboards for issuer, recipient, and verifier.
- Wallet login with automatic role routing.
- Predefined credential schemas:
  - University Degree
  - Employee ID
  - Event Ticket
  - Professional Certification
  - Age Verification
- Single and batch credential issuing.
- Merkle tree generation and proof verification.
- Selective disclosure through share links.
- Verification requests with private claim checks.
- Revocation state stored in MongoDB.
- Solidity contract for Merkle root anchoring.
- Responsive dark UI with shared dashboard shell.

## Current MVP Notes

This repository is honest MVP code, not a production identity network yet.

- `lib/blockchain.ts` currently uses a MongoDB-backed mock anchor flow and fake transaction hashes.
- `lib/ipfs.ts` currently stores IPFS-like objects in MongoDB and returns fake CIDs.
- `lib/zkp.ts` performs trusted server-side claim checks, not real zero-knowledge proofs.
- Role access is based on configured wallet addresses in environment variables.
- The Solidity contract exists in `contracts/CredentialRegistry.sol`, but the app routes are not fully wired to live contract writes yet.

These shortcuts make the demo easy to run locally while preserving the shape of the final architecture.

## Tech Stack

| Layer | Technology |
| --- | --- |
| App | Next.js, React, TypeScript |
| Styling | Tailwind CSS, custom UI components, lucide-react icons |
| API | Next.js route handlers |
| Database | MongoDB |
| Auth | Wallet login plus JWT session cookie |
| Crypto | Ed25519 signatures, Keccak hashing, Merkle proofs |
| Blockchain | Solidity, Hardhat, Polygon Amoy config |

## Project Structure

```txt
app/
  api/                  Backend route handlers
  (issuer)/issuer/      Issuer dashboard and workflows
  (recipient)/wallet/   Recipient wallet and sharing
  (verifier)/verifier/  Verifier dashboard and requests
  login/                Wallet login page
  verify/[token]/       Public share verification page

components/
  shared/               App shell, sidebar, header, credential cards
  ui/                   Reusable UI primitives

contracts/
  CredentialRegistry.sol

lib/
  auth.ts               JWT sessions and wallet helpers
  blockchain.ts         Mock chain integration layer
  credentials.ts        Credential creation and signing
  db.ts                 MongoDB connection and collection helpers
  ipfs.ts               MongoDB-backed IPFS-like storage
  merkle.ts             Merkle tree and proof logic
  schemas.ts            Credential schema definitions
  zkp.ts                Demo private-claim checks

scripts/
  setup-database.ts
  seed-demo-data.ts
  deploy-contract.ts
  generate-keys.ts
```

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` from the example:

```bash
cp .env.example .env.local
```

Fill the required values:

```env
MONGODB_URI=
MONGODB_DB_NAME=decentralized-identity
JWT_SECRET=
ISSUER_PRIVATE_KEY=
ISSUER_DID=did:web:localhost
ISSUER_WALLET_ADDRESS=
VERIFIER_WALLET_ADDRESS=
CREDENTIAL_REGISTRY_CONTRACT=
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Create database indexes:

```bash
npm run setup:db
```

Optional demo seed:

```bash
npm run seed:demo
```

Start the app:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Smart Contract

Compile:

```bash
npm run compile:contracts
```

Deploy to Polygon Amoy:

```bash
npm run deploy:contracts
```

The current contract stores a packed record for each Merkle root:

- issuer address
- timestamp
- existence flag

Main functions:

- `anchorBatch(bytes32 merkleRoot)`
- `verify(bytes32 merkleRoot)`
- `exists(bytes32 merkleRoot)`

## Main Workflows

### Issuer

- Connect the configured issuer wallet.
- Open `/issuer`.
- Issue a credential or upload a batch.
- The app validates schema data, builds credentials, creates Merkle proofs, signs credentials, and stores records in MongoDB.

### Recipient

- Connect any non-issuer and non-verifier wallet.
- Open `/wallet`.
- View available credentials, claim them, and create selective share links.

### Verifier

- Connect the configured verifier wallet.
- Open `/verifier`.
- Create verification requests or verify shared credential links.

## What To Improve Next

Recommended production upgrades:

1. Replace `lib/blockchain.ts` mock logic with real `viem` contract reads/writes.
2. Expand `CredentialRegistry.sol` with trusted issuer registration.
3. Store full credential JSON on real IPFS or Pinata.
4. Verify Ed25519 signatures during credential verification.
5. Replace demo claim checks with real ZK circuits or rename them as server-assisted checks.
6. Add Zod validation to every API route.
7. Add tests for Merkle proofs, issuing, sharing, revocation, and authorization.
8. Add rate limits and better audit logging for public verification endpoints.

## Useful Scripts

```bash
npm run dev                 # Start Next.js
npm run build               # Production build
npm run start               # Start production server
npm run setup:db            # Create MongoDB collections and indexes
npm run seed:demo           # Seed demo data
npm run generate:keys       # Generate issuer signing keys
npm run compile:contracts   # Compile Solidity contract
npm run deploy:contracts    # Deploy contract to Polygon Amoy
```

## License

This project is a hackathon MVP. Add a license before publishing or reusing it publicly.

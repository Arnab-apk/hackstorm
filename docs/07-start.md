# Getting Started Guide

Complete guide to set up and run the Decentralized Identity System.

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB Atlas account (free tier works)
- Pinata account (free tier works)
- Web3Auth account (free tier works)
- MetaMask browser extension

## Quick Start (5 Steps)

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Generate issuer keys
pnpm generate:keys

# 4. Fill in .env.local (see detailed setup below)

# 5. Run development server
pnpm dev
```

---

## Detailed Setup

### Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user with read/write access
4. Get your connection string
5. Whitelist IP `0.0.0.0/0` for development (or your specific IP)

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/decentralized-identity?retryWrites=true&w=majority
MONGODB_DB_NAME=decentralized-identity
```

6. Run database setup script:
```bash
pnpm tsx scripts/setup-database.ts
```

This creates collections and indexes.

---

### Step 2: Pinata (IPFS) Setup

1. Go to [Pinata](https://app.pinata.cloud)
2. Sign up for free account
3. Go to API Keys → New Key
4. Create key with all permissions
5. Copy API Key, Secret, and JWT

```env
PINATA_API_KEY=your-api-key
PINATA_SECRET_KEY=your-secret-key
PINATA_JWT=your-jwt-token
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs
```

---

### Step 3: Web3Auth Setup

1. Go to [Web3Auth Dashboard](https://dashboard.web3auth.io)
2. Create a new project
3. Select "Plug and Play" → "Web"
4. Network: `Sapphire Devnet` (for testing)
5. Copy Client ID

```env
WEB3AUTH_CLIENT_ID=your-client-id
WEB3AUTH_CLIENT_SECRET=your-client-secret
WEB3AUTH_VERIFIER=decentralized-identity-verifier
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your-client-id
WEB3AUTH_NETWORK=sapphire_devnet
```

---

### Step 4: Generate Issuer Keys

Run the key generation script:

```bash
pnpm generate:keys
```

This outputs:
```
========================================
ISSUER KEY PAIR GENERATED
========================================

Add these to your .env.local file:

ISSUER_PRIVATE_KEY=abc123...
ISSUER_PUBLIC_KEY=def456...

========================================
```

Copy these values to your `.env.local`.

---

### Step 5: Deploy Smart Contract

#### Get Test MATIC

1. Go to [Polygon Amoy Faucet](https://faucet.polygon.technology/)
2. Connect your MetaMask wallet
3. Request test MATIC for Amoy testnet

#### Configure Deployer Wallet

Export your MetaMask private key (for deployment only):
1. MetaMask → Account Details → Export Private Key
2. Add to `.env.local`:

```env
DEPLOYER_PRIVATE_KEY=your-metamask-private-key
```

**Warning:** Never commit this key. Use a dedicated test wallet.

#### Deploy Contract

```bash
# Compile contract
pnpm compile:contracts

# Deploy to Polygon Amoy
pnpm deploy:contracts
```

Output:
```
Deploying CredentialRegistry...
Contract deployed to: 0x1234567890abcdef...
Transaction hash: 0xabc123...

Add to your .env.local:
CREDENTIAL_REGISTRY_CONTRACT=0x1234567890abcdef...
```

Copy the contract address to `.env.local`.

> **Note:** The contract is now minimal - it only stores merkle roots for credential batches. Issuer management and revocation are handled in MongoDB for gas efficiency.

---

### Step 6: Configure Role Addresses

You need to assign Gmail accounts to roles. First run the app and log in with each account to get their wallet addresses.

1. Start the app: `pnpm dev`
2. Log in with your issuer Gmail account
3. Check browser console or network tab for wallet address
4. Repeat for verifier account

```env
ISSUER_WALLET_ADDRESS=0x... (from issuer-demo@gmail.com login)
VERIFIER_WALLET_ADDRESS=0x... (from verifier-demo@gmail.com login)
```

---

### Step 7: Register Issuer in MongoDB

After getting the issuer wallet address, register it in MongoDB:

```bash
pnpm tsx scripts/register-issuer.ts
```

Or manually insert via MongoDB Compass/Atlas:

```javascript
db.issuers.insertOne({
  _id: "issuer-1",
  address: "0x742d35Cc...", // Your ISSUER_WALLET_ADDRESS
  did: "did:web:localhost",
  name: "Demo University",
  active: true,
  registeredAt: new Date(),
  updatedAt: new Date()
})
```

This registers the issuer as trusted in the system. Only trusted issuers can have their credentials verified.

---

### Step 8: Configure Session Secret

Generate a secure random string (32+ characters):

```bash
openssl rand -base64 32
```

```env
JWT_SECRET=your-generated-secret-min-32-characters
SESSION_EXPIRY=7d
```

---

## Complete .env.local Example

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Issuer Keys (from generate:keys)
ISSUER_PRIVATE_KEY=abc123def456...
ISSUER_PUBLIC_KEY=789xyz...
ISSUER_DID=did:web:localhost

# Blockchain
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_CHAIN_ID=80002
CREDENTIAL_REGISTRY_CONTRACT=0x1234567890abcdef...
DEPLOYER_PRIVATE_KEY=your-metamask-key

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/decentralized-identity
MONGODB_DB_NAME=decentralized-identity

# IPFS (Pinata)
PINATA_API_KEY=abc123
PINATA_SECRET_KEY=xyz789
PINATA_JWT=eyJ...
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs

# Web3Auth
WEB3AUTH_CLIENT_ID=BDf4...
WEB3AUTH_CLIENT_SECRET=secret...
WEB3AUTH_VERIFIER=decentralized-identity-verifier
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BDf4...
WEB3AUTH_NETWORK=sapphire_devnet

# Role Assignment
ISSUER_WALLET_ADDRESS=0x742d35Cc...
VERIFIER_WALLET_ADDRESS=0x891a22Ff...

# Session
JWT_SECRET=super-secret-key-at-least-32-chars-long
SESSION_EXPIRY=7d
```

---

## Running the Application

### Development Mode

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
pnpm build
pnpm start
```

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add all environment variables from `.env.local`
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
5. Update `ISSUER_DID` to match your domain

### 3. Update DID After Deployment

Once deployed, update:

```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
ISSUER_DID=did:web:your-app.vercel.app
```

---

## Testing the System

### Test Flow 1: Issue Credential

1. Log in as Issuer (issuer-demo@gmail.com)
2. Go to Issue → Single
3. Select "University Degree" schema
4. Enter recipient email (user-demo@gmail.com)
5. Fill in credential data
6. Click "Issue Credential"
7. Approve MetaMask transaction

### Test Flow 2: Claim Credential

1. Log out
2. Log in as Recipient (user-demo@gmail.com)
3. Go to Wallet
4. See credential in "Available" tab
5. Click "Claim"

### Test Flow 3: Share Credential

1. As Recipient, click credential
2. Click "Share"
3. Toggle fields to hide (e.g., GPA)
4. Set expiry (optional)
5. Click "Generate Link"
6. Copy share link

### Test Flow 4: Verify Credential

1. Open share link in incognito/new browser
2. See verification result with disclosed fields
3. Verify checkmarks for merkle proof, blockchain anchor, revocation status

### Test Flow 5: Request Verification (ZKP)

1. Log in as Verifier (verifier-demo@gmail.com)
2. Go to Requests → New Request
3. Enter recipient wallet address
4. Select credential type
5. Add claims (e.g., "GPA > 3.0")
6. Submit request
7. Log in as Recipient
8. Go to Inbox
9. Review and approve request
10. Verifier sees ZKP result

---

## Troubleshooting

### MongoDB Connection Error

```
Error: MongoServerError: bad auth
```

**Solution:** Check username/password in connection string. Make sure to URL-encode special characters.

### Contract Deployment Fails

```
Error: insufficient funds for gas
```

**Solution:** Get more test MATIC from [faucet](https://faucet.polygon.technology/).

### Web3Auth Login Fails

```
Error: Invalid clientId
```

**Solution:** Ensure `WEB3AUTH_CLIENT_ID` and `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` are the same value.

### IPFS Upload Fails

```
Error: Unauthorized
```

**Solution:** Check Pinata JWT token is correct and not expired.

### Role Not Recognized

User sees wrong dashboard (e.g., issuer sees recipient view).

**Solution:** Ensure `ISSUER_WALLET_ADDRESS` and `VERIFIER_WALLET_ADDRESS` match the actual wallet addresses generated by Web3Auth for those email accounts.

---

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| Development | `pnpm dev` | Start dev server |
| Build | `pnpm build` | Production build |
| Start | `pnpm start` | Start production server |
| Generate Keys | `pnpm generate:keys` | Generate Ed25519 issuer keys |
| Compile Contracts | `pnpm compile:contracts` | Compile Solidity contracts |
| Deploy Contracts | `pnpm deploy:contracts` | Deploy to Polygon Amoy |
| Setup Database | `pnpm setup:db` | Create MongoDB indexes |
| Register Issuer | `pnpm register:issuer` | Register issuer in MongoDB |
| Seed Demo Data | `pnpm seed:demo` | Add sample data |

---

## Security Checklist

Before going to production:

- [ ] Use production Web3Auth network (`sapphire_mainnet`)
- [ ] Deploy contract to Polygon Mainnet
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Remove DEPLOYER_PRIVATE_KEY from production env
- [ ] Enable MongoDB IP whitelist
- [ ] Set up proper CORS headers
- [ ] Enable rate limiting
- [ ] Add request validation
- [ ] Set up monitoring and alerts

---

## Support

For issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review debug logs in browser console
3. Check API responses in Network tab
4. Verify all environment variables are set

For hackathon-specific questions, refer to the documentation in `/docs` folder.

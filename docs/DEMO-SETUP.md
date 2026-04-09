# CredVault - Demo Setup Guide for Hackathon Judges

Complete step-by-step guide to set up and demonstrate the Decentralized Identity Verification System.

---

## Table of Contents

1. [Quick Overview](#quick-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [MongoDB Setup](#mongodb-setup)
5. [IPFS (Pinata) Setup](#ipfs-pinata-setup)
6. [Smart Contract Deployment](#smart-contract-deployment)
7. [Running the Application](#running-the-application)
8. [Demo Walkthrough](#demo-walkthrough)
9. [Troubleshooting](#troubleshooting)

---

## Quick Overview

**What is CredVault?**

A decentralized credential management system where:
- **Issuers** (universities, employers) issue verifiable credentials
- **Recipients** (students, employees) claim and selectively share credentials
- **Verifiers** (companies, institutions) verify credentials with ZKP-style proofs

**Tech Stack:**
- Next.js 16 + React 19
- MongoDB Atlas (credential storage)
- IPFS/Pinata (credential JSON storage)
- Polygon Amoy Testnet (merkle root anchoring)
- MetaMask (wallet authentication)

---

## Prerequisites

Install these before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| pnpm | Latest | `npm install -g pnpm` |
| MetaMask | Latest | [metamask.io](https://metamask.io) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

**Accounts needed (all free tier):**
- [MongoDB Atlas](https://cloud.mongodb.com) - Database
- [Pinata](https://app.pinata.cloud) - IPFS storage
- [Polygon Faucet](https://faucet.polygon.technology) - Test MATIC

---

## Environment Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-repo/credvault.git
cd credvault

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
```

### Step 2: Generate Issuer Keys

```bash
pnpm generate:keys
```

This outputs Ed25519 key pairs. Copy them to `.env.local`:

```env
ISSUER_PRIVATE_KEY=<generated-private-key>
ISSUER_PUBLIC_KEY=<generated-public-key>
ISSUER_DID=did:web:localhost
```

### Step 3: Generate Session Secret

```bash
# Generate a secure random string
openssl rand -base64 32
```

Add to `.env.local`:

```env
JWT_SECRET=<generated-secret-min-32-chars>
SESSION_EXPIRY=7d
```

---

## MongoDB Setup

### Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign up / Log in
3. Click **"Build a Database"**
4. Select **FREE Shared** tier
5. Choose a cloud provider (AWS recommended)
6. Select a region close to you
7. Click **"Create Cluster"** (takes 1-3 minutes)

### Step 2: Create Database User

1. Go to **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Authentication: **Password**
4. Username: `credvault-admin`
5. Password: Generate or create a strong password
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

### Step 3: Configure Network Access

1. Go to **Security** → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for demo purposes)
   - This adds `0.0.0.0/0`
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **Database** → **Connect**
2. Select **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string

It looks like:
```
mongodb+srv://credvault-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 5: Add to Environment

Replace `<password>` with your actual password and add database name:

```env
MONGODB_URI=mongodb+srv://credvault-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/credvault?retryWrites=true&w=majority
MONGODB_DB_NAME=credvault
```

### Step 6: Initialize Database

```bash
pnpm setup:db
```

This creates all necessary collections and indexes.

---

## IPFS (Pinata) Setup

### Step 1: Create Pinata Account

1. Go to [Pinata](https://app.pinata.cloud)
2. Sign up for a free account
3. Verify your email

### Step 2: Generate API Keys

1. Go to **API Keys** in the sidebar
2. Click **"New Key"**
3. Key name: `credvault-demo`
4. Permissions: Select **ALL** (Admin)
5. Click **"Create Key"**

### Step 3: Copy Credentials

You'll see three values:
- **API Key**: `abc123...`
- **API Secret**: `xyz789...`
- **JWT**: `eyJ...` (very long string)

**IMPORTANT:** Save the JWT immediately - it's only shown once!

### Step 4: Add to Environment

```env
PINATA_API_KEY=abc123...
PINATA_SECRET_KEY=xyz789...
PINATA_JWT=eyJ...
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs
```

---

## Smart Contract Deployment

### Step 1: Setup MetaMask for Polygon Amoy

1. Open MetaMask
2. Click network dropdown → **"Add Network"**
3. Add these details:

| Field | Value |
|-------|-------|
| Network Name | Polygon Amoy Testnet |
| RPC URL | `https://rpc-amoy.polygon.technology` |
| Chain ID | `80002` |
| Currency Symbol | `MATIC` |
| Block Explorer | `https://amoy.polygonscan.com` |

### Step 2: Get Test MATIC

1. Go to [Polygon Faucet](https://faucet.polygon.technology/)
2. Select **Amoy** network
3. Paste your MetaMask wallet address
4. Complete verification and request tokens
5. Wait for tokens to arrive (usually 1-2 minutes)

**Alternative Faucets:**
- [Alchemy Faucet](https://www.alchemy.com/faucets/polygon-amoy)
- [QuickNode Faucet](https://faucet.quicknode.com/polygon/amoy)

### Step 3: Export Deployer Private Key

1. Open MetaMask
2. Click three dots → **"Account Details"**
3. Click **"Export Private Key"**
4. Enter your MetaMask password
5. Copy the private key

**WARNING:** Never share this key or commit it to git!

### Step 4: Add to Environment

```env
DEPLOYER_PRIVATE_KEY=your-metamask-private-key
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_CHAIN_ID=80002
```

### Step 5: Compile and Deploy

```bash
# Compile the smart contract
pnpm compile:contracts

# Deploy to Polygon Amoy
pnpm deploy:contracts
```

Expected output:
```
Deploying CredentialRegistry...
Contract deployed to: 0x1234567890abcdef...
Transaction hash: 0xabc123...
```

### Step 6: Add Contract Address

```env
CREDENTIAL_REGISTRY_CONTRACT=0x1234567890abcdef...
```

---

## Running the Application

### Step 1: Configure Role Addresses

You need **two separate MetaMask wallets** (or accounts) for demo:

1. **Issuer Wallet** - For issuing credentials
2. **Verifier Wallet** - For verification requests
3. **Recipient** - Any other wallet (user role)

Get wallet addresses from MetaMask and add to `.env.local`:

```env
ISSUER_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
VERIFIER_WALLET_ADDRESS=0x891a22Ff5e5A7c8B345d12345678901234567890
```

### Step 2: Register Issuer

```bash
pnpm register:issuer
```

This registers the issuer wallet in MongoDB as a trusted credential issuer.

### Step 3: Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Walkthrough

### Demo Flow 1: Issue a Credential (Issuer)

1. **Connect Wallet** - Use the ISSUER wallet in MetaMask
2. Click **"Connect Wallet"** on login page
3. Approve connection in MetaMask
4. You'll be redirected to **Issuer Dashboard**

**Issue Single Credential:**
1. Click **"Issue"** → **"Single Credential"**
2. Select schema: **"University Degree"**
3. Enter recipient details:
   - Email: `demo-student@example.com`
   - Name: `John Doe`
   - Degree: `Bachelor of Computer Science`
   - University: `Demo University`
   - GPA: `3.8`
   - Graduation Year: `2024`
4. Click **"Issue Credential"**
5. Approve the blockchain transaction in MetaMask
6. Wait for confirmation

### Demo Flow 2: Claim Credential (Recipient)

1. **Switch MetaMask** to a different wallet (recipient wallet)
2. Go to [http://localhost:3000/login](http://localhost:3000/login)
3. Click **"Connect Wallet"**
4. You'll be redirected to **Recipient Wallet**

**Claim the Credential:**
1. Go to **"Inbox"** tab
2. You'll see the pending credential
3. Click **"Claim"**
4. The credential moves to your wallet

### Demo Flow 3: Share Credential with Selective Disclosure

1. Go to **"My Credentials"** tab
2. Click on the claimed credential
3. Click **"Share"**
4. **Toggle off fields you want to hide** (e.g., GPA)
5. Set expiry: **7 days**
6. Click **"Generate Share Link"**
7. Copy the generated link

**Verify the Share Link:**
1. Open the link in a new browser/incognito window
2. See the verification page showing:
   - Disclosed fields (visible)
   - Hidden fields (marked as hidden)
   - Verification status (blockchain anchored, not revoked)

### Demo Flow 4: ZKP Verification Request (Verifier)

1. **Switch MetaMask** to VERIFIER wallet
2. Go to [http://localhost:3000/login](http://localhost:3000/login)
3. Connect wallet → redirects to **Verifier Dashboard**

**Create Verification Request:**
1. Click **"New Request"**
2. Enter recipient wallet address (the recipient from Demo 2)
3. Select credential type: **"University Degree"**
4. Add claims:
   - Type: `greaterThan`, Field: `gpa`, Value: `3.0`
   - Type: `equals`, Field: `degree`, Value: `Bachelor of Computer Science`
5. Click **"Submit Request"**

**Recipient Responds:**
1. Switch to recipient wallet
2. Go to **Wallet** → **"Requests"** tab
3. See the pending verification request
4. Click **"Respond"**
5. Review what will be disclosed
6. Click **"Approve"**

**Verifier Sees Result:**
1. Switch back to verifier wallet
2. Go to **"Requests"** tab
3. See the completed verification with ZKP proof

### Demo Flow 5: Revoke Credential (Issuer)

1. Switch to issuer wallet
2. Go to **"Credentials"** tab
3. Find the issued credential
4. Click **"Revoke"**
5. Enter reason: `"Degree revoked due to academic misconduct"`
6. Confirm revocation

**Verify Revocation:**
1. Try to verify the share link from Demo 3
2. It now shows **"Credential Revoked"** status

---

## Complete .env.local Template

```env
# ===========================================
# APPLICATION
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# ISSUER CONFIGURATION
# ===========================================
ISSUER_PRIVATE_KEY=<from-generate-keys>
ISSUER_PUBLIC_KEY=<from-generate-keys>
ISSUER_DID=did:web:localhost

# ===========================================
# BLOCKCHAIN (Polygon Amoy)
# ===========================================
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_CHAIN_ID=80002
CREDENTIAL_REGISTRY_CONTRACT=<deployed-contract-address>
DEPLOYER_PRIVATE_KEY=<metamask-private-key>

# ===========================================
# DATABASE (MongoDB Atlas)
# ===========================================
MONGODB_URI=mongodb+srv://credvault-admin:<password>@cluster0.xxxxx.mongodb.net/credvault?retryWrites=true&w=majority
MONGODB_DB_NAME=credvault

# ===========================================
# IPFS (Pinata)
# ===========================================
PINATA_API_KEY=<your-api-key>
PINATA_SECRET_KEY=<your-secret-key>
PINATA_JWT=<your-jwt-token>
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs

# ===========================================
# ROLE ASSIGNMENT
# ===========================================
ISSUER_WALLET_ADDRESS=<issuer-metamask-address>
VERIFIER_WALLET_ADDRESS=<verifier-metamask-address>

# ===========================================
# SESSION
# ===========================================
JWT_SECRET=<generated-secret-min-32-chars>
SESSION_EXPIRY=7d
```

---

## Troubleshooting

### "Connect Wallet" does nothing

**Cause:** MetaMask not installed or not on correct network

**Fix:**
1. Install MetaMask extension
2. Switch to Polygon Amoy network
3. Refresh the page

### MongoDB Connection Failed

**Error:** `MongoServerError: bad auth`

**Fix:**
1. Check username/password in connection string
2. URL-encode special characters in password
3. Verify IP whitelist includes your IP

### Contract Deployment: "Insufficient funds"

**Error:** `insufficient funds for gas`

**Fix:**
1. Get more test MATIC from [faucet](https://faucet.polygon.technology)
2. Wait for transaction to confirm
3. Try again

### Credential Not Appearing in Inbox

**Cause:** Recipient address mismatch

**Fix:**
1. When issuing, enter the recipient's wallet address (not email)
2. Or use the predict address feature to match email to address

### IPFS Upload Failed

**Error:** `Pinata: Unauthorized`

**Fix:**
1. Verify `PINATA_JWT` is correct and complete
2. Check API key has admin permissions
3. JWT may have expired - regenerate in Pinata dashboard

### Role Not Recognized (Wrong Dashboard)

**Cause:** Wallet address doesn't match env vars

**Fix:**
1. Verify `ISSUER_WALLET_ADDRESS` matches your issuer MetaMask
2. Verify `VERIFIER_WALLET_ADDRESS` matches your verifier MetaMask
3. Restart the dev server after changing env vars

---

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm generate:keys` | Generate issuer Ed25519 keys |
| `pnpm compile:contracts` | Compile Solidity contract |
| `pnpm deploy:contracts` | Deploy contract to Polygon Amoy |
| `pnpm setup:db` | Initialize MongoDB collections |
| `pnpm register:issuer` | Register issuer in MongoDB |

---

## Architecture Highlights (For Judges)

1. **Minimal Smart Contract** - Only stores merkle roots (~150K gas deployment vs 3M)
2. **Off-chain Credential Storage** - Full W3C VCs stored on IPFS
3. **Selective Disclosure** - Share only specific fields
4. **ZKP-style Verification** - Prove claims without revealing data
5. **Role-based Access** - Wallet address determines user role
6. **Merkle Tree Proofs** - Batch credential anchoring for efficiency

---

## Support

If you encounter issues during the demo:
1. Check browser console for errors
2. Check terminal for API errors
3. Verify all env vars are set correctly
4. Ensure MetaMask is on Polygon Amoy network

Good luck with the demo!

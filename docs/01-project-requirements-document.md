# Project Requirements Document (PRD)

## Decentralized Identity Verification System

**Version:** 1.0  
**Date:** April 2026  
**Project Type:** Hackathon MVP

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [System Overview](#4-system-overview)
5. [User Roles](#5-user-roles)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Technical Architecture](#8-technical-architecture)
9. [Data Models](#9-data-models)
10. [Smart Contract Specifications](#10-smart-contract-specifications)
11. [Integration Requirements](#11-integration-requirements)
12. [Security Requirements](#12-security-requirements)
13. [Constraints and Assumptions](#13-constraints-and-assumptions)
14. [Glossary](#14-glossary)

---

## 1. Executive Summary

### 1.1 Project Overview

This project implements a decentralized identity verification system that enables secure creation, verification, and controlled sharing of identity credentials. The system follows the W3C Verifiable Credentials standard and leverages blockchain technology for immutable anchoring of credential proofs.

### 1.2 Key Value Propositions

- **User Ownership:** Users maintain complete control over their identity data
- **Selective Disclosure:** Users choose exactly what information to reveal
- **Cryptographic Verification:** All credentials are cryptographically verifiable
- **Decentralized Trust:** No single point of failure or central authority
- **Privacy-Preserving:** Zero-knowledge proofs enable verification without data exposure

### 1.3 Target Users

- **Issuers:** Organizations that issue credentials (universities, employers, government)
- **Recipients/Users:** Individuals who receive and manage their credentials
- **Verifiers:** Entities that need to verify credential claims

---

## 2. Problem Statement

### 2.1 Current Challenges

Digital identity systems are critical for access control and verification, yet they face significant challenges:

1. **Centralization Vulnerabilities**
   - Single points of failure
   - Data breaches expose millions of records
   - Central authorities can be compromised

2. **Limited User Control**
   - Users cannot control how their data is stored
   - No selective disclosure capabilities
   - Data shared is often more than necessary

3. **Verification Inefficiencies**
   - Manual verification processes are slow
   - Cross-border credential verification is difficult
   - Credential fraud is hard to detect

4. **Privacy Concerns**
   - Unnecessary data exposure during verification
   - Data aggregation by third parties
   - Lack of audit trails for data access

### 2.2 Impact

- Identity theft affects millions annually
- Credential fraud costs billions in damages
- Verification delays slow down hiring, admissions, and access control
- Users have no visibility into how their data is used

---

## 3. Project Objectives

### 3.1 Primary Objectives

| Objective | Success Criteria |
|-----------|------------------|
| Decentralized credential issuance | Credentials anchored on blockchain with merkle proofs |
| User-controlled identity | Users can claim, store, and selectively share credentials |
| Privacy-preserving verification | ZKP-based verification reveals only necessary claims |
| Tamper-proof records | On-chain anchoring prevents credential forgery |

### 3.2 Hackathon-Specific Goals

- Demonstrate full credential lifecycle (issue → claim → verify)
- Single issuer, single verifier, multiple users
- Functional MVP with core features
- Clean, intuitive user interface

### 3.3 Out of Scope (for MVP)

- Multiple issuer registration workflow
- Advanced ZKP circuits (using trusted server model)
- Mobile native applications
- Credential revocation on-chain (using MongoDB for MVP)
- Internationalization/localization

---

## 4. System Overview

### 4.1 Three-Phase Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     ISSUER      │     │      USER       │     │    VERIFIER     │
│                 │     │   (Recipient)   │     │                 │
│  - Issues creds │────▶│  - Claims creds │────▶│  - Requests     │
│  - Anchors root │     │  - Stores local │     │    verification │
│  - Manages      │     │  - Shares       │     │  - Receives ZKP │
│    revocation   │     │  - Approves     │     │    responses    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │     INFRASTRUCTURE      │
                    │                         │
                    │  - Polygon Blockchain   │
                    │  - IPFS Storage         │
                    │  - MongoDB Index        │
                    │  - Web3Auth Identity    │
                    └─────────────────────────┘
```

### 4.2 Core Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Smart Contract | Solidity / Polygon | Trusted issuer registry, merkle root anchoring |
| Credential Storage | IPFS (Pinata) | Decentralized, permanent credential storage |
| Index Database | MongoDB Atlas | Query layer, mutable state (claims, revocations) |
| Authentication | Web3Auth | Social login, wallet generation, address prediction |
| Local Storage | MetaMask Snaps | Client-side credential caching |
| Frontend | Next.js | Dashboard interfaces for all roles |

### 4.3 Trust Model

```
Trust flows from:

1. Blockchain (Polygon)
   └── Immutable record of merkle roots
   └── Trusted issuer registry
   └── Timestamp proof

2. Cryptographic Signatures
   └── Issuer signs credentials with Ed25519
   └── Users sign verifications with wallet key
   └── Merkle proofs link credentials to anchored roots

3. Decentralized Identifiers (DIDs)
   └── Issuer: did:web (with hosted DID document)
   └── Users: did:pkh (derived from wallet address)
   └── Verifiers: did:pkh (derived from wallet address)
```

---

## 5. User Roles

### 5.1 Issuer

**Definition:** An authorized entity that creates and issues verifiable credentials.

**Characteristics:**
- Single issuer for hackathon demo
- Assigned specific Gmail account for Web3Auth login
- Wallet address registered in smart contract as trusted issuer
- Hosts DID document at `/.well-known/did.json`

**Capabilities:**
- Create credential schemas (pre-defined for MVP)
- Issue single credentials
- Issue batch credentials via CSV upload
- View all issued credentials
- Revoke credentials
- Anchor merkle roots on-chain

**Authentication:**
- Web3Auth social login with assigned Gmail
- MetaMask for transaction signing (gas payment)

### 5.2 User (Recipient)

**Definition:** An individual who receives, stores, and controls their credentials.

**Characteristics:**
- Any person with a Gmail/social account
- Wallet address predicted from email at issuance time
- DID derived from wallet address (did:pkh)

**Capabilities:**
- View available credentials (unclaimed)
- Claim credentials to local wallet (Snap storage)
- View claimed credentials
- View revoked credentials
- Create share links with selective disclosure
- Approve/reject verification requests from verifiers
- Manage share tokens (view, revoke)

**Authentication:**
- Web3Auth social login with any supported provider
- Automatic wallet generation on first login

### 5.3 Verifier

**Definition:** An entity that needs to verify credential claims about users.

**Characteristics:**
- Single verifier for hackathon demo
- Assigned specific Gmail account for Web3Auth login
- DID derived from wallet address (did:pkh)
- Registers profile with name, type, website

**Capabilities:**
- Register verifier profile
- Create verification requests targeting specific users
- Specify claim requirements (equals, greaterThan, reveal, etc.)
- View request status (pending, approved, rejected, expired)
- View ZKP-based responses from users
- Access verification history

**Authentication:**
- Web3Auth social login with assigned Gmail
- Profile registration required before creating requests

---

## 6. Functional Requirements

### 6.1 Issuer Functional Requirements

#### 6.1.1 Authentication and Access

| ID | Requirement | Priority |
|----|-------------|----------|
| ISS-AUTH-01 | Issuer shall authenticate via Web3Auth social login | Must Have |
| ISS-AUTH-02 | System shall verify issuer wallet address is registered in smart contract | Must Have |
| ISS-AUTH-03 | Non-registered addresses shall be denied access to issuer dashboard | Must Have |

#### 6.1.2 Credential Schema Management

| ID | Requirement | Priority |
|----|-------------|----------|
| ISS-SCHEMA-01 | System shall provide pre-defined credential schemas | Must Have |
| ISS-SCHEMA-02 | Each schema shall define required and optional fields | Must Have |
| ISS-SCHEMA-03 | Each schema shall define which fields are hideable for selective disclosure | Must Have |
| ISS-SCHEMA-04 | System shall support field types: string, number, date, select | Must Have |

#### 6.1.3 Single Credential Issuance

| ID | Requirement | Priority |
|----|-------------|----------|
| ISS-SINGLE-01 | Issuer shall select a credential schema before issuance | Must Have |
| ISS-SINGLE-02 | System shall render dynamic form based on selected schema | Must Have |
| ISS-SINGLE-03 | Issuer shall enter recipient email address | Must Have |
| ISS-SINGLE-04 | System shall predict recipient wallet address from email via Web3Auth | Must Have |
| ISS-SINGLE-05 | System shall validate form data against schema | Must Have |
| ISS-SINGLE-06 | System shall show credential preview before issuance | Must Have |
| ISS-SINGLE-07 | System shall build W3C Verifiable Credential structure | Must Have |
| ISS-SINGLE-08 | System shall upload credential to IPFS and retrieve CID | Must Have |
| ISS-SINGLE-09 | System shall generate merkle tree (single leaf for single credential) | Must Have |
| ISS-SINGLE-10 | System shall prompt MetaMask for transaction signing | Must Have |
| ISS-SINGLE-11 | System shall anchor merkle root on Polygon via smart contract | Must Have |
| ISS-SINGLE-12 | System shall store credential index in MongoDB | Must Have |
| ISS-SINGLE-13 | System shall display success confirmation with credential details | Must Have |

#### 6.1.4 Batch Credential Issuance

| ID | Requirement | Priority |
|----|-------------|----------|
| ISS-BATCH-01 | Issuer shall select a credential schema before batch upload | Must Have |
| ISS-BATCH-02 | System shall provide downloadable CSV template for selected schema | Must Have |
| ISS-BATCH-03 | Issuer shall upload CSV file with credential data | Must Have |
| ISS-BATCH-04 | System shall parse and validate all CSV rows against schema | Must Have |
| ISS-BATCH-05 | System shall display validation results (valid, invalid, warnings) | Must Have |
| ISS-BATCH-06 | System shall predict wallet addresses for all recipient emails | Must Have |
| ISS-BATCH-07 | Issuer shall confirm batch issuance after reviewing validation | Must Have |
| ISS-BATCH-08 | System shall build credentials for all valid rows | Must Have |
| ISS-BATCH-09 | System shall upload all credentials to IPFS | Must Have |
| ISS-BATCH-10 | System shall generate single merkle tree from all credential hashes | Must Have |
| ISS-BATCH-11 | System shall anchor single merkle root on Polygon | Must Have |
| ISS-BATCH-12 | System shall generate individual merkle proofs for each credential | Must Have |
| ISS-BATCH-13 | System shall store all credentials in MongoDB with batch reference | Must Have |
| ISS-BATCH-14 | System shall display progress during batch processing | Must Have |
| ISS-BATCH-15 | System shall display completion summary with statistics | Must Have |

#### 6.1.5 Credential Management

| ID | Requirement | Priority |
|----|-------------|----------|
| ISS-MGMT-01 | Issuer shall view list of all issued credentials | Must Have |
| ISS-MGMT-02 | Issuer shall filter credentials by schema, status, date | Should Have |
| ISS-MGMT-03 | Issuer shall view individual credential details | Must Have |
| ISS-MGMT-04 | Issuer shall view credential claim status | Must Have |
| ISS-MGMT-05 | Issuer shall revoke credentials with reason | Must Have |
| ISS-MGMT-06 | System shall update MongoDB revocation status | Must Have |
| ISS-MGMT-07 | Issuer shall view list of all batches | Should Have |
| ISS-MGMT-08 | Issuer shall view batch details including transaction hash | Should Have |

#### 6.1.6 Dashboard and Statistics

| ID | Requirement | Priority |
|----|-------------|----------|
| ISS-DASH-01 | Dashboard shall display total credentials issued count | Must Have |
| ISS-DASH-02 | Dashboard shall display pending claims count | Must Have |
| ISS-DASH-03 | Dashboard shall display revoked credentials count | Must Have |
| ISS-DASH-04 | Dashboard shall display recent activity list | Should Have |
| ISS-DASH-05 | Dashboard shall provide quick action buttons for issuance | Must Have |

### 6.2 User (Recipient) Functional Requirements

#### 6.2.1 Authentication and Identity

| ID | Requirement | Priority |
|----|-------------|----------|
| USR-AUTH-01 | User shall authenticate via Web3Auth social login | Must Have |
| USR-AUTH-02 | System shall generate deterministic wallet from social identity | Must Have |
| USR-AUTH-03 | System shall derive DID from wallet address (did:pkh format) | Must Have |
| USR-AUTH-04 | System shall display user's DID and wallet address in profile | Should Have |

#### 6.2.2 Credential Discovery

| ID | Requirement | Priority |
|----|-------------|----------|
| USR-DISC-01 | System shall query credentials by user's wallet address | Must Have |
| USR-DISC-02 | System shall display "Available to Claim" credentials (claimed=false, revoked=false) | Must Have |
| USR-DISC-03 | System shall display "My Credentials" (claimed=true, revoked=false) | Must Have |
| USR-DISC-04 | System shall display "Revoked" credentials (revoked=true) | Must Have |
| USR-DISC-05 | System shall show credential cards with summary information | Must Have |

#### 6.2.3 Credential Claiming

| ID | Requirement | Priority |
|----|-------------|----------|
| USR-CLAIM-01 | User shall claim credentials from "Available" tab | Must Have |
| USR-CLAIM-02 | System shall fetch full credential from IPFS | Must Have |
| USR-CLAIM-03 | System shall store credential in MetaMask Snap local storage | Must Have |
| USR-CLAIM-04 | System shall update MongoDB claimed status and timestamp | Must Have |
| USR-CLAIM-05 | Credential shall move from "Available" to "My Credentials" tab | Must Have |
| USR-CLAIM-06 | System shall prevent re-claiming of already claimed credentials | Must Have |

#### 6.2.4 Credential Viewing

| ID | Requirement | Priority |
|----|-------------|----------|
| USR-VIEW-01 | User shall view full credential details | Must Have |
| USR-VIEW-02 | System shall display all credential fields | Must Have |
| USR-VIEW-03 | System shall display issuer information | Must Have |
| USR-VIEW-04 | System shall display issuance date | Must Have |
| USR-VIEW-05 | System shall display verification status (merkle proof, on-chain anchor) | Should Have |
| USR-VIEW-06 | System shall display revocation status | Must Have |

#### 6.2.5 Credential Sharing (Token-Based)

| ID | Requirement | Priority |
|----|-------------|----------|
| USR-SHARE-01 | User shall initiate sharing from credential detail view | Must Have |
| USR-SHARE-02 | System shall display toggles for each hideable field | Must Have |
| USR-SHARE-03 | User shall select which fields to disclose/hide | Must Have |
| USR-SHARE-04 | User shall optionally set expiration date for share link | Should Have |
| USR-SHARE-05 | User shall optionally set maximum view count | Should Have |
| USR-SHARE-06 | System shall generate unique share token | Must Have |
| USR-SHARE-07 | System shall store disclosure settings in MongoDB tied to token | Must Have |
| USR-SHARE-08 | System shall return shareable link containing only token | Must Have |
| USR-SHARE-09 | System shall display link with copy button | Must Have |
| USR-SHARE-10 | System shall generate QR code encoding the share link | Should Have |

#### 6.2.6 Share Token Management

| ID | Requirement | Priority |
|----|-------------|----------|
| USR-TOKEN-01 | User shall view all active share tokens for a credential | Should Have |
| USR-TOKEN-02 | User shall see view count for each share token | Should Have |
| USR-TOKEN-03 | User shall revoke (delete) share tokens | Should Have |

#### 6.2.7 Verification Request Handling

| ID | Requirement | Priority |
|----|-------------|----------|
| USR-REQ-01 | User shall view pending verification requests | Must Have |
| USR-REQ-02 | System shall display verifier identity (DID, name, type) | Must Have |
| USR-REQ-03 | System shall display requested credential type | Must Have |
| USR-REQ-04 | System shall display requested claims (what verifier wants to verify) | Must Have |
| USR-REQ-05 | System shall display verifier's message | Should Have |
| USR-REQ-06 | System shall display request expiration time | Must Have |
| USR-REQ-07 | User shall approve verification request | Must Have |
| USR-REQ-08 | User shall select which credential to use (if multiple match) | Must Have |
| USR-REQ-09 | System shall generate ZKP-based response for approved request | Must Have |
| USR-REQ-10 | User shall reject verification request | Must Have |
| USR-REQ-11 | System shall notify verifier of approval/rejection | Must Have |
| USR-REQ-12 | User shall view history of past requests | Should Have |

#### 6.2.8 Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| USR-NOTIF-01 | System shall display notification bell icon | Must Have |
| USR-NOTIF-02 | System shall show unread notification count badge | Must Have |
| USR-NOTIF-03 | System shall notify user of new verification requests | Must Have |
| USR-NOTIF-04 | System shall notify user of credential revocations | Must Have |
| USR-NOTIF-05 | User shall mark notifications as read | Should Have |

#### 6.2.9 Offline Access

| ID | Requirement | Priority |
|----|-------------|----------|
| USR-OFFLINE-01 | Application shall be installable as PWA | Should Have |
| USR-OFFLINE-02 | Claimed credentials shall be accessible offline from Snap storage | Should Have |
| USR-OFFLINE-03 | System shall display "offline" indicator when disconnected | Should Have |
| USR-OFFLINE-04 | System shall sync when connection is restored | Should Have |

### 6.3 Verifier Functional Requirements

#### 6.3.1 Authentication and Registration

| ID | Requirement | Priority |
|----|-------------|----------|
| VER-AUTH-01 | Verifier shall authenticate via Web3Auth social login | Must Have |
| VER-AUTH-02 | System shall derive DID from wallet address (did:pkh format) | Must Have |
| VER-AUTH-03 | Verifier shall register profile before creating requests | Must Have |
| VER-AUTH-04 | Profile shall include: name, type, website, logo (optional) | Must Have |
| VER-AUTH-05 | Verifier shall edit their profile | Should Have |

#### 6.3.2 Verification Request Creation

| ID | Requirement | Priority |
|----|-------------|----------|
| VER-REQ-01 | Verifier shall create new verification request | Must Have |
| VER-REQ-02 | Verifier shall specify target user's wallet address or email | Must Have |
| VER-REQ-03 | System shall predict wallet address if email provided | Must Have |
| VER-REQ-04 | Verifier shall select required credential type | Must Have |
| VER-REQ-05 | Verifier shall define claim requirements | Must Have |
| VER-REQ-06 | System shall support claim types: equals, greaterThan, lessThan, greaterOrEqual, lessOrEqual, contains, exists, reveal | Must Have |
| VER-REQ-07 | Verifier shall add optional message for user | Should Have |
| VER-REQ-08 | Verifier shall set request expiration (default: 7 days) | Should Have |
| VER-REQ-09 | System shall store request in MongoDB | Must Have |
| VER-REQ-10 | System shall notify target user of new request | Must Have |

#### 6.3.3 Request Management

| ID | Requirement | Priority |
|----|-------------|----------|
| VER-MGMT-01 | Verifier shall view list of all their requests | Must Have |
| VER-MGMT-02 | Verifier shall filter requests by status (pending, approved, rejected, expired) | Should Have |
| VER-MGMT-03 | Verifier shall view request details | Must Have |
| VER-MGMT-04 | Verifier shall cancel pending requests | Should Have |

#### 6.3.4 Response Viewing

| ID | Requirement | Priority |
|----|-------------|----------|
| VER-RESP-01 | Verifier shall view responses for approved requests | Must Have |
| VER-RESP-02 | System shall display ZKP results (true/false for each claim) | Must Have |
| VER-RESP-03 | System shall display revealed field values (for "reveal" claims) | Must Have |
| VER-RESP-04 | System shall display credential verification status | Must Have |
| VER-RESP-05 | System shall display: merkle proof valid, on-chain anchor, not revoked | Must Have |
| VER-RESP-06 | System shall display user's DID | Must Have |
| VER-RESP-07 | System shall display response timestamp | Must Have |

#### 6.3.5 Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| VER-DASH-01 | Dashboard shall display total requests count | Must Have |
| VER-DASH-02 | Dashboard shall display pending requests count | Must Have |
| VER-DASH-03 | Dashboard shall display approved/rejected counts | Should Have |
| VER-DASH-04 | Dashboard shall display recent activity | Should Have |
| VER-DASH-05 | Dashboard shall provide quick action to create new request | Must Have |

### 6.4 Public Verification (Share Links)

| ID | Requirement | Priority |
|----|-------------|----------|
| PUB-VER-01 | Anyone shall access share link without authentication | Must Have |
| PUB-VER-02 | System shall fetch share token from database | Must Have |
| PUB-VER-03 | System shall verify token is valid (exists, not expired, under max views) | Must Have |
| PUB-VER-04 | System shall fetch credential from IPFS | Must Have |
| PUB-VER-05 | System shall apply disclosure mask (show only permitted fields) | Must Have |
| PUB-VER-06 | System shall verify merkle proof | Must Have |
| PUB-VER-07 | System shall verify on-chain anchor | Must Have |
| PUB-VER-08 | System shall check revocation status | Must Have |
| PUB-VER-09 | System shall increment view count | Must Have |
| PUB-VER-10 | System shall display verification result page | Must Have |
| PUB-VER-11 | Hidden fields shall display as masked (e.g., "••••••") | Must Have |
| PUB-VER-12 | System shall display error for invalid/expired tokens | Must Have |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-01 | Page load time | < 3 seconds |
| NFR-PERF-02 | Single credential issuance | < 30 seconds (including blockchain confirmation) |
| NFR-PERF-03 | Batch issuance (100 credentials) | < 2 minutes |
| NFR-PERF-04 | Share link verification | < 2 seconds |
| NFR-PERF-05 | Database query response | < 500ms |

### 7.2 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SCALE-01 | Concurrent users | 100 (hackathon demo) |
| NFR-SCALE-02 | Total credentials | 10,000 |
| NFR-SCALE-03 | Credentials per batch | 1,000 |

### 7.3 Availability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-AVAIL-01 | System uptime | 99% (during hackathon) |
| NFR-AVAIL-02 | Offline credential viewing | Available via PWA/Snap |

### 7.4 Security

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-SEC-01 | Authentication | Web3Auth with social login |
| NFR-SEC-02 | Authorization | Role-based access (issuer, user, verifier) |
| NFR-SEC-03 | Data encryption | HTTPS for transit, encrypted Snap storage |
| NFR-SEC-04 | Private key security | Never stored on server, only in MetaMask |
| NFR-SEC-05 | Smart contract security | Only registered issuers can anchor |
| NFR-SEC-06 | Input validation | All inputs validated against schemas |

### 7.5 Usability

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-USE-01 | No seed phrases | Users never see or manage seed phrases |
| NFR-USE-02 | Social login | Familiar authentication flow |
| NFR-USE-03 | Responsive design | Works on desktop and mobile browsers |
| NFR-USE-04 | Clear feedback | Loading states, success/error messages |
| NFR-USE-05 | Intuitive navigation | Role-specific dashboards |

### 7.6 Compatibility

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-COMPAT-01 | Browsers | Chrome, Firefox, Safari, Edge (latest versions) |
| NFR-COMPAT-02 | MetaMask | MetaMask browser extension with Snaps support |
| NFR-COMPAT-03 | Mobile | Mobile browsers (responsive, not native app) |

---

## 8. Technical Architecture

### 8.1 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16 (App Router) | React-based web application |
| Styling | Tailwind CSS + shadcn/ui | UI components and styling |
| Authentication | Web3Auth | Social login, wallet generation |
| Local Storage | MetaMask Snaps | Client-side credential caching |
| Backend | Next.js API Routes | Server-side logic |
| Database | MongoDB Atlas | Index, mutable state storage |
| File Storage | IPFS (Pinata) | Decentralized credential storage |
| Blockchain | Polygon (Amoy testnet) | Smart contract deployment |
| Smart Contracts | Solidity | Trusted issuer registry, anchoring |

### 8.2 System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                   │
│                           (Next.js App)                                │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Issuer     │  │    User      │  │   Verifier   │                 │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│         │                 │                 │                          │
│         └─────────────────┼─────────────────┘                          │
│                           │                                            │
│  ┌────────────────────────┴────────────────────────┐                  │
│  │              Web3Auth + MetaMask                │                  │
│  │        (Authentication + Transaction Signing)   │                  │
│  └────────────────────────┬────────────────────────┘                  │
│                           │                                            │
└───────────────────────────┼────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           BACKEND                                       │
│                     (Next.js API Routes)                               │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                        API Routes                              │   │
│  │  /api/issue/*  /api/credentials/*  /api/verify/*  /api/share/* │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                           │                                            │
│  ┌────────────────────────┴────────────────────────┐                  │
│  │                  Core Libraries                 │                  │
│  │  merkle.ts  credentials.ts  blockchain.ts      │                  │
│  └─────────────────────────────────────────────────┘                  │
│                                                                        │
└───────────────────────────┬────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   MongoDB    │   │     IPFS     │   │   Polygon    │
│    Atlas     │   │   (Pinata)   │   │  Blockchain  │
│              │   │              │   │              │
│ - Indexes    │   │ - Credential │   │ - Trusted    │
│ - Mutable    │   │   JSON files │   │   issuers    │
│   state      │   │ - Permanent  │   │ - Merkle     │
│ - Queries    │   │   storage    │   │   roots      │
└──────────────┘   └──────────────┘   └──────────────┘
```

### 8.3 Directory Structure

```
/app
  /api
    /issue
      /single/route.ts
      /batch/route.ts
    /credentials
      /me/route.ts
      /[id]/route.ts
      /[id]/claim/route.ts
    /share
      /route.ts
      /[token]/route.ts
    /verify
      /[token]/route.ts
    /verification-requests
      /route.ts
      /[id]/route.ts
      /[id]/approve/route.ts
      /[id]/reject/route.ts
    /verifier
      /register/route.ts
      /profile/route.ts
    /predict-address
      /route.ts
      /batch/route.ts
    /revoke/route.ts
  /issuer
    /page.tsx
    /issue/page.tsx
    /batch/page.tsx
    /credentials/page.tsx
    /credentials/[id]/page.tsx
    /batches/page.tsx
  /recipient
    /page.tsx
    /credentials/[id]/page.tsx
    /credentials/[id]/share/page.tsx
    /requests/page.tsx
  /verifier
    /page.tsx
    /profile/page.tsx
    /request/new/page.tsx
    /requests/page.tsx
    /requests/[id]/page.tsx
  /verify
    /[token]/page.tsx
  /layout.tsx
  /page.tsx

/components
  /issuer
    /schema-selector.tsx
    /dynamic-form.tsx
    /credential-preview.tsx
    /csv-uploader.tsx
    /validation-results.tsx
    /issuance-progress.tsx
    /credential-card.tsx
    /revocation-modal.tsx
  /recipient
    /credential-list.tsx
    /credential-detail.tsx
    /credential-tabs.tsx
    /share-modal.tsx
    /disclosure-toggles.tsx
    /request-card.tsx
    /notification-bell.tsx
  /verifier
    /profile-form.tsx
    /request-form.tsx
    /claim-builder.tsx
    /response-view.tsx
  /shared
    /wallet-connect.tsx
    /role-guard.tsx
    /loading-spinner.tsx
    /credential-badge.tsx

/lib
  /merkle.ts
  /credentials.ts
  /blockchain.ts
  /schemas.ts
  /db.ts
  /web3auth.ts
  /web3auth-client.ts
  /ipfs.ts
  /roles.ts
  /zkp.ts

/contracts
  /CredentialRegistry.sol

/scripts
  /generate-keys.ts
  /deploy-contract.js

/public
  /.well-known/did.json

/docs
  /01-project-requirements-document.md
  /02-user-flows.md
  /03-implementation-plans.md
  /04-screen-requirements.md
```

---

## 9. Data Models

### 9.1 MongoDB Collections

#### 9.1.1 credentials

```javascript
{
  _id: String,                    // "cred_abc123"
  batchId: String,                // Reference to batch
  leafIndex: Number,              // Position in merkle tree
  leafHash: String,               // SHA-256 hash of credential
  ipfsCID: String,                // IPFS content identifier
  
  // Recipient
  recipientEmail: String,
  recipientAddress: String,       // Predicted wallet address
  recipientDID: String,           // "did:pkh:eip155:137:0x..."
  
  // Status
  claimed: Boolean,
  claimedAt: Date | null,
  revoked: Boolean,
  revokedAt: Date | null,
  revokedReason: String | null,
  
  // Metadata
  schemaId: String,
  issuedAt: Date
}
```

#### 9.1.2 batches

```javascript
{
  _id: String,                    // "batch_2024_001"
  merkleRoot: String,             // 32-byte hex
  batchMetadataCID: String,       // IPFS CID of batch metadata
  issuerDID: String,
  issuerAddress: String,
  schemaId: String,
  credentialCount: Number,
  anchorTxHash: String,           // Polygon transaction hash
  anchorBlockNumber: Number,
  createdAt: Date
}
```

#### 9.1.3 share_tokens

```javascript
{
  _id: String,                    // "share_abc123xyz"
  credentialId: String,
  createdBy: String,              // User wallet address
  
  // Disclosure settings
  disclosedFields: [String],
  hiddenFields: [String],
  
  // Restrictions
  expiresAt: Date | null,
  maxViews: Number | null,
  currentViews: Number,
  
  createdAt: Date
}
```

#### 9.1.4 verifiers

```javascript
{
  _id: String,                    // "verifier_001"
  walletAddress: String,
  did: String,                    // "did:pkh:eip155:137:0x..."
  
  // Profile
  name: String,
  type: String,                   // "employer" | "university" | "government" | "service"
  website: String | null,
  logo: String | null,            // IPFS CID
  
  createdAt: Date,
  updatedAt: Date
}
```

#### 9.1.5 verification_requests

```javascript
{
  _id: String,                    // "req_abc123"
  
  // Verifier
  verifierId: String,
  verifierDID: String,
  verifierName: String,
  
  // Target user
  targetAddress: String,
  
  // Requirements
  credentialType: String,
  claims: [
    {
      field: String,
      type: String,               // "equals" | "greaterThan" | "lessThan" | "reveal" | etc.
      value: Any | null           // null for "reveal" and "exists"
    }
  ],
  message: String | null,
  
  // Status
  status: String,                 // "pending" | "approved" | "rejected" | "expired"
  
  // Timestamps
  createdAt: Date,
  expiresAt: Date,
  respondedAt: Date | null
}
```

#### 9.1.6 verification_responses

```javascript
{
  _id: String,                    // "resp_xyz789"
  requestId: String,
  credentialId: String,
  
  // ZKP results
  proofs: [
    {
      claim: String,              // Description of claim
      type: String,               // "comparison" | "revealed"
      result: Boolean | null,     // For comparison claims
      value: Any | null           // For revealed fields
    }
  ],
  
  // Verification
  merkleProofValid: Boolean,
  anchoredOnChain: Boolean,
  anchorTxHash: String,
  notRevoked: Boolean,
  
  respondedAt: Date
}
```

#### 9.1.7 notifications

```javascript
{
  _id: String,
  recipientAddress: String,       // Who receives the notification
  type: String,                   // "verification_request" | "credential_revoked"
  title: String,
  message: String,
  referenceId: String | null,     // Request ID or credential ID
  read: Boolean,
  createdAt: Date
}
```

### 9.2 Credential Schema Definition

```typescript
interface CredentialSchema {
  id: string;
  name: string;
  description: string;
  fields: CredentialField[];
}

interface CredentialField {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "select";
  required: boolean;
  hideable: boolean;
  options?: string[];            // For "select" type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}
```

### 9.3 W3C Verifiable Credential Structure

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1"
  ],
  "id": "urn:uuid:credential-unique-id",
  "type": ["VerifiableCredential", "SchemaSpecificType"],
  "issuer": "did:web:your-app.vercel.app",
  "issuanceDate": "2024-05-15T10:30:00Z",
  
  "credentialSubject": {
    "id": "did:pkh:eip155:137:0xRecipientAddress",
    "field1": "value1",
    "field2": "value2"
  },
  
  "proof": {
    "type": "MerkleProof2019",
    "created": "2024-05-15T10:30:00Z",
    "verificationMethod": "did:web:your-app.vercel.app#key-1",
    "proofPurpose": "assertionMethod",
    "merkleRoot": "0x...",
    "leafIndex": 0,
    "merkleProof": ["0x...", "0x..."],
    "anchorTransactionHash": "0x...",
    "anchorChain": "polygon",
    "anchorContract": "0x..."
  }
}
```

---

## 10. Smart Contract Specifications

### 10.1 Contract: CredentialRegistry

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CredentialRegistry {
    
    address public owner;
    
    // === Structs ===
    
    struct Issuer {
        string did;
        string name;
        bool active;
        uint256 registeredAt;
    }
    
    struct Batch {
        bytes32 merkleRoot;
        address issuer;
        uint256 credentialCount;
        uint256 timestamp;
    }
    
    // === State Variables ===
    
    mapping(address => Issuer) public trustedIssuers;
    address[] public issuerList;
    mapping(bytes32 => Batch) public batches;
    
    // === Events ===
    
    event IssuerRegistered(
        address indexed issuerAddress, 
        string did, 
        string name
    );
    
    event IssuerRevoked(
        address indexed issuerAddress
    );
    
    event BatchAnchored(
        bytes32 indexed merkleRoot, 
        address indexed issuer, 
        uint256 credentialCount,
        uint256 timestamp
    );
    
    // === Modifiers ===
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyTrustedIssuer() {
        require(trustedIssuers[msg.sender].active, "Not trusted issuer");
        _;
    }
    
    // === Constructor ===
    
    constructor() {
        owner = msg.sender;
    }
    
    // === Issuer Management ===
    
    function registerIssuer(
        address issuerAddress,
        string calldata did,
        string calldata name
    ) external onlyOwner {
        require(!trustedIssuers[issuerAddress].active, "Already registered");
        
        trustedIssuers[issuerAddress] = Issuer({
            did: did,
            name: name,
            active: true,
            registeredAt: block.timestamp
        });
        
        issuerList.push(issuerAddress);
        emit IssuerRegistered(issuerAddress, did, name);
    }
    
    function revokeIssuer(address issuerAddress) external onlyOwner {
        require(trustedIssuers[issuerAddress].active, "Not active");
        trustedIssuers[issuerAddress].active = false;
        emit IssuerRevoked(issuerAddress);
    }
    
    function isIssuerTrusted(address issuerAddress) external view returns (bool) {
        return trustedIssuers[issuerAddress].active;
    }
    
    function getIssuer(address issuerAddress) external view returns (Issuer memory) {
        return trustedIssuers[issuerAddress];
    }
    
    function getIssuerCount() external view returns (uint256) {
        return issuerList.length;
    }
    
    // === Batch Anchoring ===
    
    function anchorBatch(
        bytes32 merkleRoot,
        uint256 credentialCount
    ) external onlyTrustedIssuer {
        require(batches[merkleRoot].timestamp == 0, "Batch already exists");
        require(credentialCount > 0, "Invalid credential count");
        
        batches[merkleRoot] = Batch({
            merkleRoot: merkleRoot,
            issuer: msg.sender,
            credentialCount: credentialCount,
            timestamp: block.timestamp
        });
        
        emit BatchAnchored(merkleRoot, msg.sender, credentialCount, block.timestamp);
    }
    
    function getBatch(bytes32 merkleRoot) external view returns (Batch memory) {
        return batches[merkleRoot];
    }
    
    function batchExists(bytes32 merkleRoot) external view returns (bool) {
        return batches[merkleRoot].timestamp != 0;
    }
    
    // === Owner Management ===
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
```

### 10.2 Contract Deployment

**Network:** Polygon Amoy Testnet

**Steps:**
1. Compile contract with Hardhat
2. Deploy using owner wallet
3. Store contract address in environment variable
4. Register issuer wallet address using `registerIssuer()`

### 10.3 Gas Estimates

| Function | Estimated Gas | Est. Cost (30 gwei) |
|----------|---------------|---------------------|
| registerIssuer | ~80,000 | ~$0.002 |
| anchorBatch | ~60,000 | ~$0.0015 |
| getBatch (view) | 0 | Free |
| isIssuerTrusted (view) | 0 | Free |

---

## 11. Integration Requirements

### 11.1 Web3Auth Integration

**Purpose:** Social login, wallet generation, address prediction

**Configuration:**
```javascript
{
  clientId: process.env.WEB3AUTH_CLIENT_ID,
  web3AuthNetwork: "sapphire_devnet",  // or "sapphire_mainnet" for production
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x13882",  // Polygon Amoy
    rpcTarget: "https://rpc-amoy.polygon.technology"
  }
}
```

**Key Features Used:**
- Modal-based social login (Google, email)
- Deterministic wallet generation
- Server-side address prediction via `getPublicAddress()`

### 11.2 MetaMask Integration

**Purpose:** Transaction signing, Snap storage

**Requirements:**
- MetaMask browser extension installed
- Snaps support enabled
- Connection approval from user

**Features Used:**
- `eth_requestAccounts` - Connect wallet
- `eth_sendTransaction` - Sign and send anchor transactions
- `snap_manageState` - Store/retrieve credentials locally

### 11.3 IPFS (Pinata) Integration

**Purpose:** Decentralized credential storage

**Configuration:**
```javascript
{
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY
}
```

**Operations:**
- `pinJSONToIPFS` - Upload credential JSON
- `gateway.pinata.cloud/ipfs/{CID}` - Retrieve credential

### 11.4 MongoDB Atlas Integration

**Purpose:** Query index, mutable state

**Configuration:**
```javascript
{
  uri: process.env.MONGODB_URI,
  dbName: "decentralized_identity"
}
```

**Collections:** See Section 9.1

### 11.5 Polygon Integration

**Purpose:** Smart contract interaction

**Configuration:**
```javascript
{
  rpcUrl: "https://rpc-amoy.polygon.technology",
  chainId: 80002,
  contractAddress: process.env.CREDENTIAL_REGISTRY_CONTRACT
}
```

---

## 12. Security Requirements

### 12.1 Authentication Security

| Requirement | Implementation |
|-------------|----------------|
| No password storage | Web3Auth handles authentication |
| Session management | JWT tokens with expiration |
| Wallet ownership proof | Signature verification |

### 12.2 Authorization Security

| Requirement | Implementation |
|-------------|----------------|
| Role-based access | Check wallet address against allowed roles |
| Issuer verification | Smart contract checks `trustedIssuers` mapping |
| Credential ownership | Match recipient address with requester |

### 12.3 Data Security

| Requirement | Implementation |
|-------------|----------------|
| Credential integrity | Merkle proofs, on-chain anchoring |
| Storage encryption | MetaMask Snap encrypted storage |
| Transit encryption | HTTPS only |
| Private key isolation | Never on server, only in user's wallet |

### 12.4 Smart Contract Security

| Requirement | Implementation |
|-------------|----------------|
| Access control | `onlyOwner`, `onlyTrustedIssuer` modifiers |
| Reentrancy protection | No external calls in state-changing functions |
| Input validation | Require checks for all inputs |

### 12.5 Input Validation

| Data Type | Validation |
|-----------|------------|
| Email addresses | Format validation |
| Wallet addresses | Checksum validation |
| Credential data | Schema validation |
| Merkle roots | 32-byte hex validation |

---

## 13. Constraints and Assumptions

### 13.1 Constraints

| Constraint | Description |
|------------|-------------|
| Single issuer | Only one issuer for hackathon demo |
| Single verifier | Only one verifier for hackathon demo |
| Testnet only | Using Polygon Amoy testnet (no real funds) |
| Browser only | No native mobile apps |
| Simplified ZKP | Trusted server model instead of true ZK circuits |
| English only | No internationalization |

### 13.2 Assumptions

| Assumption | Description |
|------------|-------------|
| MetaMask installed | Users have MetaMask browser extension |
| Modern browser | Chrome, Firefox, Safari, Edge (latest versions) |
| Internet connection | Required for most operations |
| Gmail access | For Web3Auth social login |
| Polygon testnet available | Amoy testnet is operational |

### 13.3 Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | Frontend framework |
| React | 19.x | UI library |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | UI components |
| Web3Auth | Latest | Authentication |
| viem | Latest | Blockchain interaction |
| MongoDB | Latest | Database |
| Pinata SDK | Latest | IPFS pinning |

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **DID** | Decentralized Identifier - A globally unique identifier that does not require a central authority |
| **did:web** | DID method that uses web domains as the trust anchor |
| **did:pkh** | DID method derived from blockchain wallet addresses (Public Key Hash) |
| **Verifiable Credential (VC)** | A tamper-evident credential with cryptographic proof of authorship |
| **Merkle Tree** | A hash-based data structure that enables efficient verification of data integrity |
| **Merkle Root** | The single hash at the top of a merkle tree representing all leaves |
| **Merkle Proof** | The set of hashes needed to verify a leaf belongs to a merkle tree |
| **IPFS** | InterPlanetary File System - A decentralized storage network |
| **CID** | Content Identifier - IPFS's content-addressed identifier |
| **ZKP** | Zero-Knowledge Proof - Proving a statement is true without revealing underlying data |
| **Selective Disclosure** | Revealing only specific fields of a credential |
| **Web3Auth** | Authentication service that generates wallets from social logins |
| **MetaMask Snap** | Plugin system for MetaMask that extends functionality |
| **Polygon** | Ethereum-compatible blockchain with lower transaction costs |
| **Smart Contract** | Self-executing code deployed on blockchain |
| **Anchor** | Recording data on blockchain for immutability |
| **Revocation** | Invalidating a previously issued credential |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 2026 | - | Initial document |

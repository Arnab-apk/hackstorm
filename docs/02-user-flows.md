# User Flows Document

## Decentralized Identity Verification System

**Version:** 1.0  
**Date:** April 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication Flows](#2-authentication-flows)
3. [Issuer Flows](#3-issuer-flows)
4. [Recipient (User) Flows](#4-recipient-user-flows)
5. [Verifier Flows](#5-verifier-flows)
6. [Public Verification Flow](#6-public-verification-flow)
7. [Error Flows](#7-error-flows)
8. [Edge Cases](#8-edge-cases)

---

## 1. Overview

### 1.1 Flow Categories

This document details all user journeys through the system, organized by role:

| Role | Primary Flows |
|------|---------------|
| Issuer | Authentication, Single Issuance, Batch Issuance, Credential Management, Revocation |
| Recipient | Authentication, Credential Discovery, Claiming, Sharing, Request Handling |
| Verifier | Authentication, Profile Setup, Request Creation, Response Viewing |
| Public | Share Link Verification |

### 1.2 Flow Notation

```
[Action]        = User action
{System}        = System process
(Decision)      = Decision point
<State>         = State change
->              = Flow direction
```

---

## 2. Authentication Flows

### 2.1 First-Time User Authentication

**Actors:** Any user (Issuer, Recipient, Verifier)

**Trigger:** User visits application for the first time

**Preconditions:** 
- User has Gmail/social account
- MetaMask browser extension installed

**Flow:**

```
START
  │
  ▼
[User visits application]
  │
  ▼
{System displays landing page with "Connect Wallet" button}
  │
  ▼
[User clicks "Connect Wallet"]
  │
  ▼
{System initializes Web3Auth modal}
  │
  ▼
{Web3Auth modal displays login options (Google, Email, etc.)}
  │
  ▼
[User selects "Continue with Google"]
  │
  ▼
{Google OAuth popup opens}
  │
  ▼
[User selects Google account and authorizes]
  │
  ▼
{Web3Auth generates deterministic wallet from Google identity}
  │
  ▼
{System derives DID: did:pkh:eip155:137:0xWalletAddress}
  │
  ▼
{System determines user role based on wallet address}
  │
  ▼
(Is wallet address registered as Issuer?)
  │
  ├── YES ──▶ {Redirect to Issuer Dashboard}
  │
  └── NO
      │
      ▼
(Is wallet address registered as Verifier?)
      │
      ├── YES ──▶ {Redirect to Verifier Dashboard}
      │
      └── NO ──▶ {Redirect to Recipient Dashboard}
  │
  ▼
END
```

**Postconditions:**
- User is authenticated
- Session is established
- User is on role-appropriate dashboard

---

### 2.2 Returning User Authentication

**Actors:** Any authenticated user

**Trigger:** User returns to application with existing session

**Flow:**

```
START
  │
  ▼
[User visits application]
  │
  ▼
{System checks for existing Web3Auth session}
  │
  ▼
(Valid session exists?)
  │
  ├── YES
  │     │
  │     ▼
  │   {System retrieves wallet address from session}
  │     │
  │     ▼
  │   {System determines role and redirects to dashboard}
  │     │
  │     ▼
  │   END
  │
  └── NO ──▶ [Continue to First-Time Authentication Flow]
```

---

### 2.3 Logout Flow

**Actors:** Any authenticated user

**Trigger:** User clicks logout

**Flow:**

```
START
  │
  ▼
[User clicks "Logout" button]
  │
  ▼
{System calls Web3Auth logout}
  │
  ▼
{System clears local session}
  │
  ▼
{System redirects to landing page}
  │
  ▼
END
```

---

## 3. Issuer Flows

### 3.1 Single Credential Issuance

**Actors:** Issuer

**Trigger:** Issuer wants to issue a credential to one recipient

**Preconditions:**
- Issuer is authenticated
- Issuer wallet is registered in smart contract
- MetaMask is connected for transaction signing

**Flow:**

```
START
  │
  ▼
[Issuer clicks "Issue Single Credential" on dashboard]
  │
  ▼
{System displays schema selection dropdown}
  │
  ▼
[Issuer selects credential schema (e.g., "University Degree")]
  │
  ▼
{System renders dynamic form based on schema fields}
  │
  ▼
[Issuer enters recipient email]
  │
  ▼
{System calls Web3Auth to predict wallet address from email}
  │
  ▼
{System displays predicted recipient address}
  │
  ▼
[Issuer fills in credential data fields]
  │
  ▼
[Issuer clicks "Preview"]
  │
  ▼
{System validates form data against schema}
  │
  ▼
(Validation passed?)
  │
  ├── NO
  │     │
  │     ▼
  │   {System displays validation errors}
  │     │
  │     ▼
  │   [Issuer corrects errors] ──▶ [Back to "Issuer clicks Preview"]
  │
  └── YES
      │
      ▼
{System displays credential preview with all data}
  │
  ▼
[Issuer reviews preview]
  │
  ▼
[Issuer clicks "Sign & Issue"]
  │
  ▼
{System builds W3C Verifiable Credential structure}
  │
  ▼
{System uploads credential JSON to IPFS}
  │
  ▼
{System receives IPFS CID}
  │
  ▼
{System generates merkle tree (single leaf)}
  │
  ▼
{System prepares anchor transaction}
  │
  ▼
{MetaMask popup requests transaction signature}
  │
  ▼
[Issuer reviews and confirms transaction in MetaMask]
  │
  ▼
{System sends transaction to Polygon}
  │
  ▼
{System displays "Waiting for confirmation..."}
  │
  ▼
{Transaction confirmed on Polygon}
  │
  ▼
{System generates merkle proof for credential}
  │
  ▼
{System updates credential with proof data}
  │
  ▼
{System stores credential index in MongoDB}
  │
  ▼
{System displays success screen}
  │
  ▼
<Credential Status: Issued, Unclaimed>
  │
  ▼
[Issuer can: Issue Another | View Credential | Return to Dashboard]
  │
  ▼
END
```

**Postconditions:**
- Credential stored on IPFS
- Merkle root anchored on Polygon
- Credential indexed in MongoDB with `claimed: false`
- Recipient can discover credential when they log in

---

### 3.2 Batch Credential Issuance

**Actors:** Issuer

**Trigger:** Issuer wants to issue multiple credentials at once

**Preconditions:**
- Issuer is authenticated
- Issuer wallet is registered in smart contract
- CSV file prepared with recipient data

**Flow:**

```
START
  │
  ▼
[Issuer clicks "Batch Issue" on dashboard]
  │
  ▼
{System displays schema selection dropdown}
  │
  ▼
[Issuer selects credential schema]
  │
  ▼
{System displays CSV upload area}
  │
  ▼
[Issuer clicks "Download Template"]
  │
  ▼
{System generates CSV template with schema columns}
  │
  ▼
{Browser downloads template CSV}
  │
  ▼
[Issuer fills CSV with recipient data (offline)]
  │
  ▼
[Issuer drags and drops CSV file to upload area]
  │
  ▼
{System parses CSV file}
  │
  ▼
{System validates each row against schema}
  │
  ▼
{System predicts wallet addresses for all emails}
  │
  ▼
{System displays validation results table}
  │
  ▼
(All rows valid?)
  │
  ├── NO
  │     │
  │     ▼
  │   {System displays:
  │     - Valid rows count (green)
  │     - Invalid rows with error details (red)
  │     - Warnings (yellow)}
  │     │
  │     ▼
  │   [Issuer chooses: "Fix & Re-upload" OR "Skip Invalid & Continue"]
  │     │
  │     ├── "Fix & Re-upload" ──▶ [Back to CSV upload]
  │     │
  │     └── "Skip Invalid & Continue" ──▶ Continue with valid rows only
  │
  └── YES
      │
      ▼
{System displays batch summary:
  - Total credentials to issue
  - Schema name
  - Estimated gas cost}
  │
  ▼
[Issuer clicks "Issue Batch"]
  │
  ▼
{System displays progress UI}
  │
  ▼
{System builds all credentials (Progress: 10%)}
  │
  ▼
{System uploads all credentials to IPFS (Progress: 30%)}
  │
  ▼
{System generates merkle tree from all credential hashes (Progress: 50%)}
  │
  ▼
{MetaMask popup requests transaction signature}
  │
  ▼
[Issuer confirms transaction in MetaMask]
  │
  ▼
{System anchors merkle root on Polygon (Progress: 70%)}
  │
  ▼
{Transaction confirmed}
  │
  ▼
{System generates individual merkle proofs (Progress: 85%)}
  │
  ▼
{System stores all credentials in MongoDB (Progress: 95%)}
  │
  ▼
{System displays completion summary:
  - Batch ID
  - Credentials issued count
  - Merkle root
  - Transaction hash
  - Link to batch details}
  │
  ▼
<All Credentials Status: Issued, Unclaimed>
  │
  ▼
[Issuer can: Issue Another Batch | View Batch | Return to Dashboard]
  │
  ▼
END
```

**Postconditions:**
- All valid credentials stored on IPFS
- Single merkle root anchored on Polygon
- All credentials indexed in MongoDB with batch reference
- Recipients can discover credentials when they log in

---

### 3.3 View Issued Credentials

**Actors:** Issuer

**Trigger:** Issuer wants to view credentials they have issued

**Flow:**

```
START
  │
  ▼
[Issuer clicks "Credentials" in navigation]
  │
  ▼
{System fetches all credentials for this issuer from MongoDB}
  │
  ▼
{System displays credentials table with:
  - Credential ID
  - Recipient email
  - Schema type
  - Issue date
  - Status (Pending/Claimed/Revoked)}
  │
  ▼
[Issuer can filter by: Schema | Status | Date range]
  │
  ▼
[Issuer clicks on a credential row]
  │
  ▼
{System displays credential detail page:
  - Full credential data
  - Recipient information
  - Claim status
  - Merkle proof details
  - On-chain anchor (transaction hash link)
  - Revocation status}
  │
  ▼
[Issuer can: Revoke Credential | Back to List]
  │
  ▼
END
```

---

### 3.4 Revoke Credential

**Actors:** Issuer

**Trigger:** Issuer needs to invalidate a credential

**Preconditions:**
- Credential exists and is not already revoked

**Flow:**

```
START
  │
  ▼
[Issuer views credential detail page]
  │
  ▼
[Issuer clicks "Revoke Credential"]
  │
  ▼
{System displays revocation confirmation modal}
  │
  ▼
{Modal shows:
  - Warning about permanent action
  - Credential summary
  - Reason input field (required)}
  │
  ▼
[Issuer enters revocation reason]
  │
  ▼
[Issuer clicks "Confirm Revocation"]
  │
  ▼
{System updates MongoDB:
  - revoked: true
  - revokedAt: current timestamp
  - revokedReason: entered reason}
  │
  ▼
{System creates notification for recipient}
  │
  ▼
{System displays success message}
  │
  ▼
<Credential Status: Revoked>
  │
  ▼
END
```

**Postconditions:**
- Credential marked as revoked in MongoDB
- Recipient receives revocation notification
- Credential appears in "Revoked" tab for recipient
- Verification requests will fail with "revoked" status

---

## 4. Recipient (User) Flows

### 4.1 Discover Available Credentials

**Actors:** Recipient

**Trigger:** Recipient logs in to check for new credentials

**Preconditions:**
- Recipient is authenticated
- Issuer has issued credential(s) to recipient's predicted address

**Flow:**

```
START
  │
  ▼
[Recipient logs in / navigates to dashboard]
  │
  ▼
{System retrieves recipient's wallet address}
  │
  ▼
{System queries MongoDB: 
  recipientAddress = userAddress}
  │
  ▼
{System categorizes credentials:
  - Available: claimed=false, revoked=false
  - Claimed: claimed=true, revoked=false
  - Revoked: revoked=true}
  │
  ▼
{System displays dashboard with three tabs}
  │
  ▼
{Default tab "Available to Claim" shows:
  - Credential cards with summary
  - "Claim" button on each card}
  │
  ▼
(Credentials available?)
  │
  ├── YES ──▶ {Display credential cards}
  │
  └── NO ──▶ {Display "No credentials available" message}
  │
  ▼
END
```

---

### 4.2 Claim Credential

**Actors:** Recipient

**Trigger:** Recipient wants to claim an available credential

**Preconditions:**
- Credential is available (unclaimed, not revoked)
- MetaMask Snap is available

**Flow:**

```
START
  │
  ▼
[Recipient views "Available to Claim" tab]
  │
  ▼
[Recipient clicks "Claim" on credential card]
  │
  ▼
{System fetches full credential from IPFS using CID}
  │
  ▼
{System displays credential preview}
  │
  ▼
[Recipient reviews credential details]
  │
  ▼
[Recipient clicks "Claim to Wallet"]
  │
  ▼
{System requests MetaMask Snap storage access}
  │
  ▼
(Snap permission granted?)
  │
  ├── NO
  │     │
  │     ▼
  │   {MetaMask prompts for Snap installation/permission}
  │     │
  │     ▼
  │   [Recipient approves Snap permission]
  │
  └── YES
      │
      ▼
{System stores credential in Snap local storage}
  │
  ▼
{System updates MongoDB:
  - claimed: true
  - claimedAt: current timestamp}
  │
  ▼
{System displays success message}
  │
  ▼
{Credential moves from "Available" to "My Credentials" tab}
  │
  ▼
<Credential Status: Claimed>
  │
  ▼
END
```

**Postconditions:**
- Credential stored locally in MetaMask Snap
- MongoDB updated with claim status
- Credential no longer appears in "Available" tab

---

### 4.3 View Claimed Credential

**Actors:** Recipient

**Trigger:** Recipient wants to view credential details

**Flow:**

```
START
  │
  ▼
[Recipient clicks "My Credentials" tab]
  │
  ▼
{System displays claimed credentials}
  │
  ▼
[Recipient clicks on credential card]
  │
  ▼
{System displays credential detail page:
  - All credential fields
  - Issuer information
  - Issuance date
  - Verification status
  - Share button
  - Verification requests badge (if any pending)}
  │
  ▼
[Recipient can: Share | View Requests | Back to List]
  │
  ▼
END
```

---

### 4.4 Create Share Link

**Actors:** Recipient

**Trigger:** Recipient wants to share credential with selective disclosure

**Preconditions:**
- Credential is claimed
- Credential is not revoked

**Flow:**

```
START
  │
  ▼
[Recipient views credential detail]
  │
  ▼
[Recipient clicks "Share"]
  │
  ▼
{System displays share modal with:
  - List of all credential fields
  - Toggle switch for each hideable field
  - Fields marked "Always Shown" (non-hideable)
  - Preview panel showing how credential will appear}
  │
  ▼
[Recipient toggles fields to hide/show]
  │
  ▼
{Preview updates in real-time:
  - Shown fields display values
  - Hidden fields display "••••••"}
  │
  ▼
[Recipient optionally sets expiration date]
  │
  ▼
[Recipient optionally sets maximum views]
  │
  ▼
[Recipient clicks "Generate Share Link"]
  │
  ▼
{System generates unique share token}
  │
  ▼
{System stores in MongoDB share_tokens:
  - token ID
  - credentialId
  - disclosedFields array
  - hiddenFields array
  - expiresAt (if set)
  - maxViews (if set)
  - currentViews: 0}
  │
  ▼
{System displays:
  - Share link: https://app.com/verify/{token}
  - Copy button
  - QR code (encoding the link)
  - Expiration info (if set)
  - Max views info (if set)}
  │
  ▼
[Recipient copies link or shows QR to verifier]
  │
  ▼
END
```

**Postconditions:**
- Share token stored in MongoDB
- Link can be opened by anyone
- Hidden fields will never be exposed through this link

---

### 4.5 Manage Share Tokens

**Actors:** Recipient

**Trigger:** Recipient wants to view or revoke active share links

**Flow:**

```
START
  │
  ▼
[Recipient views credential detail]
  │
  ▼
[Recipient clicks "Manage Shares"]
  │
  ▼
{System fetches all share_tokens for this credential}
  │
  ▼
{System displays share tokens table:
  - Token ID (truncated)
  - Created date
  - Expires date
  - Views: X / Max
  - Status (Active/Expired/Maxed Out)
  - Actions}
  │
  ▼
[Recipient can click "Revoke" on any active token]
  │
  ▼
(Revoke clicked?)
  │
  └── YES
        │
        ▼
      {System deletes token from MongoDB}
        │
        ▼
      {System displays success message}
        │
        ▼
      {Token removed from list}
  │
  ▼
END
```

---

### 4.6 View Verification Requests

**Actors:** Recipient

**Trigger:** Recipient wants to see pending verification requests from verifiers

**Preconditions:**
- Verifier has created request targeting this recipient

**Flow:**

```
START
  │
  ▼
[Recipient clicks "Requests" in navigation]
  │
  ▼
{System fetches verification_requests where:
  targetAddress = recipient's address}
  │
  ▼
{System displays requests in tabs:
  - Pending (status: pending)
  - Completed (status: approved or rejected)
  - Expired (status: expired)}
  │
  ▼
{Each pending request card shows:
  - Verifier name and DID
  - Verifier type (Employer, University, etc.)
  - Verified badge (if verifier is verified)
  - Requested credential type
  - Requested claims (what they want to verify)
  - Verifier's message
  - Expires in: X days
  - Approve / Reject buttons}
  │
  ▼
END
```

---

### 4.7 Approve Verification Request

**Actors:** Recipient

**Trigger:** Recipient wants to approve a verifier's request

**Preconditions:**
- Request is pending
- Request has not expired
- Recipient has matching credential

**Flow:**

```
START
  │
  ▼
[Recipient views pending request]
  │
  ▼
[Recipient clicks "Approve"]
  │
  ▼
{System checks: Does recipient have credential of requested type?}
  │
  ▼
(Matching credential found?)
  │
  ├── NO
  │     │
  │     ▼
  │   {System displays: "You don't have a matching credential"}
  │     │
  │     ▼
  │   END
  │
  └── YES
      │
      ▼
(Multiple matching credentials?)
      │
      ├── YES
      │     │
      │     ▼
      │   {System displays credential selector}
      │     │
      │     ▼
      │   [Recipient selects which credential to use]
      │
      └── NO ──▶ Use the single matching credential
      │
      ▼
{System displays approval confirmation:
  - Credential to be used
  - What verifier will learn:
    * Claim results (true/false)
    * Revealed field values}
  │
  ▼
[Recipient confirms approval]
  │
  ▼
{System generates ZKP-based response:
  For each claim:
    - "equals" → compare, return true/false
    - "greaterThan" → compare, return true/false
    - "reveal" → include actual value}
  │
  ▼
{System verifies credential:
  - Merkle proof valid
  - On-chain anchor exists
  - Not revoked}
  │
  ▼
{System stores verification_response in MongoDB}
  │
  ▼
{System updates request status to "approved"}
  │
  ▼
{System creates notification for verifier}
  │
  ▼
{System displays success message}
  │
  ▼
{Request moves to "Completed" tab}
  │
  ▼
END
```

**Postconditions:**
- Verification response stored
- Verifier can now view the response
- Request status is "approved"

---

### 4.8 Reject Verification Request

**Actors:** Recipient

**Trigger:** Recipient doesn't want to share information with verifier

**Flow:**

```
START
  │
  ▼
[Recipient views pending request]
  │
  ▼
[Recipient clicks "Reject"]
  │
  ▼
{System displays confirmation:
  "Are you sure you want to reject this request?
   Verifier will be notified but won't see any data."}
  │
  ▼
[Recipient confirms rejection]
  │
  ▼
{System updates request status to "rejected"}
  │
  ▼
{System creates notification for verifier}
  │
  ▼
{System displays success message}
  │
  ▼
{Request moves to "Completed" tab}
  │
  ▼
END
```

---

### 4.9 View Notifications

**Actors:** Recipient

**Trigger:** Recipient sees notification badge

**Flow:**

```
START
  │
  ▼
[Recipient sees notification bell with badge count]
  │
  ▼
[Recipient clicks notification bell]
  │
  ▼
{System displays notification dropdown:
  - New verification request from [Verifier Name]
  - Your credential [Name] was revoked
  - etc.}
  │
  ▼
[Recipient clicks on a notification]
  │
  ▼
{System marks notification as read}
  │
  ▼
{System navigates to relevant page:
  - Verification request → Request detail
  - Revocation → Credential in Revoked tab}
  │
  ▼
END
```

---

## 5. Verifier Flows

### 5.1 Register Verifier Profile

**Actors:** Verifier (first time)

**Trigger:** Verifier wants to start using the platform

**Preconditions:**
- Verifier is authenticated
- Verifier has not registered profile yet

**Flow:**

```
START
  │
  ▼
[Verifier authenticates and lands on Verifier Dashboard]
  │
  ▼
{System checks: Does verifier have profile?}
  │
  ▼
(Profile exists?)
  │
  ├── YES ──▶ {Display normal dashboard}
  │
  └── NO
      │
      ▼
    {System displays: "Complete your profile to get started"}
      │
      ▼
    {System displays profile form:
      - Organization Name (required)
      - Type: Employer / University / Government / Service (required)
      - Website URL (optional)
      - Logo upload (optional)}
      │
      ▼
    [Verifier fills in profile information]
      │
      ▼
    [Verifier clicks "Complete Registration"]
      │
      ▼
    {System validates form}
      │
      ▼
    {System stores verifier profile in MongoDB}
      │
      ▼
    {System displays success and redirects to dashboard}
      │
      ▼
    END
```

---

### 5.2 Create Verification Request

**Actors:** Verifier

**Trigger:** Verifier needs to verify a user's credential

**Preconditions:**
- Verifier has registered profile
- Verifier knows target user's email or wallet address

**Flow:**

```
START
  │
  ▼
[Verifier clicks "New Verification Request" on dashboard]
  │
  ▼
{System displays request creation form}
  │
  ▼
--- Section 1: Target User ---
  │
  ▼
[Verifier enters target user's email OR wallet address]
  │
  ▼
(Email entered?)
  │
  ├── YES
  │     │
  │     ▼
  │   {System predicts wallet address from email}
  │     │
  │     ▼
  │   {System displays: "Request will be sent to: 0x..."}
  │
  └── NO (Wallet address entered)
      │
      ▼
    {System validates address format}
  │
  ▼
--- Section 2: Credential Type ---
  │
  ▼
[Verifier selects required credential type from dropdown]
  │
  ▼
{System loads schema fields for selected type}
  │
  ▼
--- Section 3: Claim Requirements ---
  │
  ▼
{System displays claim builder interface}
  │
  ▼
[Verifier adds claims using claim builder]
  │
  ▼
For each claim:
  │
  ▼
  {Verifier selects field from dropdown}
    │
    ▼
  {Verifier selects claim type:
    - Equals: field = value
    - Greater Than: field > value
    - Less Than: field < value
    - Greater or Equal: field >= value
    - Less or Equal: field <= value
    - Contains: field contains value
    - Exists: field has a value
    - Reveal: show actual value}
    │
    ▼
  (Claim type requires value?)
    │
    ├── YES ──▶ [Verifier enters comparison value]
    │
    └── NO (exists, reveal) ──▶ No value needed
    │
    ▼
  [Verifier clicks "Add Claim"]
    │
    ▼
  {Claim added to list}
  │
  ▼
[Verifier can add more claims or continue]
  │
  ▼
--- Section 4: Optional Settings ---
  │
  ▼
[Verifier optionally adds message for user]
  │
  ▼
[Verifier optionally adjusts expiration (default: 7 days)]
  │
  ▼
--- Submit ---
  │
  ▼
[Verifier clicks "Send Request"]
  │
  ▼
{System validates:
  - Target address is valid
  - At least one claim defined
  - Claim values are appropriate types}
  │
  ▼
{System stores verification_request in MongoDB:
  - status: "pending"
  - createdAt: now
  - expiresAt: now + expiration period}
  │
  ▼
{System creates notification for target user}
  │
  ▼
{System displays success:
  "Request sent! You'll be notified when the user responds."}
  │
  ▼
{System redirects to request detail page}
  │
  ▼
END
```

**Postconditions:**
- Request stored in MongoDB
- Target user has notification
- Request appears in Verifier's "Pending" requests

---

### 5.3 View Verification Requests

**Actors:** Verifier

**Trigger:** Verifier wants to check status of requests

**Flow:**

```
START
  │
  ▼
[Verifier clicks "Requests" in navigation]
  │
  ▼
{System fetches verification_requests where:
  verifierId = current verifier}
  │
  ▼
{System displays requests in tabs:
  - Pending
  - Approved
  - Rejected
  - Expired}
  │
  ▼
{Each request card shows:
  - Target user address
  - Credential type requested
  - Claims requested (summary)
  - Status
  - Created date
  - Expires date (for pending)}
  │
  ▼
[Verifier clicks on a request]
  │
  ▼
{System displays request detail page}
  │
  ▼
END
```

---

### 5.4 View Approved Response

**Actors:** Verifier

**Trigger:** User has approved verifier's request

**Preconditions:**
- Request status is "approved"
- Response exists

**Flow:**

```
START
  │
  ▼
[Verifier receives notification: "User approved your request"]
  │
  ▼
[Verifier navigates to request detail]
  │
  ▼
{System fetches verification_response for this request}
  │
  ▼
{System displays response:
  
  --- User Information ---
  User DID: did:pkh:eip155:137:0x...
  Response Date: [date]
  
  --- Claim Verification Results ---
  For each claim:
    "Degree equals Bachelor of Science" → TRUE ✓
    "GPA greater than 3.0" → TRUE ✓
    "Major" → "Computer Science" (revealed)
  
  --- Credential Verification ---
  Merkle Proof: Valid ✓
  On-Chain Anchor: Valid ✓ (tx: 0x... - link)
  Not Revoked: Confirmed ✓
  
  --- Issuer Information ---
  Issuer: did:web:university.edu
  Issuer Name: [Name from contract]
  
}
  │
  ▼
{Verifier has verified the user's claims}
  │
  ▼
END
```

---

### 5.5 Cancel Pending Request

**Actors:** Verifier

**Trigger:** Verifier no longer needs the verification

**Preconditions:**
- Request is still pending

**Flow:**

```
START
  │
  ▼
[Verifier views pending request detail]
  │
  ▼
[Verifier clicks "Cancel Request"]
  │
  ▼
{System displays confirmation dialog}
  │
  ▼
[Verifier confirms cancellation]
  │
  ▼
{System deletes request from MongoDB}
  │
  ▼
{System displays success message}
  │
  ▼
{Verifier redirected to requests list}
  │
  ▼
END
```

---

## 6. Public Verification Flow

### 6.1 Verify via Share Link

**Actors:** Anyone with the share link

**Trigger:** Someone opens a share link

**Preconditions:**
- Valid share token exists
- Token is not expired
- Token has not exceeded max views

**Flow:**

```
START
  │
  ▼
[Anyone opens: https://app.com/verify/{token}]
  │
  ▼
{System extracts token from URL}
  │
  ▼
{System queries share_tokens collection}
  │
  ▼
(Token exists?)
  │
  ├── NO ──▶ {Display: "Invalid or deleted share link"}
  │           │
  │           ▼
  │           END
  │
  └── YES
      │
      ▼
(Token expired?)
      │
      ├── YES ──▶ {Display: "This share link has expired"}
      │             │
      │             ▼
      │             END
      │
      └── NO
          │
          ▼
(Max views exceeded?)
          │
          ├── YES ──▶ {Display: "This share link has reached its view limit"}
          │             │
          │             ▼
          │             END
          │
          └── NO
              │
              ▼
{System fetches credential from IPFS using stored CID}
              │
              ▼
{System verifies merkle proof}
              │
              ▼
{System checks on-chain anchor}
              │
              ▼
{System checks revocation status in MongoDB}
              │
              ▼
{System increments token view count}
              │
              ▼
{System applies disclosure mask:
  - disclosedFields → show actual values
  - hiddenFields → show "••••••"}
              │
              ▼
(All verifications passed?)
              │
              ├── NO ──▶ {Display verification failure with reason}
              │
              └── YES
                  │
                  ▼
{System displays verification result page:

  ═══════════════════════════════════════
           VERIFIED CREDENTIAL
  ═══════════════════════════════════════
  
  Type: University Degree
  Issuer: State University (did:web:...)
  Issued: May 15, 2024
  
  --- Disclosed Information ---
  
  Name:       Alice Johnson
  Degree:     Bachelor of Science
  Major:      Computer Science
  GPA:        ••••••
  Graduation: ••••••
  
  --- Verification Details ---
  
  ✓ Merkle proof valid
  ✓ Anchored on Polygon (tx: 0xabc...)
  ✓ Credential not revoked
  
  Share created: May 15, 2024
  Views: 4 of 10
  Expires: June 15, 2024
  
  ═══════════════════════════════════════
}
              │
              ▼
END
```

---

## 7. Error Flows

### 7.1 Transaction Failure

**Trigger:** MetaMask transaction fails or is rejected

**Flow:**

```
START
  │
  ▼
{User rejects transaction in MetaMask OR transaction fails}
  │
  ▼
{System catches error}
  │
  ▼
(User rejected?)
  │
  ├── YES ──▶ {Display: "Transaction cancelled. No credentials were issued."}
  │
  └── NO (Network/Gas error)
      │
      ▼
    {Display: "Transaction failed: [error message]
              Please try again or contact support."}
  │
  ▼
{User returned to previous step}
  │
  ▼
END
```

### 7.2 IPFS Upload Failure

**Trigger:** IPFS upload fails

**Flow:**

```
START
  │
  ▼
{IPFS upload request fails}
  │
  ▼
{System retries up to 3 times}
  │
  ▼
(Retry successful?)
  │
  ├── YES ──▶ Continue normal flow
  │
  └── NO
      │
      ▼
    {Display: "Failed to upload credential to IPFS.
              Please check your connection and try again."}
      │
      ▼
    {User returned to form with data preserved}
  │
  ▼
END
```

### 7.3 Web3Auth Login Failure

**Trigger:** Social login fails

**Flow:**

```
START
  │
  ▼
{Web3Auth login fails}
  │
  ▼
{System logs error}
  │
  ▼
{Display: "Login failed. Please try again.
          If the problem persists, try a different login method."}
  │
  ▼
{User returned to login screen}
  │
  ▼
END
```

---

## 8. Edge Cases

### 8.1 User Signs In With Different Email

**Scenario:** User previously received credential but signs in with different email

**Behavior:**
- Different email = different wallet address
- Credentials issued to old email won't appear
- User must sign in with the same email used during issuance

**Resolution:**
- Display message: "No credentials found for this account"
- Suggest: "If you received credentials, sign in with the email your issuer used"

### 8.2 Credential Revoked While User is Sharing

**Scenario:** User creates share link, then issuer revokes credential

**Behavior:**
- Share link verification checks revocation status in real-time
- Verifier will see: "VERIFICATION FAILED - Credential has been revoked"

### 8.3 Verification Request Expires

**Scenario:** User doesn't respond to request within expiration period

**Behavior:**
- System periodically checks and updates expired requests
- Request status changed to "expired"
- Verifier notified: "Request expired without response"
- User can no longer see request in "Pending" (moves to "Expired" in history)

### 8.4 Multiple Credentials of Same Type

**Scenario:** User has two "University Degree" credentials from different issuers

**Behavior:**
- When approving verification request, user sees all matching credentials
- User must select which credential to use
- Selection screen shows differentiating details (issuer, date, etc.)

### 8.5 Issuer Revoked After Credential Issuance

**Scenario:** Issuer is removed from trusted registry after issuing credentials

**Behavior:**
- Existing credentials remain valid (merkle root already anchored)
- Verification shows: "Issuer no longer active" as warning
- No new credentials can be issued by this issuer

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 2026 | - | Initial document |

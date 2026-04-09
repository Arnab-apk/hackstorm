# Screen Requirements Document

## Document Information

| Field | Value |
|-------|-------|
| Project | Decentralized Identity System |
| Document | Frontend Screens and UI Requirements |
| Version | 1.0 |
| Last Updated | 2024 |

---

## Table of Contents

1. [Screen Overview](#1-screen-overview)
2. [Shared Components](#2-shared-components)
3. [Public Screens](#3-public-screens)
4. [Issuer Screens](#4-issuer-screens)
5. [Recipient Screens](#5-recipient-screens)
6. [Verifier Screens](#6-verifier-screens)
7. [Verification Public Screens](#7-verification-public-screens)
8. [Component Specifications](#8-component-specifications)
9. [Design System](#9-design-system)

---

## 1. Screen Overview

### 1.1 Complete Screen List

| Route | Screen Name | Access | Purpose |
|-------|-------------|--------|---------|
| `/` | Landing Page | Public | Product introduction |
| `/login` | Login | Public | Web3Auth authentication |
| `/issuer` | Issuer Dashboard | Issuer Only | Overview and stats |
| `/issuer/issue` | Issue Single Credential | Issuer Only | Issue one credential |
| `/issuer/batch` | Batch Issuance | Issuer Only | Issue multiple credentials |
| `/issuer/credentials` | Credentials List | Issuer Only | View all issued credentials |
| `/issuer/credentials/[id]` | Credential Detail | Issuer Only | Single credential management |
| `/issuer/batches` | Batches List | Issuer Only | View all batches |
| `/issuer/batches/[id]` | Batch Detail | Issuer Only | Single batch details |
| `/recipient` | Recipient Dashboard | User Only | Overview and stats |
| `/recipient/available` | Available Credentials | User Only | Unclaimed credentials |
| `/recipient/credentials` | My Credentials | User Only | Claimed credentials |
| `/recipient/credentials/[id]` | Credential Detail | User Only | View and share credential |
| `/recipient/credentials/[id]/share` | Share Credential | User Only | Create share link |
| `/recipient/revoked` | Revoked Credentials | User Only | Revoked credentials list |
| `/recipient/requests` | Verification Requests | User Only | Pending requests from verifiers |
| `/recipient/requests/[id]` | Request Detail | User Only | Approve/reject request |
| `/recipient/history` | Request History | User Only | Past approved/rejected |
| `/verifier` | Verifier Dashboard | Verifier Only | Overview and stats |
| `/verifier/profile` | Verifier Profile | Verifier Only | Edit profile |
| `/verifier/request/new` | New Request | Verifier Only | Create verification request |
| `/verifier/requests` | Requests List | Verifier Only | All verification requests |
| `/verifier/requests/[id]` | Request Detail | Verifier Only | View request and response |
| `/verify/[token]` | Share Verification | Public | Verify shared credential |
| `/s/[token]` | Share View (Short URL) | Public | Alias for share verification |

### 1.2 Screen Count Summary

| Role | Screen Count |
|------|--------------|
| Public | 4 |
| Issuer | 7 |
| Recipient | 9 |
| Verifier | 5 |
| **Total** | **25** |

---

## 2. Shared Components

### 2.1 Layout Components

#### 2.1.1 AppShell

**Purpose:** Main layout wrapper for authenticated pages

**Structure:**
```
+----------------------------------------------------------+
|  Header                                                   |
+----------------------------------------------------------+
|         |                                                 |
| Sidebar |  Main Content Area                              |
|         |                                                 |
|         |                                                 |
|         |                                                 |
+----------------------------------------------------------+
```

**Props:**
- `role`: "issuer" | "recipient" | "verifier"
- `children`: React.ReactNode

**Elements:**
- Header (64px height)
- Sidebar (240px width, collapsible to 64px on mobile)
- Main content area (flex-1)

#### 2.1.2 Header

**Elements:**

| Element | Type | Position | Behavior |
|---------|------|----------|----------|
| Logo | Image + Text | Left | Links to role dashboard |
| Role Badge | Badge | Left of center | Shows current role |
| Search | Input | Center | Global search (optional for MVP) |
| Notifications Bell | Icon Button | Right | Opens notification dropdown |
| Notification Badge | Badge | Over bell | Unread count |
| Profile Dropdown | Avatar + Dropdown | Right | Account menu |

**Profile Dropdown Items:**
- Wallet Address (truncated, copy button)
- DID (truncated, copy button)
- View Profile
- Divider
- Sign Out

#### 2.1.3 Sidebar Navigation

**Issuer Sidebar:**
```
- Dashboard (icon: LayoutDashboard)
- Issue Credential (icon: FilePlus)
  - Single
  - Batch
- Credentials (icon: FileCheck)
- Batches (icon: Layers)
- Settings (icon: Settings)
```

**Recipient Sidebar:**
```
- Dashboard (icon: LayoutDashboard)
- Available (icon: Inbox) [with badge count]
- My Credentials (icon: Wallet)
- Revoked (icon: Ban)
- Verification Requests (icon: ShieldQuestion) [with badge count]
- History (icon: History)
- Settings (icon: Settings)
```

**Verifier Sidebar:**
```
- Dashboard (icon: LayoutDashboard)
- New Request (icon: FilePlus)
- My Requests (icon: FileSearch)
- Profile (icon: Building)
- Settings (icon: Settings)
```

#### 2.1.4 Notification Dropdown

**Structure:**
```
+--------------------------------+
| Notifications            Clear |
+--------------------------------+
| [Icon] New credential issued   |
|        University Degree       |
|        2 hours ago             |
+--------------------------------+
| [Icon] Credential revoked      |
|        Employee ID #45         |
|        1 day ago               |
+--------------------------------+
| [Icon] Verification request    |
|        From: Acme Corp         |
|        3 days ago              |
+--------------------------------+
|        View All                |
+--------------------------------+
```

**Notification Types:**
- `credential_issued` - New credential available
- `credential_revoked` - Credential was revoked
- `verification_request` - New request from verifier
- `request_approved` - User approved request (for verifier)
- `request_rejected` - User rejected request (for verifier)
- `request_expired` - Request expired

### 2.2 Common UI Components

#### 2.2.1 StatCard

**Purpose:** Display single metric

**Structure:**
```
+---------------------------+
|  [Icon]                   |
|                           |
|  1,247                    |
|  Total Credentials        |
|                           |
|  +12% from last month     |
+---------------------------+
```

**Props:**
- `icon`: LucideIcon
- `value`: string | number
- `label`: string
- `change?`: { value: number, trend: "up" | "down" }
- `onClick?`: () => void

#### 2.2.2 CredentialCard

**Purpose:** Compact credential display for lists

**Structure:**
```
+------------------------------------------+
|  [Schema Icon]  University Degree        |
|                                          |
|  Recipient: Alice Johnson                |
|  Issued: May 15, 2024                    |
|                                          |
|  [Status Badge: Claimed]     [Actions]   |
+------------------------------------------+
```

**Props:**
- `credential`: Credential
- `showRecipient?`: boolean (for issuer view)
- `showIssuer?`: boolean (for recipient view)
- `actions?`: Action[]

**Status Badge Colors:**
- Available: Blue
- Claimed: Green
- Revoked: Red
- Pending: Yellow

#### 2.2.3 CredentialDetail

**Purpose:** Full credential display

**Structure:**
```
+--------------------------------------------------+
|  UNIVERSITY DEGREE CREDENTIAL                     |
|  ================================================|
|                                                   |
|  [Credential Icon/Visual]                         |
|                                                   |
|  Subject Information                              |
|  -------------------------------------------------|
|  Name:            Alice Johnson                   |
|  Degree:          Bachelor of Science             |
|  Major:           Computer Science                |
|  GPA:             3.85                            |
|  Graduation:      May 15, 2024                    |
|                                                   |
|  Credential Metadata                              |
|  -------------------------------------------------|
|  Credential ID:   cred_abc123                     |
|  Issuer:          did:web:university.edu          |
|  Issued Date:     May 15, 2024                    |
|  Status:          [Valid Badge]                   |
|                                                   |
|  Blockchain Proof                                 |
|  -------------------------------------------------|
|  Merkle Root:     0xabc123... [Copy]              |
|  Transaction:     0xdef456... [View on Explorer]  |
|  Block:           12345678                        |
|                                                   |
+--------------------------------------------------+
```

#### 2.2.4 DataTable

**Purpose:** Paginated, sortable table for lists

**Features:**
- Column sorting (click header)
- Pagination (10/25/50/100 per page)
- Row selection (checkbox)
- Bulk actions toolbar
- Search/filter input
- Column visibility toggle

**Props:**
- `columns`: ColumnDef[]
- `data`: T[]
- `pagination?`: boolean
- `sorting?`: boolean
- `selection?`: boolean
- `onRowClick?`: (row: T) => void

#### 2.2.5 EmptyState

**Purpose:** Display when no data

**Structure:**
```
+------------------------------------------+
|                                          |
|           [Illustration]                 |
|                                          |
|        No Credentials Yet                |
|                                          |
|  You haven't issued any credentials.     |
|  Get started by creating your first one. |
|                                          |
|        [Issue Credential Button]         |
|                                          |
+------------------------------------------+
```

**Props:**
- `icon`: LucideIcon
- `title`: string
- `description`: string
- `action?`: { label: string, onClick: () => void }

#### 2.2.6 LoadingState

**Purpose:** Display while loading

**Variants:**
- `spinner`: Simple centered spinner
- `skeleton`: Content skeleton matching expected layout
- `progress`: Progress bar with percentage

#### 2.2.7 ErrorState

**Purpose:** Display errors

**Structure:**
```
+------------------------------------------+
|                                          |
|           [Error Icon]                   |
|                                          |
|        Something went wrong              |
|                                          |
|  We couldn't load your credentials.      |
|  Please try again.                       |
|                                          |
|   [Retry Button]  [Go Back Button]       |
|                                          |
+------------------------------------------+
```

---

## 3. Public Screens

### 3.1 Landing Page (`/`)

**Purpose:** Product introduction and entry point

**Layout:** Full-width, no app shell

**Sections:**

#### 3.1.1 Hero Section

```
+----------------------------------------------------------+
|  [Logo]                    [Features] [About] [Login]     |
+----------------------------------------------------------+
|                                                           |
|           Decentralized Identity                          |
|              Made Simple                                  |
|                                                           |
|    Secure, verifiable credentials powered by              |
|    blockchain technology. Own your identity.              |
|                                                           |
|    [Get Started]  [Learn More]                            |
|                                                           |
|              [Hero Illustration]                          |
|                                                           |
+----------------------------------------------------------+
```

**Elements:**
- Navigation bar (sticky)
- Headline (h1, max 6 words)
- Subheadline (1-2 sentences)
- Primary CTA: "Get Started" -> /login
- Secondary CTA: "Learn More" -> scroll to features
- Hero illustration or 3D visual

#### 3.1.2 Features Section

```
+----------------------------------------------------------+
|                     How It Works                          |
+----------------------------------------------------------+
|                                                           |
|  +----------------+  +----------------+  +----------------+
|  |   [Icon]       |  |   [Icon]       |  |   [Icon]       |
|  |                |  |                |  |                |
|  |   Issue        |  |   Store        |  |   Verify       |
|  |                |  |                |  |                |
|  | Organizations  |  | Recipients     |  | Anyone can     |
|  | issue secure   |  | claim and      |  | verify with    |
|  | credentials    |  | control data   |  | blockchain     |
|  +----------------+  +----------------+  +----------------+
|                                                           |
+----------------------------------------------------------+
```

**Feature Cards (3):**
1. Issue - For organizations
2. Store - For individuals
3. Verify - For anyone

#### 3.1.3 Benefits Section

```
+----------------------------------------------------------+
|                   Why Decentralized?                      |
+----------------------------------------------------------+
|                                                           |
|  [Illustration]  |  No Central Point of Failure           |
|                  |  Your credentials aren't stored in     |
|                  |  a single database that can be hacked. |
|                  |                                        |
+----------------------------------------------------------+
|                  |                                        |
|  User Control    |  [Illustration]                        |
|  You decide who  |                                        |
|  sees what data. |                                        |
|                  |                                        |
+----------------------------------------------------------+
```

**Benefits (alternating layout):**
1. No central point of failure
2. User-controlled data sharing
3. Instant verification
4. Tamper-proof records

#### 3.1.4 CTA Section

```
+----------------------------------------------------------+
|                                                           |
|              Ready to Get Started?                        |
|                                                           |
|    [I'm an Organization]    [I'm an Individual]           |
|                                                           |
+----------------------------------------------------------+
```

#### 3.1.5 Footer

```
+----------------------------------------------------------+
|  [Logo]                                                   |
|                                                           |
|  Product        Resources       Legal                     |
|  - Features     - Documentation - Privacy Policy          |
|  - Pricing      - API Reference - Terms of Service        |
|  - Security     - GitHub                                  |
|                                                           |
|  ------------------------------------------------------- |
|  (c) 2024 Project Name. All rights reserved.              |
+----------------------------------------------------------+
```

---

### 3.2 Login Page (`/login`)

**Purpose:** Web3Auth authentication

**Layout:** Centered card, no app shell

**Structure:**
```
+----------------------------------------------------------+
|                                                           |
|                        [Logo]                             |
|                                                           |
|              Sign in to continue                          |
|                                                           |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |  [Google Icon]  Continue with Google               |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |  [Email Icon]   Continue with Email                |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|                         or                                |
|                                                           |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |  [Wallet Icon]  Connect Wallet                     |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  By continuing, you agree to our Terms of Service         |
|  and Privacy Policy.                                      |
|                                                           |
+----------------------------------------------------------+
```

**Login Options:**
1. Continue with Google (primary)
2. Continue with Email (passwordless)
3. Connect Wallet (MetaMask, etc.)

**Post-Login Redirect:**
- If new user -> onboarding or role-based dashboard
- If returning user -> role-based dashboard
- Role detection based on wallet address

---

## 4. Issuer Screens

### 4.1 Issuer Dashboard (`/issuer`)

**Purpose:** Overview of issuer activity

**Layout:** AppShell with issuer sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Dashboard                                    [+ Issue]   |
+----------------------------------------------------------+
|                                                           |
|  +------------+  +------------+  +------------+  +------+ |
|  |   1,247    |  |    847     |  |     12     |  |  5   | |
|  |  Issued    |  |  Claimed   |  |  Revoked   |  |Batch | |
|  +------------+  +------------+  +------------+  +------+ |
|                                                           |
|  Recent Activity                              [View All]  |
|  ---------------------------------------------------------|
|  | Type     | Recipient      | Schema    | Date    | Act ||
|  |----------|----------------|-----------|---------|-----||
|  | Issued   | alice@mail.com | Degree    | 2h ago  | ... ||
|  | Claimed  | bob@mail.com   | Employee  | 5h ago  | ... ||
|  | Revoked  | carol@mail.com | Degree    | 1d ago  | ... ||
|  ---------------------------------------------------------|
|                                                           |
|  Quick Actions                                            |
|  +----------------------+  +----------------------+       |
|  |  [Icon]              |  |  [Icon]              |       |
|  |  Issue Single        |  |  Batch Issue         |       |
|  |  Credential          |  |  (CSV Upload)        |       |
|  +----------------------+  +----------------------+       |
|                                                           |
+----------------------------------------------------------+
```

**Elements:**
- Page title with primary action button
- Stats cards (4): Issued, Claimed, Revoked, Batches
- Recent activity table (last 10)
- Quick action cards

**Stat Card Click Actions:**
- Issued -> /issuer/credentials
- Claimed -> /issuer/credentials?status=claimed
- Revoked -> /issuer/credentials?status=revoked
- Batches -> /issuer/batches

---

### 4.2 Issue Single Credential (`/issuer/issue`)

**Purpose:** Issue one credential manually

**Layout:** AppShell with issuer sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Issue Credential                                         |
+----------------------------------------------------------+
|                                                           |
|  Step 1 of 3: Select Template                             |
|  ========================================                 |
|                                                           |
|  +----------------------+  +----------------------+       |
|  |  [Icon]              |  |  [Icon]              |       |
|  |  University Degree   |  |  Employee ID         |       |
|  |  Bachelor's, Master's|  |  ID cards, badges    |       |
|  |  [Selected]          |  |                      |       |
|  +----------------------+  +----------------------+       |
|                                                           |
|  +----------------------+  +----------------------+       |
|  |  [Icon]              |  |  [Icon]              |       |
|  |  Course Certificate  |  |  Event Ticket        |       |
|  |  Individual courses  |  |  Conference, event   |       |
|  +----------------------+  +----------------------+       |
|                                                           |
|                               [Cancel]  [Next: Details]   |
+----------------------------------------------------------+
```

**Step 2: Enter Details**
```
+----------------------------------------------------------+
|  Issue Credential                                         |
+----------------------------------------------------------+
|                                                           |
|  Step 2 of 3: Enter Details                               |
|  ========================================                 |
|                                                           |
|  Recipient Information                                    |
|  ---------------------------------------------------------|
|                                                           |
|  Email Address *                                          |
|  +----------------------------------------------------+  |
|  | alice@university.edu                               |  |
|  +----------------------------------------------------+  |
|  Wallet address will be predicted from this email         |
|                                                           |
|  Credential Details                                       |
|  ---------------------------------------------------------|
|                                                           |
|  Full Name *                                              |
|  +----------------------------------------------------+  |
|  | Alice Johnson                                      |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Degree Type *                                            |
|  +----------------------------------------------------+  |
|  | Bachelor's Degree                              [v] |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Degree Name *                                            |
|  +----------------------------------------------------+  |
|  | Bachelor of Science                                |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Major *                                                  |
|  +----------------------------------------------------+  |
|  | Computer Science                                   |  |
|  +----------------------------------------------------+  |
|                                                           |
|  GPA                                                      |
|  +----------------------------------------------------+  |
|  | 3.85                                               |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Graduation Date *                                        |
|  +----------------------------------------------------+  |
|  | 2024-05-15                                     [c] |  |
|  +----------------------------------------------------+  |
|                                                           |
|                          [Back]  [Next: Preview]          |
+----------------------------------------------------------+
```

**Step 3: Preview & Issue**
```
+----------------------------------------------------------+
|  Issue Credential                                         |
+----------------------------------------------------------+
|                                                           |
|  Step 3 of 3: Preview & Issue                             |
|  ========================================                 |
|                                                           |
|  +----------------------------------------------------+  |
|  |  UNIVERSITY DEGREE                                 |  |
|  |  ================================================ |  |
|  |                                                    |  |
|  |  Recipient: Alice Johnson                          |  |
|  |  Email: alice@university.edu                       |  |
|  |  Wallet: 0x742d...f8fE (predicted)                 |  |
|  |                                                    |  |
|  |  ------------------------------------------------ |  |
|  |                                                    |  |
|  |  Degree Type:     Bachelor's Degree                |  |
|  |  Degree Name:     Bachelor of Science              |  |
|  |  Major:           Computer Science                 |  |
|  |  GPA:             3.85                             |  |
|  |  Graduation:      May 15, 2024                     |  |
|  |                                                    |  |
|  |  ------------------------------------------------ |  |
|  |                                                    |  |
|  |  Issuer: did:web:your-app.vercel.app               |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  [!] This will:                                           |
|  - Create and sign the credential                         |
|  - Anchor to Polygon blockchain                           |
|  - Store on IPFS                                          |
|  - Notify recipient via email (optional)                  |
|                                                           |
|  [ ] Send email notification to recipient                 |
|                                                           |
|                    [Back]  [Issue Credential]             |
+----------------------------------------------------------+
```

**Issuing State (Modal/Overlay):**
```
+------------------------------------------+
|                                          |
|        Issuing Credential...             |
|                                          |
|  [=====>                    ] 40%        |
|                                          |
|  [x] Building credential                 |
|  [x] Generating merkle tree              |
|  [ ] Uploading to IPFS...                |
|  [ ] Anchoring on Polygon                |
|  [ ] Storing index                       |
|                                          |
|  Please approve the transaction in       |
|  your wallet when prompted.              |
|                                          |
+------------------------------------------+
```

**Success State:**
```
+------------------------------------------+
|                                          |
|        [Success Icon]                    |
|                                          |
|     Credential Issued Successfully!      |
|                                          |
|  Credential ID: cred_abc123              |
|  Transaction: 0xdef456...                |
|  IPFS CID: Qm...                         |
|                                          |
|  [View Credential]  [Issue Another]      |
|                                          |
+------------------------------------------+
```

---

### 4.3 Batch Issuance (`/issuer/batch`)

**Purpose:** Issue multiple credentials via CSV

**Layout:** AppShell with issuer sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Batch Issuance                                           |
+----------------------------------------------------------+
|                                                           |
|  Step 1 of 4: Select Template                             |
|  ========================================                 |
|                                                           |
|  [Same template selection as single issue]                |
|                                                           |
+----------------------------------------------------------+
```

**Step 2: Upload CSV**
```
+----------------------------------------------------------+
|  Batch Issuance                                           |
+----------------------------------------------------------+
|                                                           |
|  Step 2 of 4: Upload Data                                 |
|  ========================================                 |
|                                                           |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |           [Upload Icon]                            |  |
|  |                                                    |  |
|  |    Drag and drop your CSV file here               |  |
|  |                                                    |  |
|  |              or click to browse                    |  |
|  |                                                    |  |
|  |    Supported: .csv, .xlsx (max 10MB)              |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  [Download Template CSV]                                  |
|                                                           |
|  Required columns for University Degree:                  |
|  - email (recipient's email)                              |
|  - name (full name)                                       |
|  - degree_type (Bachelor/Master/Doctoral)                 |
|  - degree_name                                            |
|  - major                                                  |
|  - graduation_date (YYYY-MM-DD)                           |
|                                                           |
|  Optional columns:                                        |
|  - gpa                                                    |
|  - minor                                                  |
|  - honors                                                 |
|                                                           |
|                                     [Back]  [Upload]      |
+----------------------------------------------------------+
```

**Step 3: Validation Results**
```
+----------------------------------------------------------+
|  Batch Issuance                                           |
+----------------------------------------------------------+
|                                                           |
|  Step 3 of 4: Review Data                                 |
|  ========================================                 |
|                                                           |
|  File: spring_2024_graduates.csv                          |
|                                                           |
|  +------------------+  +------------------+  +----------+ |
|  |  [Check Icon]    |  |  [X Icon]        |  | [!]      | |
|  |     1,247        |  |       3          |  |    12    | |
|  |  Valid Records   |  |  Invalid         |  | Warnings | |
|  +------------------+  +------------------+  +----------+ |
|                                                           |
|  [Tab: All] [Tab: Valid] [Tab: Invalid] [Tab: Warnings]   |
|  ---------------------------------------------------------|
|  | Row | Email           | Name    | Status    | Issue   ||
|  |-----|-----------------|---------|-----------|---------|
|  | 1   | alice@mail.com  | Alice J | [Valid]   |         ||
|  | 2   | bob@mail.com    | Bob S   | [Valid]   |         ||
|  | 45  | invalid@        | Carol   | [Invalid] | Bad email|
|  | 89  | dave@mail.com   | Dave    | [Invalid] | GPA 4.5 ||
|  ---------------------------------------------------------|
|                                                           |
|  Showing 1-50 of 1,250        [<] [1] [2] [3] ... [>]     |
|                                                           |
|               [Back]  [Skip Invalid & Continue]           |
+----------------------------------------------------------+
```

**Step 4: Confirm & Issue**
```
+----------------------------------------------------------+
|  Batch Issuance                                           |
+----------------------------------------------------------+
|                                                           |
|  Step 4 of 4: Confirm & Issue                             |
|  ========================================                 |
|                                                           |
|  Summary                                                  |
|  ---------------------------------------------------------|
|  Template:           University Degree                    |
|  Valid credentials:  1,247                                |
|  Skipped (invalid):  3                                    |
|                                                           |
|  [!] This action will:                                    |
|  - Create and sign 1,247 credentials                      |
|  - Build merkle tree for batch integrity                  |
|  - Upload all credentials to IPFS                         |
|  - Anchor single merkle root on Polygon                   |
|  - Estimated gas: ~0.002 MATIC                            |
|                                                           |
|  [ ] Send email notifications to all recipients           |
|                                                           |
|                  [Back]  [Issue 1,247 Credentials]        |
+----------------------------------------------------------+
```

**Batch Processing State:**
```
+----------------------------------------------------------+
|                                                           |
|        Processing Batch...                                |
|                                                           |
|  [========================>               ] 68%           |
|                                                           |
|  847 of 1,247 credentials processed                       |
|                                                           |
|  Current: Signing credential for Bob Smith                |
|  Elapsed: 2m 34s                                          |
|  Estimated remaining: 1m 12s                              |
|                                                           |
|  [x] Validating data                                      |
|  [x] Predicting wallet addresses                          |
|  [x] Building credentials (1247/1247)                     |
|  [x] Generating merkle tree                               |
|  [ ] Uploading to IPFS (847/1247)                         |
|  [ ] Awaiting wallet signature                            |
|  [ ] Anchoring on Polygon                                 |
|  [ ] Storing index                                        |
|                                                           |
|  [Cancel]                                                 |
+----------------------------------------------------------+
```

---

### 4.4 Credentials List (`/issuer/credentials`)

**Purpose:** View and manage all issued credentials

**Layout:** AppShell with issuer sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Credentials                                  [+ Issue]   |
+----------------------------------------------------------+
|                                                           |
|  [Search: ________________]  [Status: All v]  [Schema: v] |
|                                                           |
|  [Tab: All (1247)] [Tab: Claimed (847)] [Tab: Revoked (12)]
|  ---------------------------------------------------------|
|  | [ ] | ID        | Recipient       | Schema   | Status  |
|  |-----|-----------|-----------------|----------|---------|
|  | [ ] | cred_001  | alice@mail.com  | Degree   | Claimed |
|  | [ ] | cred_002  | bob@mail.com    | Employee | Pending |
|  | [ ] | cred_003  | carol@mail.com  | Degree   | Revoked |
|  | [ ] | cred_004  | dave@mail.com   | Degree   | Claimed |
|  ---------------------------------------------------------|
|                                                           |
|  Selected: 2                [Revoke Selected]             |
|                                                           |
|  Showing 1-50 of 1,247      [<] [1] [2] [3] ... [>]       |
+----------------------------------------------------------+
```

**Table Columns:**
- Checkbox (for bulk selection)
- Credential ID (link to detail)
- Recipient Email
- Recipient Address (truncated)
- Schema Type
- Batch ID (link to batch)
- Issued Date
- Status (badge)
- Actions (dropdown: View, Revoke)

**Filters:**
- Search (email, name, credential ID)
- Status (All, Pending, Claimed, Revoked)
- Schema (All, Degree, Employee, etc.)
- Date range

**Bulk Actions:**
- Revoke Selected

---

### 4.5 Credential Detail - Issuer View (`/issuer/credentials/[id]`)

**Purpose:** View single credential details and manage

**Layout:** AppShell with issuer sidebar

**Structure:**
```
+----------------------------------------------------------+
|  [< Back] Credential Details                              |
+----------------------------------------------------------+
|                                                           |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |  [CredentialDetail Component - Full Display]       |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Recipient Information                                    |
|  ---------------------------------------------------------|
|  Email:           alice@university.edu                    |
|  Wallet Address:  0x742d35Cc...f8fE21     [Copy]          |
|  DID:             did:pkh:eip155:137:0x742d... [Copy]     |
|  Claimed:         Yes (May 16, 2024 at 2:30 PM)           |
|                                                           |
|  Blockchain Proof                                         |
|  ---------------------------------------------------------|
|  Batch ID:        batch_2024_spring       [View Batch]    |
|  Merkle Root:     0xabc123...def456       [Copy]          |
|  Leaf Index:      0                                       |
|  Transaction:     0xdef456...789abc       [View on Polygon]
|  IPFS CID:        QmXyz...                [View on IPFS]  |
|                                                           |
|  Actions                                                  |
|  ---------------------------------------------------------|
|  [Revoke Credential]                                      |
|                                                           |
+----------------------------------------------------------+
```

**Revoke Modal:**
```
+------------------------------------------+
|  Revoke Credential                       |
+------------------------------------------+
|                                          |
|  Are you sure you want to revoke this    |
|  credential?                             |
|                                          |
|  Credential: cred_abc123                 |
|  Recipient: alice@university.edu         |
|                                          |
|  This action cannot be undone.           |
|                                          |
|  Reason for revocation *                 |
|  +------------------------------------+  |
|  | Academic fraud                     |  |
|  +------------------------------------+  |
|                                          |
|         [Cancel]  [Revoke]               |
+------------------------------------------+
```

---

### 4.6 Batches List (`/issuer/batches`)

**Purpose:** View all issued batches

**Layout:** AppShell with issuer sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Batches                                                  |
+----------------------------------------------------------+
|                                                           |
|  [Search: ________________]  [Schema: All v]              |
|                                                           |
|  ---------------------------------------------------------|
|  | Batch ID          | Schema  | Count | Anchored | Date  |
|  |-------------------|---------|-------|----------|-------|
|  | batch_2024_spring | Degree  | 1247  | 0xabc... | May 15|
|  | batch_2024_q1     | Employee| 89    | 0xdef... | Mar 1 |
|  | batch_2023_fall   | Degree  | 1102  | 0x123... | Dec 15|
|  ---------------------------------------------------------|
|                                                           |
|  Showing 1-10 of 15          [<] [1] [2] [>]              |
+----------------------------------------------------------+
```

---

### 4.7 Batch Detail (`/issuer/batches/[id]`)

**Purpose:** View batch details and its credentials

**Layout:** AppShell with issuer sidebar

**Structure:**
```
+----------------------------------------------------------+
|  [< Back] Batch Details                                   |
+----------------------------------------------------------+
|                                                           |
|  Batch ID: batch_2024_spring                              |
|                                                           |
|  +------------+  +------------+  +------------+           |
|  |   1,247    |  |    1,100   |  |     12     |           |
|  |  Total     |  |  Claimed   |  |  Revoked   |           |
|  +------------+  +------------+  +------------+           |
|                                                           |
|  Batch Information                                        |
|  ---------------------------------------------------------|
|  Schema:          University Degree                       |
|  Created:         May 15, 2024 at 10:30 AM                |
|  Merkle Root:     0xabc123...def456       [Copy]          |
|  Transaction:     0xdef456...789abc       [View on Polygon]
|  Block:           12345678                                |
|                                                           |
|  Credentials in Batch                                     |
|  ---------------------------------------------------------|
|  [Same table as Credentials List, filtered to batch]      |
|                                                           |
+----------------------------------------------------------+
```

---

## 5. Recipient Screens

### 5.1 Recipient Dashboard (`/recipient`)

**Purpose:** Overview of recipient's credentials

**Layout:** AppShell with recipient sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Dashboard                                                |
+----------------------------------------------------------+
|                                                           |
|  Welcome back, Alice                                      |
|  did:pkh:eip155:137:0x742d...                             |
|                                                           |
|  +------------+  +------------+  +------------+  +------+ |
|  |     2      |  |     5      |  |     0      |  |  1   | |
|  | Available  |  | Claimed    |  | Revoked    |  |Pending|
|  | to Claim   |  |            |  |            |  |Request|
|  +------------+  +------------+  +------------+  +------+ |
|                                                           |
|  New Credentials Available                    [View All]  |
|  ---------------------------------------------------------|
|  +--------------------------------------------------+    |
|  | [Icon] University Degree                          |    |
|  |        From: State University                     |    |
|  |        Issued: 2 hours ago                        |    |
|  |                              [View] [Claim]       |    |
|  +--------------------------------------------------+    |
|                                                           |
|  Pending Verification Requests                [View All]  |
|  ---------------------------------------------------------|
|  +--------------------------------------------------+    |
|  | [Icon] Acme Corporation                           |    |
|  |        Requesting: University Degree              |    |
|  |        Received: 1 day ago                        |    |
|  |                           [Review] [Reject]       |    |
|  +--------------------------------------------------+    |
|                                                           |
+----------------------------------------------------------+
```

---

### 5.2 Available Credentials (`/recipient/available`)

**Purpose:** View and claim unclaimed credentials

**Layout:** AppShell with recipient sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Available Credentials                                    |
+----------------------------------------------------------+
|                                                           |
|  These credentials have been issued to you but not yet    |
|  claimed to your wallet.                                  |
|                                                           |
|  +--------------------------------------------------+    |
|  |                                                  |    |
|  |  [Schema Icon]  University Degree                |    |
|  |                                                  |    |
|  |  From: State University                          |    |
|  |  (did:web:university.edu)                        |    |
|  |                                                  |    |
|  |  Details:                                        |    |
|  |  - Degree: Bachelor of Science                   |    |
|  |  - Major: Computer Science                       |    |
|  |  - Graduation: May 15, 2024                      |    |
|  |                                                  |    |
|  |  Issued: May 15, 2024                            |    |
|  |                                                  |    |
|  |  [View Details]  [Claim to Wallet]               |    |
|  |                                                  |    |
|  +--------------------------------------------------+    |
|                                                           |
|  +--------------------------------------------------+    |
|  |                                                  |    |
|  |  [Schema Icon]  Employee ID                      |    |
|  |  ...                                             |    |
|  +--------------------------------------------------+    |
|                                                           |
+----------------------------------------------------------+
```

**Claim Confirmation Modal:**
```
+------------------------------------------+
|  Claim Credential                        |
+------------------------------------------+
|                                          |
|  You are about to claim this credential  |
|  to your wallet.                         |
|                                          |
|  Credential: University Degree           |
|  Issuer: State University                |
|                                          |
|  This will:                              |
|  - Store credential in your wallet       |
|  - Mark as claimed (cannot be reclaimed) |
|                                          |
|         [Cancel]  [Claim]                |
+------------------------------------------+
```

---

### 5.3 My Credentials (`/recipient/credentials`)

**Purpose:** View all claimed credentials

**Layout:** AppShell with recipient sidebar

**Structure:**
```
+----------------------------------------------------------+
|  My Credentials                                           |
+----------------------------------------------------------+
|                                                           |
|  [Search: ________________]  [Type: All v]                |
|                                                           |
|  [Grid View]  [List View]                                 |
|                                                           |
|  +----------------+  +----------------+  +----------------+
|  | [Degree Icon]  |  | [ID Icon]      |  | [Cert Icon]   |
|  |                |  |                |  |               |
|  | University     |  | Employee ID    |  | Course        |
|  | Degree         |  |                |  | Certificate   |
|  |                |  |                |  |               |
|  | State Univ.    |  | Acme Corp      |  | Online Univ.  |
|  | May 2024       |  | Jan 2024       |  | Mar 2024      |
|  |                |  |                |  |               |
|  | [Valid]        |  | [Valid]        |  | [Valid]       |
|  +----------------+  +----------------+  +----------------+
|                                                           |
|  +----------------+  +----------------+                   |
|  | [Ticket Icon]  |  | [Badge Icon]   |                   |
|  |                |  |                |                   |
|  | Event Ticket   |  | Certification  |                   |
|  | ...            |  | ...            |                   |
|  +----------------+  +----------------+                   |
|                                                           |
+----------------------------------------------------------+
```

---

### 5.4 Credential Detail - Recipient View (`/recipient/credentials/[id]`)

**Purpose:** View credential and access sharing options

**Layout:** AppShell with recipient sidebar

**Structure:**
```
+----------------------------------------------------------+
|  [< Back] Credential Details                              |
+----------------------------------------------------------+
|                                                           |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |  [CredentialDetail Component - Full Display]       |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Actions                                                  |
|  ---------------------------------------------------------|
|                                                           |
|  +----------------------+  +----------------------+       |
|  |  [Share Icon]        |  |  [Download Icon]     |       |
|  |  Share Credential    |  |  Download JSON       |       |
|  +----------------------+  +----------------------+       |
|                                                           |
|  Active Share Links                                       |
|  ---------------------------------------------------------|
|  | Link              | Created    | Views | Expires | Act |
|  |-------------------|------------|-------|---------|-----|
|  | share_abc123      | May 16     | 3/10  | Jun 15  | [x] |
|  | share_def456      | May 17     | 1/--  | Never   | [x] |
|  ---------------------------------------------------------|
|                                                           |
|  Verification History                                     |
|  ---------------------------------------------------------|
|  | Verifier         | Date       | Fields Disclosed      |
|  |------------------|------------|-----------------------|
|  | Acme Corp        | May 16     | name, degree, major   |
|  | Gov Agency       | May 18     | name only             |
|  ---------------------------------------------------------|
|                                                           |
+----------------------------------------------------------+
```

---

### 5.5 Share Credential (`/recipient/credentials/[id]/share`)

**Purpose:** Create share link with selective disclosure

**Layout:** AppShell with recipient sidebar

**Structure:**
```
+----------------------------------------------------------+
|  [< Back] Share Credential                                |
+----------------------------------------------------------+
|                                                           |
|  Configure what information to share                      |
|                                                           |
|  +----------------------------------------------------+  |
|  |  Preview                                           |  |
|  |  ================================================ |  |
|  |                                                    |  |
|  |  UNIVERSITY DEGREE                                 |  |
|  |                                                    |  |
|  |  Name:         Alice Johnson                       |  |
|  |  Degree:       Bachelor of Science                 |  |
|  |  Major:        Computer Science                    |  |
|  |  GPA:          ********                            |  |
|  |  Graduation:   ********                            |  |
|  |                                                    |  |
|  |  Issuer: State University                          |  |
|  |  Status: [Valid]                                   |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Select Fields to Show                                    |
|  ---------------------------------------------------------|
|                                                           |
|  | Field         | Show/Hide           | Required |      |
|  |---------------|---------------------|----------|      |
|  | Name          | [=========>] Show   | Yes      |      |
|  | Degree        | [=========>] Show   | Yes      |      |
|  | Major         | [=========>] Show   | No       |      |
|  | GPA           | [<=========] Hide   | No       |      |
|  | Graduation    | [<=========] Hide   | No       |      |
|                                                           |
|  Share Settings                                           |
|  ---------------------------------------------------------|
|                                                           |
|  Expiration                                               |
|  ( ) Never expires                                        |
|  (*) Expires after: [7 days v]                            |
|                                                           |
|  View Limit                                               |
|  ( ) Unlimited views                                      |
|  (*) Maximum views: [10]                                  |
|                                                           |
|                            [Cancel]  [Generate Link]      |
+----------------------------------------------------------+
```

**Share Link Generated Modal:**
```
+--------------------------------------------------+
|  Share Link Created                              |
+--------------------------------------------------+
|                                                  |
|  Your share link is ready:                       |
|                                                  |
|  +--------------------------------------------+  |
|  | https://app.com/verify/share_abc123xyz    |  |
|  |                                   [Copy]  |  |
|  +--------------------------------------------+  |
|                                                  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  |            [QR Code Image]                 |  |
|  |                                            |  |
|  |                               [Download]   |  |
|  +--------------------------------------------+  |
|                                                  |
|  Settings:                                       |
|  - Expires: June 15, 2024                        |
|  - Max views: 10                                 |
|  - Hidden fields: GPA, Graduation                |
|                                                  |
|          [Done]  [Create Another]                |
+--------------------------------------------------+
```

---

### 5.6 Revoked Credentials (`/recipient/revoked`)

**Purpose:** View revoked credentials

**Layout:** AppShell with recipient sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Revoked Credentials                                      |
+----------------------------------------------------------+
|                                                           |
|  These credentials have been revoked by the issuer.       |
|                                                           |
|  [Empty State if no revoked credentials]                  |
|                                                           |
|  OR                                                       |
|                                                           |
|  +--------------------------------------------------+    |
|  |  [Revoked Badge]                                 |    |
|  |                                                  |    |
|  |  [Schema Icon]  Employee ID                      |    |
|  |                                                  |    |
|  |  From: Previous Employer Inc.                    |    |
|  |  Originally Issued: January 15, 2024             |    |
|  |  Revoked: June 1, 2024                           |    |
|  |  Reason: Employment terminated                   |    |
|  |                                                  |    |
|  |  [View Details]                                  |    |
|  +--------------------------------------------------+    |
|                                                           |
+----------------------------------------------------------+
```

---

### 5.7 Verification Requests (`/recipient/requests`)

**Purpose:** View pending verification requests from verifiers

**Layout:** AppShell with recipient sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Verification Requests                                    |
+----------------------------------------------------------+
|                                                           |
|  [Tab: Pending (2)] [Tab: History]                        |
|                                                           |
|  +--------------------------------------------------+    |
|  |                                                  |    |
|  |  [Verifier Logo]  Acme Corporation               |    |
|  |                   did:pkh:eip155:137:0xAcme...   |    |
|  |                   Type: Employer [Verified]      |    |
|  |                                                  |    |
|  |  Requesting: University Degree                   |    |
|  |                                                  |    |
|  |  They want to verify:                            |    |
|  |  - Degree equals "Bachelor's" or higher          |    |
|  |  - GPA greater than 3.0                          |    |
|  |  - Reveal: Major                                 |    |
|  |                                                  |    |
|  |  Message: "Employment verification for           |    |
|  |  Software Engineer position"                     |    |
|  |                                                  |    |
|  |  Received: 2 hours ago                           |    |
|  |  Expires: May 22, 2024                           |    |
|  |                                                  |    |
|  |  [View Details]  [Reject]  [Approve]             |    |
|  |                                                  |    |
|  +--------------------------------------------------+    |
|                                                           |
|  +--------------------------------------------------+    |
|  |                                                  |    |
|  |  [Verifier Logo]  Some Unknown Service           |    |
|  |                   did:pkh:eip155:137:0xUnk...    |    |
|  |                   Type: Unknown [Not Verified]   |    |
|  |                                                  |    |
|  |  Requesting: University Degree                   |    |
|  |                                                  |    |
|  |  They want to verify:                            |    |
|  |  - Reveal: GPA                                   |    |
|  |  - Reveal: Student ID                            |    |
|  |                                                  |    |
|  |  [!] Warning: This verifier is not verified.     |    |
|  |  Be cautious about what you share.               |    |
|  |                                                  |    |
|  |  [View Details]  [Reject]  [Approve]             |    |
|  |                                                  |    |
|  +--------------------------------------------------+    |
|                                                           |
+----------------------------------------------------------+
```

---

### 5.8 Request Detail (`/recipient/requests/[id]`)

**Purpose:** Review and respond to verification request

**Layout:** AppShell with recipient sidebar

**Structure:**
```
+----------------------------------------------------------+
|  [< Back] Verification Request                            |
+----------------------------------------------------------+
|                                                           |
|  Verifier Information                                     |
|  ---------------------------------------------------------|
|  +--------------------------------------------------+    |
|  |  [Logo]  Acme Corporation                        |    |
|  |                                                  |    |
|  |  DID: did:pkh:eip155:137:0xAcme...    [Copy]     |    |
|  |  Type: Employer                                  |    |
|  |  Website: https://acme.com            [Visit]    |    |
|  |  Status: [Verified Organization]                 |    |
|  +--------------------------------------------------+    |
|                                                           |
|  Request Details                                          |
|  ---------------------------------------------------------|
|  Credential Type: University Degree                       |
|  Received: May 20, 2024 at 10:30 AM                       |
|  Expires: May 27, 2024 at 10:30 AM                        |
|                                                           |
|  Message from Verifier:                                   |
|  "Employment verification for Software Engineer position  |
|  at our San Francisco office."                            |
|                                                           |
|  What They're Asking For:                                 |
|  ---------------------------------------------------------|
|  +--------------------------------------------------+    |
|  |  Claim                           | Type          |    |
|  |----------------------------------|---------------|    |
|  |  Degree >= Bachelor's            | Comparison    |    |
|  |  GPA > 3.0                       | Comparison    |    |
|  |  Major                           | Reveal Value  |    |
|  +--------------------------------------------------+    |
|                                                           |
|  [!] They will see:                                       |
|  - Whether your degree is Bachelor's or higher (yes/no)   |
|  - Whether your GPA is above 3.0 (yes/no)                 |
|  - Your actual major field                                |
|                                                           |
|  They will NOT see:                                       |
|  - Your exact degree name                                 |
|  - Your exact GPA value                                   |
|  - Your graduation date                                   |
|                                                           |
|  Select Credential to Use:                                |
|  ---------------------------------------------------------|
|  (*) University Degree - State University (May 2024)      |
|  ( ) University Degree - Online University (Dec 2022)     |
|                                                           |
|                   [Reject Request]  [Approve & Send]      |
+----------------------------------------------------------+
```

**Approve Confirmation Modal:**
```
+------------------------------------------+
|  Confirm Approval                        |
+------------------------------------------+
|                                          |
|  You are about to share verification     |
|  results with Acme Corporation.          |
|                                          |
|  They will receive:                      |
|  - Degree >= Bachelor's: YES             |
|  - GPA > 3.0: YES                        |
|  - Major: Computer Science               |
|                                          |
|  They will NOT receive your actual GPA   |
|  or other hidden information.            |
|                                          |
|         [Cancel]  [Approve]              |
+------------------------------------------+
```

**Reject Confirmation Modal:**
```
+------------------------------------------+
|  Reject Request                          |
+------------------------------------------+
|                                          |
|  Are you sure you want to reject this    |
|  verification request?                   |
|                                          |
|  From: Acme Corporation                  |
|                                          |
|  Reason (optional):                      |
|  +------------------------------------+  |
|  | Don't wish to share this info     |  |
|  +------------------------------------+  |
|                                          |
|         [Cancel]  [Reject]               |
+------------------------------------------+
```

---

### 5.9 Request History (`/recipient/history`)

**Purpose:** View past approved/rejected requests

**Layout:** AppShell with recipient sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Verification History                                     |
+----------------------------------------------------------+
|                                                           |
|  [Search: ________________]  [Status: All v]              |
|                                                           |
|  ---------------------------------------------------------|
|  | Verifier        | Credential | Date    | Status | Act |
|  |-----------------|------------|---------|--------|-----|
|  | Acme Corp       | Degree     | May 20  | Approved| [>]|
|  | Gov Agency      | Degree     | May 18  | Approved| [>]|
|  | Unknown Svc     | Employee   | May 15  | Rejected| [>]|
|  | Bank Corp       | Identity   | May 10  | Expired | [>]|
|  ---------------------------------------------------------|
|                                                           |
|  Showing 1-10 of 24          [<] [1] [2] [3] [>]          |
+----------------------------------------------------------+
```

---

## 6. Verifier Screens

### 6.1 Verifier Dashboard (`/verifier`)

**Purpose:** Overview of verification activity

**Layout:** AppShell with verifier sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Dashboard                                    [+ Request] |
+----------------------------------------------------------+
|                                                           |
|  Welcome, Acme Corporation                                |
|  did:pkh:eip155:137:0xAcme...                             |
|                                                           |
|  +------------+  +------------+  +------------+  +------+ |
|  |     12     |  |     8      |  |     2      |  |  2   | |
|  |  Total     |  |  Approved  |  |  Rejected  |  |Pending|
|  |  Requests  |  |            |  |            |  |      |
|  +------------+  +------------+  +------------+  +------+ |
|                                                           |
|  Pending Responses                            [View All]  |
|  ---------------------------------------------------------|
|  | User Address    | Credential | Requested | Status     |
|  |-----------------|------------|-----------|------------|
|  | 0x742d...fE21   | Degree     | 2h ago    | Pending    |
|  | 0x891a...bC32   | Employee   | 1d ago    | Pending    |
|  ---------------------------------------------------------|
|                                                           |
|  Recent Verifications                         [View All]  |
|  ---------------------------------------------------------|
|  | User Address    | Credential | Date      | Result     |
|  |-----------------|------------|-----------|------------|
|  | 0x456f...aD78   | Degree     | Yesterday | Approved   |
|  | 0x789g...eF90   | Identity   | 2 days    | Rejected   |
|  ---------------------------------------------------------|
|                                                           |
+----------------------------------------------------------+
```

---

### 6.2 Verifier Profile (`/verifier/profile`)

**Purpose:** Edit verifier organization profile

**Layout:** AppShell with verifier sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Organization Profile                                     |
+----------------------------------------------------------+
|                                                           |
|  This information is shown to users when you request      |
|  verification.                                            |
|                                                           |
|  +----------------------------------------------------+  |
|  |  Logo                                              |  |
|  |  +------------+                                    |  |
|  |  |            |  [Upload New]                      |  |
|  |  |   [Logo]   |  Recommended: 200x200px            |  |
|  |  |            |                                    |  |
|  |  +------------+                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Organization Name *                                      |
|  +----------------------------------------------------+  |
|  | Acme Corporation                                   |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Organization Type *                                      |
|  +----------------------------------------------------+  |
|  | Employer                                       [v] |  |
|  +----------------------------------------------------+  |
|  Options: Employer, University, Government, Service,      |
|  Healthcare, Financial, Other                             |
|                                                           |
|  Website                                                  |
|  +----------------------------------------------------+  |
|  | https://acme.com                                   |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Description                                              |
|  +----------------------------------------------------+  |
|  | Leading technology company specializing in...      |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Your DID (read-only)                                     |
|  +----------------------------------------------------+  |
|  | did:pkh:eip155:137:0xAcme...              [Copy]   |  |
|  +----------------------------------------------------+  |
|                                                           |
|                               [Cancel]  [Save Changes]    |
+----------------------------------------------------------+
```

---

### 6.3 New Verification Request (`/verifier/request/new`)

**Purpose:** Create verification request for a user

**Layout:** AppShell with verifier sidebar

**Structure:**
```
+----------------------------------------------------------+
|  New Verification Request                                 |
+----------------------------------------------------------+
|                                                           |
|  Step 1: Target User                                      |
|  ========================================                 |
|                                                           |
|  User's Email or Wallet Address *                         |
|  +----------------------------------------------------+  |
|  | alice@example.com                                  |  |
|  +----------------------------------------------------+  |
|  We'll look up their wallet address automatically.        |
|                                                           |
|  Resolved Address: 0x742d35Cc...f8fE21 [Found]            |
|                                                           |
|  Step 2: Credential Type                                  |
|  ========================================                 |
|                                                           |
|  What credential do you need to verify? *                 |
|  +----------------------------------------------------+  |
|  | University Degree                              [v] |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Step 3: What to Verify                                   |
|  ========================================                 |
|                                                           |
|  Add claims you want to verify:                           |
|                                                           |
|  +--------------------------------------------------+    |
|  | Field      | Condition        | Value     | [x]  |    |
|  |------------|------------------|-----------|------|    |
|  | degree     | equals           | Bachelor  | [x]  |    |
|  | gpa        | greater than     | 3.0       | [x]  |    |
|  | major      | reveal value     | --        | [x]  |    |
|  +--------------------------------------------------+    |
|                                                           |
|  [+ Add Another Claim]                                    |
|                                                           |
|  Available conditions:                                    |
|  - equals: Exact match                                    |
|  - not_equals: Must not match                             |
|  - greater_than: Numeric comparison                       |
|  - less_than: Numeric comparison                          |
|  - contains: Substring match                              |
|  - exists: Field has value                                |
|  - reveal: Request actual value                           |
|                                                           |
|  Step 4: Message (Optional)                               |
|  ========================================                 |
|                                                           |
|  Add a message explaining why you need this verification: |
|  +----------------------------------------------------+  |
|  | Employment verification for Software Engineer      |  |
|  | position at our company.                           |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Step 5: Expiration                                       |
|  ========================================                 |
|                                                           |
|  Request expires after:                                   |
|  +----------------------------------------------------+  |
|  | 7 days                                         [v] |  |
|  +----------------------------------------------------+  |
|  Options: 1 day, 3 days, 7 days, 14 days, 30 days         |
|                                                           |
|                        [Cancel]  [Send Request]           |
+----------------------------------------------------------+
```

**Request Sent Confirmation:**
```
+------------------------------------------+
|  Request Sent                            |
+------------------------------------------+
|                                          |
|  Your verification request has been      |
|  sent to 0x742d...f8fE.                  |
|                                          |
|  Request ID: req_abc123                  |
|  Expires: May 27, 2024                   |
|                                          |
|  You'll be notified when they respond.   |
|                                          |
|    [View Request]  [Create Another]      |
+------------------------------------------+
```

---

### 6.4 Requests List (`/verifier/requests`)

**Purpose:** View all verification requests

**Layout:** AppShell with verifier sidebar

**Structure:**
```
+----------------------------------------------------------+
|  Verification Requests                       [+ Request]  |
+----------------------------------------------------------+
|                                                           |
|  [Tab: All] [Tab: Pending (2)] [Tab: Approved] [Tab: Rejected]
|                                                           |
|  [Search: ________________]  [Type: All v]                |
|                                                           |
|  ---------------------------------------------------------|
|  | ID        | User Address   | Type    | Status | Date  |
|  |-----------|----------------|---------|--------|-------|
|  | req_001   | 0x742d...fE21  | Degree  | Pending| May 20|
|  | req_002   | 0x891a...bC32  | Employee| Pending| May 19|
|  | req_003   | 0x456f...aD78  | Degree  | Approved|May 18|
|  | req_004   | 0x789g...eF90  | Identity| Rejected|May 17|
|  ---------------------------------------------------------|
|                                                           |
|  Showing 1-10 of 24          [<] [1] [2] [3] [>]          |
+----------------------------------------------------------+
```

---

### 6.5 Request Detail (`/verifier/requests/[id]`)

**Purpose:** View request details and response

**Layout:** AppShell with verifier sidebar

**Pending State:**
```
+----------------------------------------------------------+
|  [< Back] Request Details                                 |
+----------------------------------------------------------+
|                                                           |
|  Request ID: req_abc123                                   |
|  Status: [Pending]                                        |
|                                                           |
|  Request Information                                      |
|  ---------------------------------------------------------|
|  Target User:     0x742d35Cc...f8fE21                     |
|  Credential Type: University Degree                       |
|  Sent:            May 20, 2024 at 10:30 AM                |
|  Expires:         May 27, 2024 at 10:30 AM                |
|                                                           |
|  Claims Requested:                                        |
|  ---------------------------------------------------------|
|  | Claim                    | Type                        |
|  |--------------------------|---------------------------  |
|  | degree >= Bachelor's     | Comparison                  |
|  | gpa > 3.0                | Comparison                  |
|  | major                    | Reveal                      |
|  ---------------------------------------------------------|
|                                                           |
|  Message Sent:                                            |
|  "Employment verification for Software Engineer position" |
|                                                           |
|  Waiting for user response...                             |
|                                                           |
|                                    [Cancel Request]       |
+----------------------------------------------------------+
```

**Approved State:**
```
+----------------------------------------------------------+
|  [< Back] Request Details                                 |
+----------------------------------------------------------+
|                                                           |
|  Request ID: req_abc123                                   |
|  Status: [Approved]                                       |
|                                                           |
|  Request Information                                      |
|  ---------------------------------------------------------|
|  [Same as above]                                          |
|                                                           |
|  Verification Results                                     |
|  =========================================================|
|                                                           |
|  +----------------------------------------------------+  |
|  |  [Check Icon] VERIFICATION SUCCESSFUL              |  |
|  |                                                    |  |
|  |  Responded: May 21, 2024 at 2:30 PM                |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Results:                                                 |
|  ---------------------------------------------------------|
|  | Claim                | Result                         |
|  |----------------------|--------------------------------|
|  | degree >= Bachelor's | [Check] TRUE                   |
|  | gpa > 3.0            | [Check] TRUE                   |
|  | major                | Computer Science               |
|  ---------------------------------------------------------|
|                                                           |
|  Credential Verification:                                 |
|  ---------------------------------------------------------|
|  [x] Merkle proof valid                                   |
|  [x] Anchored on Polygon (Block: 12345678)                |
|  [x] Issuer trusted (did:web:university.edu)              |
|  [x] Not revoked                                          |
|                                                           |
|                            [Download Report]              |
+----------------------------------------------------------+
```

**Rejected State:**
```
+----------------------------------------------------------+
|  [< Back] Request Details                                 |
+----------------------------------------------------------+
|                                                           |
|  Request ID: req_abc123                                   |
|  Status: [Rejected]                                       |
|                                                           |
|  [Same request info as above]                             |
|                                                           |
|  Response                                                 |
|  =========================================================|
|                                                           |
|  +----------------------------------------------------+  |
|  |  [X Icon] REQUEST REJECTED                         |  |
|  |                                                    |  |
|  |  The user declined to share this verification.     |  |
|  |  Responded: May 21, 2024 at 2:30 PM                |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Reason provided (if any):                                |
|  "I don't wish to share this information."                |
|                                                           |
+----------------------------------------------------------+
```

---

## 7. Verification Public Screens

### 7.1 Share Verification (`/verify/[token]`)

**Purpose:** Public page for verifying shared credentials

**Layout:** Centered card, no app shell (public page)

**Valid Credential:**
```
+----------------------------------------------------------+
|                                                           |
|                      [App Logo]                           |
|                                                           |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |  [Check Badge] VERIFIED CREDENTIAL                 |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |  UNIVERSITY DEGREE                                 |  |
|  |  ================================================ |  |
|  |                                                    |  |
|  |  Name:         Alice Johnson                       |  |
|  |  Degree:       Bachelor of Science                 |  |
|  |  Major:        Computer Science                    |  |
|  |  GPA:          ********                            |  |
|  |  Graduation:   ********                            |  |
|  |                                                    |  |
|  |  ------------------------------------------------ |  |
|  |                                                    |  |
|  |  Issuer: State University                          |  |
|  |  (did:web:university.edu)                          |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  Verification Details                                     |
|  ---------------------------------------------------------|
|  [x] Merkle proof valid                                   |
|  [x] Anchored on Polygon                                  |
|      Transaction: 0xabc123...        [View on Explorer]   |
|  [x] Issuer is trusted                                    |
|  [x] Credential not revoked                               |
|                                                           |
|  Share Information                                        |
|  ---------------------------------------------------------|
|  Created: May 16, 2024                                    |
|  Views: 4 of 10                                           |
|  Expires: June 15, 2024                                   |
|                                                           |
|  ---------------------------------------------------------|
|  This credential was verified using [App Name].           |
|  [Learn More]                                             |
|                                                           |
+----------------------------------------------------------+
```

**Invalid/Expired Credential:**
```
+----------------------------------------------------------+
|                                                           |
|                      [App Logo]                           |
|                                                           |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |  [X Badge] VERIFICATION FAILED                     |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |  This share link is no longer valid.               |  |
|  |                                                    |  |
|  |  Possible reasons:                                 |  |
|  |  - The link has expired                            |  |
|  |  - The maximum view limit was reached              |  |
|  |  - The share was revoked by the owner              |  |
|  |  - The credential was revoked by the issuer        |  |
|  |                                                    |  |
|  |  Please contact the credential holder for a        |  |
|  |  new share link.                                   |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                           |
|  ---------------------------------------------------------|
|  [Learn about verified credentials]                       |
|                                                           |
+----------------------------------------------------------+
```

---

## 8. Component Specifications

### 8.1 Form Components

#### 8.1.1 Input

**Variants:**
- Default
- With icon (left or right)
- With addon (prefix/suffix text)
- Error state
- Disabled state

**Props:**
- `label`: string
- `placeholder`: string
- `error`: string
- `helperText`: string
- `required`: boolean
- `disabled`: boolean
- `icon`: LucideIcon
- `iconPosition`: "left" | "right"

#### 8.1.2 Select

**Variants:**
- Default dropdown
- Searchable
- Multi-select
- With icons

**Props:**
- `label`: string
- `options`: { value: string, label: string, icon?: LucideIcon }[]
- `placeholder`: string
- `error`: string
- `multiple`: boolean
- `searchable`: boolean

#### 8.1.3 Toggle/Switch

**Props:**
- `label`: string
- `checked`: boolean
- `onChange`: (checked: boolean) => void
- `disabled`: boolean

#### 8.1.4 DatePicker

**Props:**
- `label`: string
- `value`: Date
- `onChange`: (date: Date) => void
- `minDate`: Date
- `maxDate`: Date

#### 8.1.5 FileUpload

**Variants:**
- Dropzone (large area)
- Button (compact)

**Props:**
- `accept`: string (e.g., ".csv,.xlsx")
- `maxSize`: number (bytes)
- `onUpload`: (file: File) => void
- `multiple`: boolean

### 8.2 Feedback Components

#### 8.2.1 Toast

**Variants:**
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)

**Props:**
- `title`: string
- `description`: string
- `duration`: number (ms)
- `action`: { label: string, onClick: () => void }

#### 8.2.2 Modal/Dialog

**Props:**
- `open`: boolean
- `onClose`: () => void
- `title`: string
- `description`: string
- `children`: React.ReactNode
- `footer`: React.ReactNode

#### 8.2.3 Alert

**Variants:**
- Success
- Error
- Warning
- Info

**Props:**
- `variant`: "success" | "error" | "warning" | "info"
- `title`: string
- `description`: string
- `dismissible`: boolean

#### 8.2.4 Progress

**Variants:**
- Bar (horizontal)
- Circular
- Steps

**Props:**
- `value`: number (0-100)
- `showValue`: boolean
- `size`: "sm" | "md" | "lg"

### 8.3 Navigation Components

#### 8.3.1 Tabs

**Props:**
- `tabs`: { value: string, label: string, count?: number }[]
- `activeTab`: string
- `onChange`: (value: string) => void

#### 8.3.2 Breadcrumb

**Props:**
- `items`: { label: string, href?: string }[]

#### 8.3.3 Pagination

**Props:**
- `currentPage`: number
- `totalPages`: number
- `onPageChange`: (page: number) => void
- `pageSize`: number
- `totalItems`: number

### 8.4 Data Display Components

#### 8.4.1 Badge

**Variants:**
- Default
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)

**Props:**
- `variant`: string
- `children`: React.ReactNode
- `dot`: boolean (show status dot)

#### 8.4.2 Avatar

**Props:**
- `src`: string
- `alt`: string
- `fallback`: string (initials)
- `size`: "sm" | "md" | "lg"

#### 8.4.3 Tooltip

**Props:**
- `content`: React.ReactNode
- `children`: React.ReactNode
- `position`: "top" | "bottom" | "left" | "right"

#### 8.4.4 CopyButton

**Props:**
- `value`: string
- `onCopy`: () => void

**Behavior:**
- Shows copy icon
- On click: copies to clipboard, shows check icon
- After 2s: reverts to copy icon

---

## 9. Design System

### 9.1 Color Tokens

```css
/* Primary */
--primary: #2563eb;        /* Blue 600 */
--primary-hover: #1d4ed8;  /* Blue 700 */
--primary-light: #dbeafe;  /* Blue 100 */

/* Semantic */
--success: #16a34a;        /* Green 600 */
--success-light: #dcfce7;  /* Green 100 */
--error: #dc2626;          /* Red 600 */
--error-light: #fee2e2;    /* Red 100 */
--warning: #ca8a04;        /* Yellow 600 */
--warning-light: #fef9c3;  /* Yellow 100 */

/* Neutral */
--background: #ffffff;
--foreground: #0f172a;     /* Slate 900 */
--muted: #64748b;          /* Slate 500 */
--muted-light: #f1f5f9;    /* Slate 100 */
--border: #e2e8f0;         /* Slate 200 */

/* Card */
--card: #ffffff;
--card-hover: #f8fafc;     /* Slate 50 */
```

### 9.2 Typography

```css
/* Font Family */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### 9.3 Spacing

```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### 9.4 Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* Pill shape */
```

### 9.5 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

### 9.6 Breakpoints

```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;
```

### 9.7 Z-Index Scale

```css
--z-dropdown: 50;
--z-sticky: 100;
--z-modal: 200;
--z-popover: 300;
--z-tooltip: 400;
--z-toast: 500;
```

---

## Document End

This completes the Screen Requirements Document. All 25 screens across 4 roles (Public, Issuer, Recipient, Verifier) have been specified with detailed layouts, elements, states, and interactions.

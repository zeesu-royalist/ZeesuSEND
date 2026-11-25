# ZeesuSEND — Anonymous File, Image & Text Sharing Web Application

A modern, fast, production-ready file, image, and text sharing web application built with Next.js App Router, TypeScript, Tailwind CSS, Neon Serverless PostgreSQL, and S3-Compatible Storage.

> [!IMPORTANT]
> **STRICT NO-AUTHENTICATION REQUIREMENT**
> ZeesuSEND contains **NO authentication system**. There are no user accounts, login forms, signup flows, passwords, profile pages, or dashboards. The entire application operates anonymously using secure 6-character transfer keys.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Installation](#4-installation)
5. [Environment Variables](#5-environment-variables)
6. [Database & Storage Setup](#6-database--storage-setup)
7. [Local Development](#7-local-development)
8. [Running the Project](#8-running-the-project)
9. [Transfer Key Generation](#9-transfer-key-generation)
10. [Upload Architecture](#10-upload-architecture)
11. [Download Architecture](#11-download-architecture)
12. [Signed URL Architecture](#12-signed-url-architecture)
13. [Expiration System](#13-expiration-system)
14. [Download Limits](#14-download-limits)
15. [Rate Limiting](#15-rate-limiting)
16. [Security](#16-security)
17. [Deployment to Vercel](#17-deployment-to-vercel)
18. [Cleanup System](#18-cleanup-system)

---

## 1. Project Overview
ZeesuSEND is a minimal "Send & Receive" application. A sender uploads one or multiple files/images or types text, selects optional transfer settings (expiration time, download limits), and receives a cryptographically secure 6-character transfer key (e.g., `1A3S7K`). A receiver inputs this key at `/receive` or via direct URL (`/receive?key=1A3S7K`) to preview and download the content.

## 2. Features
- **Zero Login / No Accounts**: Every user can send and receive immediately.
- **File, Image & Text Sharing**: Supports single or multi-file transfers and raw text snippet sharing.
- **Cryptographic 6-Character Keys**: Generated using `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no ambiguous chars `0, O, I, 1`).
- **Private S3-Compatible Storage**: Files stored under random internal UUIDs in a non-public bucket.
- **Short-Lived Signed URLs**: Exclusively temporary signed download links generated server-side.
- **Atomic Download Counting**: Race-condition-safe PostgreSQL atomic counter updates.
- **Configurable Settings**:
  - Expiration: 1 hour, 6 hours, 24 hours (default), 3 days, 7 days, Never.
  - Download Limit: Unlimited (default), 1 download, 5 downloads, 10 downloads.
- **Previews**: Inline previews for images (JPEG, PNG, WebP, GIF), video, PDF, and text.
- **Batch ZIP Downloads**: "Download All" packs multi-file transfers into a ZIP archive client-side via `JSZip`.
- **Light & Dark Mode**: Modern SaaS interface with smooth transitions.

## 3. Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS, PostCSS, Lucide React Icons
- **Database**: Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **Storage**: S3-Compatible Storage (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- **Validation**: Zod
- **Archives**: JSZip & FileSaver

---

## 4. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/ZeesuSEND.git
cd ZeesuSEND
npm install
```

---

## 5. Environment Variables
Create `.env.local` based on `.env.example`:

```bash
cp .env.example .env.local
```

Required variables:
```env
# Neon Serverless PostgreSQL Database URL
DATABASE_URL=postgresql://username:password@ep-xyz.neon.tech/neondb?sslmode=require

# S3-Compatible Storage
AWS_ENDPOINT_URL_S3=https://your-endpoint.storage.neon.tech
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=transfers

# Application Settings
MAX_FILE_SIZE_MB=100
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Database & Storage Setup
1. **Neon Database**: Create a project at [neon.tech](https://neon.tech) and copy your `DATABASE_URL`.
2. **Neon S3 Storage**: Retrieve your S3 endpoint, Access Key, and Secret Key.
3. Tables and buckets are automatically verified and managed by the application.

---

## 7. Local Development
Start the local Next.js dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Running the Project
```bash
# Development mode
npm run dev

# Lint check
npm run lint

# Production build
npm run build

# Start production server
npm run start
```

---

## 9. Transfer Key Generation
Transfer keys are generated server-side using Web Crypto (`crypto.getRandomValues`).
- Character set: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- Length: 6 characters
- Collision strategy: Retries key generation up to 5 times if database `UNIQUE(transfer_key)` constraint flags a collision.

---

## 10. Upload Architecture
1. Client selects files/text and submits to `POST /api/transfers`.
2. Server validates file size (< `MAX_FILE_SIZE_MB`) and MIME types.
3. Server generates unique 6-character key and inserts `transfers` DB row.
4. Server generates short-lived presigned PUT URLs for browser direct-upload to S3 storage.
5. Server records `transfer_items` and returns transfer payload to sender.

---

## 11. Download Architecture
1. Receiver enters key on `/receive` or opens `/transfer/[key]`.
2. Server queries DB record by key, checking expiration and download count limits.
3. On download trigger (`POST /api/transfers/[key]/download`), server atomically increments `download_count`.
4. Server generates 300-second presigned S3 URLs with original attachment headers.

---

## 12. Signed URL Architecture
All files remain strictly private. The browser receives short-lived signed URLs:
- Preview signed URLs expire in 3600s.
- Download signed URLs expire in 300s with attachment download headers.

---

## 13. Expiration System
Supported options: `1h`, `6h`, `24h` (default), `3d`, `7d`, `never`.
- Server validates `expires_at < NOW()` on every GET/POST request.
- Expired transfers return HTTP 410 ("This transfer has expired.").

---

## 14. Download Limits
Supported options: `unlimited` (default), `1`, `5`, `10`.
- Handled atomically in PostgreSQL queries.
- Prevents race conditions from parallel requests.

---

## 15. Rate Limiting
- Key lookups (`/api/transfers/[key]`): 30 requests / min per IP.
- Downloads (`/api/transfers/[key]/download`): 20 requests / min per IP.
- Transfer creation (`/api/transfers`): 20 requests / min per IP.

---

## 16. Security
- Private bucket access.
- No public URLs.
- Credentials isolated to server execution.
- SVG / HTML uploaded content sanitized and rendered safely without script execution.

---

## 17. Deployment to Vercel
1. Push project to GitHub.
2. Import project in Vercel.
3. Add Environment Variables:
   - `DATABASE_URL`
   - `AWS_ENDPOINT_URL_S3`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `S3_BUCKET_NAME`
   - `MAX_FILE_SIZE_MB`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!

---

## 18. Cleanup System
Run `node scripts/cleanup-expired.mjs` periodically:

```bash
node scripts/cleanup-expired.mjs
```

This deletes expired storage objects from bucket `transfers` and removes expired database records.

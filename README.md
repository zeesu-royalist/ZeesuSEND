# ZeesuSEND — Anonymous File, Image & Text Sharing Web Application

A modern, fast, production-ready file, image, and text sharing web application built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

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
6. [Supabase Setup](#6-supabase-setup)
7. [Database Migration](#7-database-migration)
8. [Storage Setup](#8-storage-setup)
9. [RLS Setup](#9-rls-setup)
10. [Local Development](#10-local-development)
11. [Running the Project](#11-running-the-project)
12. [Transfer Key Generation](#12-transfer-key-generation)
13. [Upload Architecture](#13-upload-architecture)
14. [Download Architecture](#14-download-architecture)
15. [Signed URL Architecture](#15-signed-url-architecture)
16. [Expiration System](#16-expiration-system)
17. [Download Limits](#17-download-limits)
18. [Rate Limiting](#18-rate-limiting)
19. [Security](#19-security)
20. [Deployment to Vercel](#20-deployment-to-vercel)
21. [Production Configuration](#21-production-configuration)
22. [Cleanup System](#22-cleanup-system)

---

## 1. Project Overview
ZeesuSEND is a minimal "Send & Receive" application. A sender uploads one or multiple files/images or types text, selects optional transfer settings (expiration time, download limits), and receives a cryptographically secure 6-character transfer key (e.g., `1A3S7K`). A receiver inputs this key at `/receive` or via direct URL (`/receive?key=1A3S7K`) to preview and download the content.

## 2. Features
- **Zero Login / No Accounts**: Every user can send and receive immediately.
- **File, Image & Text Sharing**: Supports single or multi-file transfers and raw text snippet sharing.
- **Cryptographic 6-Character Keys**: Generated using `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no ambiguous chars `0, O, I, 1`).
- **Private Supabase Storage**: Files stored under random internal UUIDs in a non-public bucket.
- **Short-Lived Signed URLs**: Exclusively temporary signed download links generated server-side.
- **Atomic Download Counting**: Multi-thread safe PostgreSQL stored function prevents race condition download bypasses.
- **Configurable Settings**:
  - Expiration: 1 hour, 6 hours, 24 hours (default), 3 days, 7 days, Never.
  - Download Limit: Unlimited (default), 1 download, 5 downloads, 10 downloads.
- **Previews**: Inline previews for images (JPEG, PNG, WebP, GIF), video, PDF, and text.
- **Batch ZIP Downloads**: "Download All" packs multi-file transfers into a ZIP archive client-side via `JSZip`.
- **Light & Dark Mode**: Modern glassmorphic SaaS interface with smooth transitions.

## 3. Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS, PostCSS, Lucide React Icons
- **Database & Storage**: Supabase PostgreSQL & Private Supabase Storage
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
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MAX_FILE_SIZE_MB=100
```

> [!CAUTION]
> NEVER prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`. Keep it strictly on the server.

---

## 6. Supabase Setup
1. Log in to [Supabase Dashboard](https://supabase.com).
2. Create a new PostgreSQL project.
3. Retrieve Project URL, Public Anon Key, and Service Role Key from **Settings -> API**.

---

## 7. Database Migration
Run the SQL migration script in your Supabase SQL Editor (`supabase/migrations/20260809000000_create_transfers_schema.sql`):

This creates:
- `transfers` table
- `transfer_items` table
- Indexes on `transfer_key`, `expires_at`, `status`
- `increment_transfer_download_count` atomic function.

---

## 8. Storage Setup
Create a private bucket named `transfers` in Supabase Storage:
- **Bucket Name**: `transfers`
- **Public**: `false` (Private bucket)

---

## 9. RLS Setup
Row Level Security (RLS) is enabled on `transfers` and `transfer_items`. Direct client access is denied (`USING (false)`), forcing all database and storage operations through server API routes with the Service Role key.

---

## 10. Local Development
Start the local Next.js dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 11. Running the Project
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

## 12. Transfer Key Generation
Transfer keys are generated server-side using Web Crypto (`crypto.getRandomValues`).
- Character set: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- Length: 6 characters
- Collision strategy: Retries key generation up to 5 times if database `UNIQUE(transfer_key)` constraint flags a collision.

---

## 13. Upload Architecture
1. Client selects files/text and submits to `POST /api/transfers`.
2. Server validates file size (< `MAX_FILE_SIZE_MB`) and MIME types.
3. Server generates unique 6-character key and inserts `transfers` DB row.
4. Server uploads file streams to private Supabase bucket path `{transferId}/{randomUuid}.bin`.
5. Server inserts `transfer_items` records and returns transfer payload to sender.

---

## 14. Download Architecture
1. Receiver enters key on `/receive` or opens `/transfer/[key]`.
2. Server queries DB record by key, checking expiration and download count limits.
3. On download trigger (`POST /api/transfers/[key]/download`), server calls atomic function `increment_transfer_download_count`.
4. Server generates 300-second signed storage URLs with original file headers.

---

## 15. Signed URL Architecture
All files remain strictly private. The browser receives short-lived Supabase Signed URLs:
- Preview signed URLs expire in 3600s.
- Download signed URLs expire in 300s with `download: filename` attachment headers.

---

## 16. Expiration System
Supported options: `1h`, `6h`, `24h` (default), `3d`, `7d`, `never`.
- Server validates `expires_at < NOW()` on every GET/POST request.
- Expired transfers return HTTP 410 ("This transfer has expired.").

---

## 17. Download Limits
Supported options: `unlimited` (default), `1`, `5`, `10`.
- Handled via `FOR UPDATE` lock in PostgreSQL stored function `increment_transfer_download_count`.
- Prevents race conditions from parallel requests.

---

## 18. Rate Limiting
- Key lookups (`/api/transfers/[key]`): 30 requests / min per IP.
- Downloads (`/api/transfers/[key]/download`): 20 requests / min per IP.
- Transfer creation (`/api/transfers`): 20 requests / min per IP.

---

## 19. Security
- Private bucket access.
- No public URLs.
- Service Role Key isolated to server execution.
- SVG / HTML uploaded content sanitized and rendered safely without script execution.

---

## 20. Deployment to Vercel
1. Push project to GitHub.
2. Import project in Vercel.
3. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MAX_FILE_SIZE_MB`
4. Deploy!

---

## 21. Production Configuration
For global scale:
- Plug `@upstash/ratelimit` into `src/lib/transfer/rate-limiter.ts`.
- Set up Vercel Cron or Supabase `pg_cron` for automated cleanup.

---

## 22. Cleanup System
Run `scripts/cleanup-expired.ts` periodically:

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/cleanup-expired.ts
```

This deletes expired storage objects from bucket `transfers` and removes expired database records.

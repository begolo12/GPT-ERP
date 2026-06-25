# GPT-ERP

ERP multi-company untuk **Daniswara Group** (PT. Ganendra Arsyila Semesta & PT. Daniswara Jaya Perkasa).

Dibangun dengan **Next.js 15 + Prisma + PostgreSQL (Neon) + Auth.js v5**, di-deploy ke **Vercel**.

## Stack

- **Framework**: Next.js 15 (App Router, Server Actions, Route Handlers)
- **Database**: PostgreSQL via [Neon](https://neon.tech) (serverless)
- **ORM**: Prisma 6
- **Auth**: [Auth.js v5](https://authjs.dev) (Argon2id + JWT session)
- **UI**: React 19, CSS Modules, design tokens (no Tailwind)
- **State**: TanStack Query + Zustand
- **Form**: React Hook Form + Zod
- **Charts**: Recharts
- **PDF/Excel**: jsPDF + ExcelJS (client-side)
- **File storage**: Vercel Blob
- **Monorepo**: pnpm workspaces

## Struktur

```
gpt-erp/
\u251c\u2500 apps/
\u2502  \u2514\u2500 web/                  # Next.js app (FE + API + BFF)
\u251c\u2500 packages/
\u2502  \u2514\u2500 shared/              # shared types & Zod schemas
\u251c\u2500 docs/                     # arsitektur, posting rules, approval rules
\u2514\u2500 .github/workflows/        # CI
```

## Setup Lokal

### Prasyarat
- Node.js >= 20
- pnpm >= 11 (`npm i -g pnpm`)
- Akun [Neon](https://neon.tech) (free)
- Akun [Vercel](https://vercel.com) (free)

### Langkah

1. **Clone & install**
   ```bash
   git clone https://github.com/<your-org>/GPT-ERP.git
   cd GPT-ERP
   pnpm install
   ```

2. **Setup Neon**
   - Buat project baru di Neon
   - Copy **pooled connection string** ke `.env` sebagai `DATABASE_URL`

3. **Setup Auth Secret**
   ```bash
   openssl rand -base64 32
   ```
   Paste ke `.env` sebagai `AUTH_SECRET`.

4. **Copy env**
   ```bash
   cp .env.example .env
   # edit .env sesuai nilai di atas
   ```

5. **Setup database**
   ```bash
   pnpm db:push        # apply schema ke Neon
   pnpm db:seed        # seed COA, company, user admin
   ```

6. **Run dev**
   ```bash
   pnpm dev
   ```
   Buka http://localhost:3000

## Deploy ke Vercel

1. Push ke GitHub
2. Import project di [vercel.com/new](https://vercel.com/new)
3. Set environment variables di Vercel dashboard (sama dengan `.env`)
4. Tambah [Vercel Blob](https://vercel.com/dashboard/stores) store, copy token
5. Deploy

Auto-deploy setiap push ke `main`. Preview deploy untuk PR/branch lain.

## Scripts

| Script | Fungsi |
|---|---|
| `pnpm dev` | Jalankan Next.js dev server |
| `pnpm build` | Build production |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |
| `pnpm db:push` | Push schema ke DB |
| `pnpm db:seed` | Seed initial data |
| `pnpm db:studio` | Buka Prisma Studio |

## Kredensial Awal

Lihat [`CREDENTIALS.md`](./CREDENTIALS.md).

## Lisensi

Private \u2014 Daniswara Group.

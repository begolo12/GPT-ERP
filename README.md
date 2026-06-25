# GPT-ERP

**ERP multi-company** untuk **Daniswara Group** (PT. Ganendra Arsyila Semesta & PT. Daniswara Jaya Perkasa) — general supplier konstruksi.

Dibangun dari nol dengan stack modern, deployed ke **Vercel** + database **Neon Postgres**.

---

## Fitur

### Master Data
- **Vendor, Produk, Proyek, Gudang, Pelanggan** — CRUD dengan search, filter, status aktif/non-aktif
- **12 master settings** (Satuan, Kategori Produk, Metode Pembayaran, Pengaturan Pajak, dll)

### Transaksi (15+ doc types)
- **OP (Operasi Pembelian)**: PR, PO, DO, GR, Faktur AP
- **Sales (Penjualan)**: Quotation, SO, Surat Jalan, Faktur AR
- **Keuangan**: Pembayaran, Jurnal Memorial, Hutang
- **GA**: Pengadaan, Perawatan Kendaraan
- **HR**: Penggajian

### Workflow
- **Approval bertingkat** per DocType (SPV, Manager, Direktur) dengan escalation otomatis (e.g. PO > 100jt → Direktur)
- **Auto-posting** double-entry ke jurnal saat APPROVED
- **Carry-forward** semantics (vendor, proyek, hasPPN) antar dokumen dalam chain

### Multi-Company
- **3 company** (GROUP, GAS, DJP) + **Konsolidasi** view untuk admin
- Company switcher di topbar dengan cookie-based persistence
- Per-company dashboard, report, dan approval queue

### Reporting
- **Dashboard** real-time dengan Recharts (monthly trend, top vendor/product)
- **Laporan Pembelian** dengan filter + Excel export
- **History** audit trail per transaksi

### PDF Export
- jsPDF + autotable, branded header (navy + amber)
- Available di semua 15+ doc types

### Security
- **Auth.js v5** dengan Argon2id + JWT session
- **Role-based access** (ADMIN, DIREKTUR, MANAGER, SPV, OP, FINANCE, GA, HR)
- **Rate limiting** (200 req/min global, 10 req/min auth)
- **Edge-safe middleware** (tidak expose secret)

---

## Tech Stack

| Layer | Stack |
|---|---|
| Runtime | Node.js 22 LTS + TypeScript (ESM) |
| Framework | Next.js 15 (App Router, RSC, Server Actions) |
| Database | PostgreSQL 16 via Neon (serverless) |
| ORM | Prisma 6 + Accelerate (optional) |
| Auth | Auth.js v5 + Argon2id |
| Validation | Zod (shared FE/BE schemas) |
| UI | React 19, CSS Modules (no Tailwind) |
| State | TanStack Query + Zustand |
| Form | React Hook Form + Zod resolver |
| Charts | Recharts |
| PDF | jsPDF + jspdf-autotable |
| File storage | Vercel Blob |
| Monorepo | pnpm workspaces |
| Deploy | Vercel (auto dari GitHub) |

---

## Quick Start

### Prasyarat
- Node.js >= 20
- pnpm >= 11 (`npm i -g pnpm`)
- Akun [Neon](https://neon.tech) (free tier cukup)
- Akun [Vercel](https://vercel.com) (free tier cukup)

### 1. Clone & Install
```bash
git clone https://github.com/begolo12/GPT-ERP.git
cd GPT-ERP
pnpm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — copy dari Neon (pooled connection)
- `AUTH_SECRET` — generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `BLOB_READ_WRITE_TOKEN` — dari Vercel Blob

### 3. Setup Database
```bash
pnpm db:push    # apply schema ke Neon
pnpm db:seed    # seed COA, companies, users
```

### 4. Run Dev
```bash
pnpm dev
```
Buka http://localhost:3000

### 5. Login
Lihat [`CREDENTIALS.md`](./CREDENTIALS.md) untuk credential. Default: `admin@gpt-erp.local` / `Admin@2026!`

---

## Deploy ke Vercel

1. Push ke GitHub
2. Import di [vercel.com/new](https://vercel.com/new)
3. Set environment variables di Vercel dashboard (sama dengan `.env`)
4. Tambah [Vercel Blob](https://vercel.com/dashboard/stores) store
5. Deploy — auto-deploy untuk setiap push ke `main`

`vercel.json` sudah include `buildCommand` untuk pnpm workspace.

---

## Struktur

```
gpt-erp/
\u251c\u2500\u2500 apps/
\u2502   \u2514\u2500\u2500 web/                              # Next.js 15 (FE + API + BFF)
\u2502       \u251c\u2500\u2500 app/                          # App Router
\u2502       \u2502   \u251c\u2500\u2500 (auth)/login/         # public
\u2502       \u2502   \u251c\u2500\u2500 (app)/               # protected
\u2502       \u2502   \u2502   \u251c\u2500\u2500 dashboard/    # KPI + charts
\u2502       \u2502   \u2502   \u251c\u2500\u2500 operasi/      # OP + Sales
\u2502       \u2502   \u2502   \u251c\u2500\u2500 keuangan/      # FN transactions
\u2502       \u2502   \u2502   \u251c\u2500\u2500 ga/            # GA transactions
\u2502       \u2502   \u2502   \u251c\u2500\u2500 hr/            # HR transactions
\u2502       \u2502   \u2502   \u251c\u2500\u2500 evaluasi/      # approval queue
\u2502       \u2502   \u2502   \u251c\u2500\u2500 laporan/       # reports
\u2502       \u2502   \u2502   \u251c\u2500\u2500 history/       # audit trail
\u2502       \u2502   \u2502   \u251c\u2500\u2500 pengaturan/     # settings
\u2502       \u2502   \u2502   \u2514\u2500\u2500 profile/         # user profile
\u2502       \u2502   \u2514\u2500\u2500 api/                  # API routes
\u2502       \u251c\u2500\u2500 components/                # React components
\u2502       \u2502   \u251c\u2500\u2500 shell/             # Sidebar, Topbar, AppShell
\u2502       \u2502   \u251c\u2500\u2500 ui/                # Button, Card, Badge, dll
\u2502       \u2502   \u251c\u2500\u2500 master/            # MasterPage (CRUD)
\u2502       \u2502   \u251c\u2500\u2500 transaction/       # TxForm, TxList, ApprovalActions, ExportPdfButton
\u2502       \u2502   \u2514\u2500\u2500 report/             # Charts
\u2502       \u251c\u2500\u2500 lib/                     # helpers (format, cn, auth, master-fields, pdf-generator)
\u2502       \u251c\u2500\u2500 server/                  # business logic
\u2502       \u2502   \u251c\u2500\u2500 services/          # transaction, approval, report
\u2502       \u2502   \u2514\u2500\u2500 engine/            # approval rules, posting rules
\u2502       \u2514\u2500\u2500 prisma/                 # schema + seed
\u251c\u2500\u2500 packages/
\u2502   \u2514\u2500\u2500 shared/                     # enums + types (FE/BE shared)
\u251c\u2500\u2500 docs/                            # ARCHITECTURE.md
\u2514\u2500\u2500 .github/workflows/               # CI
```

---

## Scripts

| Script | Fungsi |
|---|---|
| `pnpm dev` | Jalankan Next.js dev server |
| `pnpm build` | Build production |
| `pnpm start` | Run production server |
| `pnpm typecheck` | TypeScript check (no emit) |
| `pnpm lint` | ESLint |
| `pnpm db:push` | Push schema ke DB |
| `pnpm db:seed` | Seed initial data |
| `pnpm db:studio` | Prisma Studio (DB GUI) |

---

## Kredensial Default

Lihat [`CREDENTIALS.md`](./CREDENTIALS.md) untuk daftar lengkap user (9 user, 4 role).

---

## Arsitektur

Lihat [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) untuk detail:
- DB schema (11 tables)
- Approval engine
- Posting engine (double-entry)
- Multi-tenant strategy
- PDF generation

---

## Lisensi

Private — Daniswara Group.
# Arsitektur GPT-ERP

## Tech Stack Decisions

### Mengapa Next.js 15 (App Router)?

Awalnya saya rekomendasikan **Hono/Fastify** + **React** (separate FE/BE), tapi Vercel hosting lebih optimal untuk Next.js monolith:
- **Server Components** by default = less JS shipped ke client
- **Server Actions** untuk form mutations = no API boilerplate
- **Route Handlers** untuk REST API = no separate BE needed
- **Edge runtime** untuk middleware = cold start < 50ms
- **Vercel-native** = auto-deploy, preview URLs, ISR

### Mengapa Prisma + Neon?

- **Prisma**: Type-safe queries, auto-migration, IDE autocomplete
- **Neon**: Serverless Postgres dengan branching (per PR = DB branch)
- **Connection pooling**: Neon punya built-in pooler, sufficient untuk Vercel

### Mengapa Auth.js v5 (bukan custom JWT)?

- **Edge-safe**: middleware pakai `authConfig` (no Prisma, no argon2)
- **HTTP-only cookies** = CSRF-safe by default
- **Session di JWT** = no DB hit per request
- **Argon2id** untuk password (lebih aman dari bcrypt di 2026)

### Mengapa tidak pakai Tailwind?

- ERP = banyak custom table/form, **utility classes verbose**
- **CSS Modules** = better encapsulation, no purge issues
- **Design tokens** (CSS variables) = theming + dark mode built-in
- Bundle lebih kecil (no Tailwind runtime)

### Mengapa generic MasterPage & TxForm?

- 5 master categories × 3 pages = 15 routes
- 15+ doc types × 3 pages = 45+ routes
- DRY: 1 generic component per pattern, hanya config berbeda

## DB Schema (11 models)

Lihat `apps/web/prisma/schema.prisma` untuk detail lengkap.

| Model | Fungsi |
|---|---|
| Company | Multi-tenant root (3 companies: GROUP, GAS, DJP) |
| Division | Org unit (OP, FN, GA, HR) |
| User | Auth + role + company scope |
| Account | Chart of Accounts (26 akun) |
| FinancialTransaction | **Tabel pusat** — semua doc types |
| ApprovalStep | Audit trail approval (per role transition) |
| Notification | In-app notifications (in-DB) |
| JournalLine | Double-entry posting |
| MasterDataItem | Universal master data (polimorfik via category) |
| RefreshToken | JWT refresh (untuk session rotation) |
| AuditLog | Complete audit trail |

### Index Strategy

20+ composite indexes untuk query patterns:
- `FinancialTransaction`: `(companyId, type, period)`, `(companyId, type, date)`, `(companyId, approvalStatus, date)`, dll
- `MasterDataItem`: `(companyId, category, code)` unique, `(category, status)`, `(name)`
- `JournalLine`: `(transactionId)`, `(companyId, accountId, createdAt)`

## Approval Engine

`apps/web/server/engine/approval.ts`:
- `APPROVAL_RULES`: per DocType, defines minRole + escalation threshold
- `canApprove()`: check user role vs required role + amount
- `determineNextRole()`: compute next approver based on amount

Service `apps/web/server/services/approval.service.ts`:
- `submitForApproval()`: DRAFT → SUBMITTED, notify next role
- `approveTransaction()`: SUBMITTED → APPROVED, auto-posting
- `rejectTransaction()`: → REJECTED (mandatory note)
- `reviseTransaction()`: → REVISED (mandatory note)
- `listApprovalQueue()`: filter by currentRole + division

## Posting Engine

`apps/web/server/engine/posting.ts`:
- `generatePosting()`: per DocType, return JournalLine[] (debit/credit)
- `postTransaction()`: write to DB, **verify double-entry balance**

Supported types (12+):
- PO/GR: Persediaan ↔ Hutang Usaha
- Faktur AP: Persediaan ↔ Hutang + PPN
- Faktur AR: Piutang + Piutang Retensi ↔ Pendapatan
- Pembayaran: Hutang ↔ Kas/Bank
- Penggajian: Gaji ↔ Hutang Gaji
- Realisasi Pembelian: HPP+PPV ↔ Persediaan
- dst

## Multi-Tenant Strategy

```typescript
// Cookie-based active company
const activeCompany = cookies().get("gpt_active_company_id") ?? user.companyId;

// Admin/Group: akses semua
// User biasa: locked ke company sendiri
// Konsolidasi (GROUP): aggregate dari semua company
```

Query middleware di setiap service auto-filter `companyId`:
```typescript
where: { companyId: ctx.activeCompany.id, ... }
```

## PDF Generation

`apps/web/lib/pdf-generator.ts`:
- **jsPDF + jspdf-autotable** (loaded dynamically, client-side)
- Branded header: navy + amber + GPT logo box
- 2-column meta: doc info | party info
- Items table dengan styling
- Totals + grand total box
- Multi-page footer dengan page numbers

**Kenapa client-side**: tidak butuh headless Chrome di server, instant generation, no upload cost.

## Security Model

1. **Argon2id** + JWT session (Auth.js v5)
2. **Edge middleware** (no Prisma/argon2 imports)
3. **Role-based access** (8 roles)
4. **Rate limiting** (200 req/min global, 10 req/min auth)
5. **Zod validation** di semua API endpoints
6. **Soft delete** (deletedAt) untuk audit trail
7. **CSRF** built-in (Auth.js uses SameSite=Lax cookies)

## Performance

- **Server Components** by default = 100 kB shared JS
- **Dynamic imports** untuk jsPDF, Recharts = no bundle bloat
- **Composite indexes** untuk query patterns
- **Edge runtime** untuk middleware (cold start < 50ms)
- **Vercel CDN** untuk static assets

## Roadmap

Lihat [ROADMAP.md](./ROADMAP.md) untuk future enhancements.

## Lisensi

Private — Daniswara Group.
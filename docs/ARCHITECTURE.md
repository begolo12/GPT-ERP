# Arsitektur GPT-ERP

Lihat [README.md](../README.md) untuk stack overview.

## Lapisan

```
[ Browser ]
   \u2193 HTTPS
[ Vercel Edge / Node Runtime ]
   \u2193
[ Next.js App Router ]
   \u251c\u2500 Server Components (RSC) \u2014 default
   \u251c\u2500 Route Handlers (app/api/**) \u2014 BFF
   \u2514\u2500 Server Actions \u2014 form mutations
   \u2193
[ Prisma ORM + Accelerate ]
   \u2193
[ Neon Postgres ]
```

## Auth Flow

```
Login \u2192 Auth.js Credentials \u2192 Argon2id verify
  \u2192 set JWT session cookie (HTTP-only, SameSite=Lax)
  \u2192 middleware.ts protect /((app))/* route group
```

## Multi-tenancy

- Setiap User terikat `companyId` (kecuali role=ADMIN)
- Server actions/queries: `where: { companyId: session.user.companyId }` otomatis
- Company switcher: cookie `active_company_id` (untuk role GROUP yang boleh multi)

## Approval Workflow

```
DRAFT \u2192 SUBMITTED \u2192 REVIEWED \u2192 APPROVED
                                \u2193
                             REJECTED / REVISED
```

Setiap transisi: insert ke `ApprovalStep` + emit `Notification` ke role terkait.

## Posting Jurnal

Dipanggil otomatis saat `APPROVED` (via `posting.service.ts`).
Rule per `DocType` lihat [POSTING_RULES.md](./POSTING_RULES.md).

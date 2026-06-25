# Kredensial Awal (Seed)

> **PENTING**: Hapus/ubah setelah login pertama, atau sebelum deploy production.

## User Admin

| Field | Nilai |
|---|---|
| Email | `admin@gpt-erp.local` |
| Password | `Admin@2026!` |
| Role | `ADMIN` |
| Company | `GROUP` (akses semua company) |

## Company yang Di-seed

| Code | Nama | Tipe |
|---|---|---|
| `GROUP` | Konsolidasi Group | Virtual (konsolidasi) |
| `GAS` | PT. Ganendra Arsyila Semesta | Operasional |
| `DJP` | PT. Daniswara Jaya Perkasa | Operasional |

## Division yang Di-seed

| Code | Nama | Color |
|---|---|---|
| `OP` | Operasi | `#2563eb` |
| `FN` | Keuangan | `#b88324` |
| `GA` | General Affair | `#059669` |
| `HR` | Human Resource | `#dc2626` |

## User per Role (Password sama semua: `Admin@2026!`)

| Email | Role | Company |
|---|---|---|
| `admin@gpt-erp.local` | ADMIN | GROUP |
| `direktur@gpt-erp.local` | DIREKTUR | GAS |
| `manager@gpt-erp.local` | MANAGER | GAS |
| `spv@gpt-erp.local` | SPV | GAS |
| `staff.op@gpt-erp.local` | OP | GAS |
| `staff.fn@gpt-erp.local` | FINANCE | GAS |
| `staff.ga@gpt-erp.local` | GA | GAS |
| `staff.hr@gpt-erp.local` | HR | GAS |

## Reset

Jika ingin reset semua user + data:

```bash
# hapus semua data (HATI-HATI)
pnpm db:push --force-reset
pnpm db:seed
```

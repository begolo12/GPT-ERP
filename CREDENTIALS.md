# Kredensial Awal (Seed)

> **PENTING**: Hapus/ubah setelah login pertama, atau sebelum deploy production.
> **Password semua user**: `Admin@2026!`

## User Admin (Akses Penuh)

| Email | Role | Company | Division |
|---|---|---|---|
| `admin@gpt-erp.local` | ADMIN | GROUP (all access) | - |

## User GAS (PT. Ganendra Arsyila Semesta)

| Email | Role | Division |
|---|---|---|
| `direktur@gpt-erp.local` | DIREKTUR | - |
| `manager@gpt-erp.local` | MANAGER | - |
| `spv@gpt-erp.local` | SPV | - |
| `staff.op@gpt-erp.local` | OP | OP |
| `staff.fn@gpt-erp.local` | FINANCE | FN |
| `staff.ga@gpt-erp.local` | GA | GA |
| `staff.hr@gpt-erp.local` | HR | HR |

## User DJP (PT. Daniswara Jaya Perkasa)

| Email | Role |
|---|---|
| `direktur.djp@gpt-erp.local` | DIREKTUR |

## Company Seed

| Code | Nama | Tipe |
|---|---|---|
| `GROUP` | Konsolidasi Group | Virtual (admin only) |
| `GAS` | PT. Ganendra Arsyila Semesta | Operasional |
| `DJP` | PT. Daniswara Jaya Perkasa | Operasional |

## Division Seed

| Code | Nama | Color |
|---|---|---|
| `OP` | Operasi | `#2563eb` |
| `FN` | Keuangan | `#b88324` |
| `GA` | General Affair | `#059669` |
| `HR` | Human Resource | `#dc2626` |

## Reset

Untuk reset semua data:
```bash
pnpm db:push --force-reset --accept-data-loss
pnpm db:seed
```

**HATI-HATI**: `--force-reset` akan HAPUS semua data.
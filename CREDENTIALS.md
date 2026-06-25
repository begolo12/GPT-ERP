# Kredensial Awal (Seed)

> **PENTING**: Hapus/ubah setelah login pertama, atau sebelum deploy production.

## User Admin

| Field | Nilai |
|---|---|
| Email | \dmin@gpt-erp.local\ |
| Password | \Admin@2026!\ |
| Role | \ADMIN\ |
| Company | \GROUP\ (akses semua company) |

## Company Seed

| Code | Nama | Tipe |
|---|---|---|
| \GROUP\ | Konsolidasi Group | Virtual (konsolidasi) |
| \GAS\ | PT. Ganendra Arsyila Semesta | Operasional |
| \DJP\ | PT. Daniswara Jaya Perkasa | Operasional |

## Division Seed

| Code | Nama | Color |
|---|---|---|
| \OP\ | Operasi | \#2563eb\ |
| \FN\ | Keuangan | \#b88324\ |
| \GA\ | General Affair | \#059669\ |
| \HR\ | Human Resource | \#dc2626\ |

## User per Role (Password semua: \Admin@2026!\)

| Email | Role | Company | Division |
|---|---|---|---|
| \dmin@gpt-erp.local\ | ADMIN | GROUP | - |
| \direktur@gpt-erp.local\ | DIREKTUR | GAS | - |
| \manager@gpt-erp.local\ | MANAGER | GAS | - |
| \spv@gpt-erp.local\ | SPV | GAS | - |
| \staff.op@gpt-erp.local\ | OP | GAS | OP |
| \staff.fn@gpt-erp.local\ | FINANCE | GAS | FN |
| \staff.ga@gpt-erp.local\ | GA | GAS | GA |
| \staff.hr@gpt-erp.local\ | HR | GAS | HR |
| \direktur.djp@gpt-erp.local\ | DIREKTUR | DJP | - |

## COA Seed (26 akun)

| Kode | Nama | Tipe |
|---|---|---|
| 11111 | KAS | ASSET |
| 11121 | BANK MANDIRI | ASSET |
| 11122 | BANK BRI | ASSET |
| 11123 | BANK BCA | ASSET |
| 11124 | BANK BNI | ASSET |
| 11125 | BANK BTN | ASSET |
| 11212 | PIUTANG RETENSI | ASSET |
| 11214 | PIUTANG PENJUALAN | ASSET |
| 11311 | UANG MUKA PEMASOK | ASSET |
| 11321 | PERSEKOT | ASSET |
| 11322 | KASBON | ASSET |
| 11411 | PERSEDIAAN BARANG | ASSET |
| 13151 | ASET KENDARAAN | ASSET |
| 21111 | HUTANG USAHA | LIABILITY |
| 21121 | HUTANG PPh 21 | LIABILITY |
| 21123 | HUTANG PPh 23 | LIABILITY |
| 21142 | HUTANG GAJI | LIABILITY |
| 31111 | MODAL | EQUITY |
| 31112 | LABA DITAHAN | EQUITY |
| 51111 | PENDAPATAN PENJUALAN | REVENUE |
| 51211 | HPP | EXPENSE |
| 51212 | SELISIH HARGA (PPV) | EXPENSE |
| 41111 | BIAYA MATERIAL | EXPENSE |
| 48141 | GAJI | EXPENSE |
| 48161 | BIAYA KENDARAAN | EXPENSE |
| 48191 | BIAYA UMUM | EXPENSE |

## Reset

Untuk reset semua data:

\\\ash
pnpm db:push --force-reset --accept-data-loss
pnpm db:seed
\\\

**HATI-HATI**: \--force-reset\ akan HAPUS semua data.
/**
 * Posting Engine
 * Generate JournalLine dari FinancialTransaction yang APPROVED
 * Setiap DocType punya rule debit/credit sendiri
 */
import type { DocType } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export interface PostingLine {
  accountCode: string; // 5-digit COA code
  debit: number;
  credit: number;
  description?: string;
}

export function generatePosting(
  type: DocType,
  amount: number,
  meta: any,
): PostingLine[] {
  const subtotal: number = meta.subtotal ?? amount;
  const ppn: number = meta.ppn ?? 0;
  const kasBankCode: string = meta.kasBankCode ?? "11111"; // default KAS

  switch (type) {
    case "PO":
      // Pesanan Pembelian: Persediaan (+) / Hutang Usaha (+)
      return [
        { accountCode: "11411", debit: subtotal, credit: 0, description: "Persediaan dari PO" },
        { accountCode: "21111", debit: 0, credit: subtotal, description: "Hutang usaha ke vendor" },
      ];

    case "GR":
      // Penerimaan Barang: sama dgn PO, hanya confirm fisik barang masuk
      return [
        { accountCode: "11411", debit: subtotal, credit: 0, description: "Penerimaan barang" },
        { accountCode: "21111", debit: 0, credit: subtotal, description: "Hutang usaha" },
      ];

    case "FAKTUR":
      // Faktur AP: Persediaan (subtotal) / Hutang Usaha (subtotal + PPN)
      return [
        { accountCode: "11411", debit: subtotal, credit: 0, description: "Persediaan dari faktur" },
        { accountCode: "21111", debit: 0, credit: subtotal + ppn, description: "Hutang usaha + PPN" },
      ];

    case "PEMBAYARAN":
      // Pembayaran (uang keluar ke vendor): Hutang (-) / Kas/Bank (-)
      return [
        { accountCode: "21111", debit: amount, credit: 0, description: "Pelunasan hutang" },
        { accountCode: kasBankCode, debit: 0, credit: amount, description: "Kas/Bank keluar" },
      ];

    case "REALISASI_BIAYA":
      // Realisasi Biaya: Biaya (+) / Persediaan (-) or Kas/Bank (-)
      // If has projectCode, post ke BIAYA_MATERIAL, else BIAYA_UMUM
      return [
        { accountCode: "41111", debit: amount, credit: 0, description: "Realisasi biaya material" },
        { accountCode: kasBankCode, debit: 0, credit: amount, description: "Kas/Bank keluar" },
      ];

    case "REALISASI_PEMBELIAN":
      // HPP: HPP (+), selisih harga (jika ada) / Persediaan (-)
      // If poAmount !== actualAmount -> split ke SELISIH_HARGA
      const poAmount: number = meta.poAmount ?? subtotal;
      const ppv: number = poAmount - subtotal;
      const lines: PostingLine[] = [
        { accountCode: "51211", debit: amount, credit: 0, description: "HPP" },
      ];
      if (ppv > 0) {
        lines.push({ accountCode: "51212", debit: 0, credit: ppv, description: "Selisih harga (PPV)" });
      }
      lines.push({ accountCode: "11411", debit: 0, credit: amount + (ppv > 0 ? ppv : 0), description: "Persediaan keluar" });
      return lines;

    case "PERMINTAAN_BAYAR":
      // Permintaan Bayar: Hutang (-) / Kas/Bank + Hutang PPh23
      const pphPersen: number = meta.pphPersen ?? 0;
      const pphAmount: number = (amount * pphPersen) / 100;
      return [
        { accountCode: "21111", debit: amount, credit: 0, description: "Bayar hutang" },
        { accountCode: kasBankCode, debit: 0, credit: amount - pphAmount, description: "Kas/Bank keluar" },
        { accountCode: "21123", debit: 0, credit: pphAmount, description: "Hutang PPh 23" },
      ];

    case "PELUNASAN":
      // Pelunasan persekot: Biaya (+) / Persekot (-)
      return [
        { accountCode: "48191", debit: amount, credit: 0, description: "Beban umum" },
        { accountCode: "11321", debit: 0, credit: amount, description: "Persekot terpakai" },
      ];

    case "BEBAN":
    case "PENGELUARAN_GA":
      // Beban/Pengeluaran GA: Biaya (+) / Kas/Bank (-)
      return [
        { accountCode: "48191", debit: amount, credit: 0, description: "Beban umum" },
        { accountCode: kasBankCode, debit: 0, credit: amount, description: "Kas/Bank keluar" },
      ];

    case "PENGADAAN_GA":
      // Pengadaan GA (aset): Aset Kendaraan / Kas-Bank
      return [
        { accountCode: "13151", debit: amount, credit: 0, description: "Perolehan aset" },
        { accountCode: kasBankCode, debit: 0, credit: amount, description: "Kas/Bank keluar" },
      ];

    case "PENGGAJIAN":
      // Penggajian: Gaji (+) / Hutang Gaji (-)
      return [
        { accountCode: "48141", debit: amount, credit: 0, description: "Beban gaji" },
        { accountCode: "21142", debit: 0, credit: amount, description: "Hutang gaji" },
      ];

    case "REIMBURSE":
      // Reimburse: Biaya Umum (+) / Kas/Bank (-)
      return [
        { accountCode: "48191", debit: amount, credit: 0, description: "Reimburse biaya" },
        { accountCode: kasBankCode, debit: 0, credit: amount, description: "Kas/Bank keluar" },
      ];

    case "JURNAL_MEMORIAL":
      // Memorial: explicit dari form (meta.lines)
      if (Array.isArray(meta.lines)) return meta.lines;
      return [];

    default:
      // Doc type yang belum ada posting rule: skip
      return [];
  }
}

export async function postTransaction(
  tx: Prisma.TransactionClient,
  financialTxId: string,
  companyId: string,
  type: DocType,
  amount: number,
  metadata: any,
): Promise<number> {
  const lines = generatePosting(type, amount, metadata);
  if (lines.length === 0) return 0;

  // Resolve account codes to IDs
  for (const line of lines) {
    const acc = await tx.account.findUnique({ where: { code: line.accountCode } });
    if (!acc) {
      throw new Error(`Account ${line.accountCode} not found in COA`);
    }
    await tx.journalLine.create({
      data: {
        transactionId: financialTxId,
        companyId,
        accountId: acc.id,
        debit: line.debit,
        credit: line.credit,
        description: line.description,
      },
    });
  }

  // Verify double-entry balance
  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(
      `Posting tidak balance: debit=${totalDebit}, credit=${totalCredit} untuk ${type}`,
    );
  }

  return lines.length;
}
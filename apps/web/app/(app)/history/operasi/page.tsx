import { getTransactionHistory } from "@/server/services/report.service";
import { requireSession } from "@/lib/auth-server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatIDR, formatDateTime, formatDate } from "@/lib/format";
import * as Icons from "lucide-react";
import styles from "./history.module.css";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  PR: "Permintaan Pembelian",
  PO: "Pesanan Pembelian",
  DO: "Pengiriman",
  GR: "Penerimaan Barang",
  FAKTUR: "Faktur",
  PEMBAYARAN: "Pembayaran",
  PELUNASAN: "Pelunasan",
  JURNAL_MEMORIAL: "Jurnal Memorial",
  BEBAN: "Beban",
  HUTANG: "Hutang",
  PIUTANG: "Piutang",
  REIMBURSE: "Reimburse",
  PERMINTAAN_BAYAR: "Permintaan Bayar",
  PERMINTAAN_BIAYA_OP: "Permintaan Biaya",
  RENCANA_BIAYA: "Rencana Biaya",
  ANGGARAN: "Anggaran",
  REALISASI_BIAYA: "Realisasi Biaya",
  REALISASI_PEMBELIAN: "Realisasi Pembelian",
};

export default async function HistoryPage() {
  const user = await requireSession();
  const result = await getTransactionHistory(user, { pageSize: 100 });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>History Transaksi</h1>
          <p className={styles.subtitle}>{result.total} transaksi \u00b7 Diurutkan berdasarkan update terbaru</p>
        </div>
      </header>

      <Card>
        {result.data.length === 0 ? (
          <div className={styles.empty}>
            <Icons.History size={40} />
            <p>Belum ada transaksi</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Updated</th>
                <th>Kode</th>
                <th>Type</th>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((tx) => (
                <tr key={tx.id}>
                  <td className={styles.timeCell}>
                    <Icons.Clock size={11} />
                    {formatDateTime(tx.updatedAt)}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}>{tx.code}</td>
                  <td>
                    <div className={styles.typeCell}>
                      <Badge variant="neutral">{tx.type}</Badge>
                      <span className={styles.typeLabel}>{TYPE_LABELS[tx.type] ?? tx.type}</span>
                    </div>
                  </td>
                  <td>{formatDate(tx.date)}</td>
                  <td className={styles.descCell}>{tx.description}</td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{formatIDR(tx.amount)}</td>
                  <td>
                    <div className={styles.statusCell}>
                      <Badge variant={tx.status.toLowerCase() as any}>{tx.status}</Badge>
                      {tx.currentRole && <Badge variant="reviewed">To: {tx.currentRole}</Badge>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
import { TxForm } from "@/components/transaction/TxForm";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-server";
import { getTransaction } from "@/server/services/transaction.service";
import { notFound } from "next/navigation";
import { formatIDR, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import * as Icons from "lucide-react";
import styles from "./detail.module.css";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await params;
  const tx = await getTransaction(user, "FAKTUR", id);
  if (!tx) notFound();

  // Get parent if exists
  let parent: any = null;
  if (tx.parentId) {
    parent = await prisma.financialTransaction.findUnique({ where: { id: tx.parentId } });
  }

  return (
    <div className={styles.page}>
      {parent && (
        <div className={styles.chain}>
          <Icons.Link size={14} />
          <span>From:</span>
          <Link href={`/operasi/pembelian/${parent.type.toLowerCase()}/${parent.id}`}>
            {parent.type} {((parent.metadata as any)?.code ?? parent.id.slice(-6))}
          </Link>
          <Icons.ChevronRight size={12} />
          <strong>FAKTUR {tx.code}</strong>
        </div>
      )}

      <header className={styles.header}>
        <div>
          <div className={styles.codeRow}>
            <h1 className={styles.code}>{tx.code}</h1>
            <Badge variant={tx.approvalStatus.toLowerCase() as any}>{tx.approvalStatus}</Badge>
          </div>
          <p className={styles.subtitle}>{tx.description}</p>
        </div>
        <div className={styles.meta}>
          <div><span>Tanggal</span><strong>{formatDate(tx.date)}</strong></div>
          <div><span>Total</span><strong>{formatIDR(tx.amount)}</strong></div>
        </div>
      </header>

      <Card>
        <h3 className={styles.sectionTitle}>Line Items</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Produk</th>
              <th>Qty</th>
              <th>Satuan</th>
              <th style={{ textAlign: "right" }}>Harga</th>
              <th style={{ textAlign: "right" }}>Diskon</th>
              <th style={{ textAlign: "right" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {tx.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.productCode} {item.productName ? `\u00b7 ${item.productName}` : ""}</td>
                <td>{item.qty}</td>
                <td>{item.satuan ?? "-"}</td>
                <td className={styles.numCell}>{formatIDR(item.harga, false)}</td>
                <td className={styles.numCell}>{formatIDR(item.diskon ?? 0, false)}</td>
                <td className={styles.numCell}>{formatIDR(item.qty * item.harga - (item.diskon ?? 0), false)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
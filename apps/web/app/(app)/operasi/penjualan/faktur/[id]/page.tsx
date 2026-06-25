import { TxForm } from "@/components/transaction/TxForm";
import { ApprovalActions } from "@/components/transaction/ApprovalActions";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-server";
import { getTransaction } from "@/server/services/transaction.service";
import { notFound } from "next/navigation";
import { formatIDR, formatDate, formatDateTime } from "@/lib/format";
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

  let parent: any = null;
  if (tx.parentId) {
    parent = await prisma.financialTransaction.findUnique({ where: { id: tx.parentId } });
  }

  const [approvalSteps, journalLines] = await Promise.all([
    prisma.approvalStep.findMany({
      where: { transactionId: id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.journalLine.findMany({
      where: { transactionId: id },
      include: { account: { select: { code: true, name: true } } },
    }),
  ]);

  const isOwner = tx.createdById === user.id;
  const showActions = isOwner || (user.role === tx.currentRole) || user.role === "ADMIN" || user.role === "MANAGER" || user.role === "DIREKTUR";

  return (
    <div className={styles.page}>
      {parent && (
        <div className={styles.chain}>
          <Icons.Link size={14} />
          <span>From:</span>
          <Link href={`/operasi/penjualan/${parent.type.toLowerCase().replace("_","-")}/${parent.id}`}>
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
            {tx.currentRole && <Badge variant="reviewed">To: {tx.currentRole}</Badge>}
          </div>
          <p className={styles.subtitle}>{tx.description}</p>
        </div>
        <div className={styles.meta}>
          <div><span>Tanggal</span><strong>{formatDate(tx.date)}</strong></div>
          <div><span>Total</span><strong>{formatIDR(tx.amount)}</strong></div>
        </div>
      </header>

      {showActions && (
        <ApprovalActions
          transactionId={tx.id}
          status={tx.approvalStatus}
          currentRole={tx.currentRole}
          isOwner={true}
          userRole={user.role}
          amount={tx.amount}
          type={tx.type}
        />
      )}

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

      {approvalSteps.length > 0 && (
        <Card>
          <h3 className={styles.sectionTitle}>Riwayat Approval</h3>
          <ol className={styles.timeline}>
            {approvalSteps.map((step) => (
              <li key={step.id} className={styles.timelineItem}>
                <div className={styles.timelineDot} data-status={step.status.toLowerCase()} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <strong>{step.action}</strong>
                    <span className={styles.timelineActor}>{step.actorName} ({step.fromRole} \u2192 {step.toRole})</span>
                    <span className={styles.timelineTime}>{formatDateTime(step.createdAt)}</span>
                  </div>
                  {step.note && <p className={styles.timelineNote}>{step.note}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {journalLines.length > 0 && (
        <Card>
          <h3 className={styles.sectionTitle}>Jurnal Entries</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Akun</th>
                <th style={{ textAlign: "right" }}>Debit</th>
                <th style={{ textAlign: "right" }}>Kredit</th>
              </tr>
            </thead>
            <tbody>
              {journalLines.map((jl) => (
                <tr key={jl.id}>
                  <td>{jl.account.code} \u00b7 {jl.account.name}</td>
                  <td className={styles.numCell}>{formatIDR(Number(jl.debit), false)}</td>
                  <td className={styles.numCell}>{formatIDR(Number(jl.credit), false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
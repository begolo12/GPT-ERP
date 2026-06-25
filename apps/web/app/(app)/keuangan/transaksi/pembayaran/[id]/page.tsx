import { TxForm } from "@/components/transaction/TxForm";
import { ApprovalActions } from "@/components/transaction/ApprovalActions";
import { ExportPdfButton } from "@/components/transaction/ExportPdfButton";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-server";
import { getTransaction } from "@/server/services/transaction.service";
import { notFound } from "next/navigation";
import { formatIDR, formatDate, formatDateTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import * as Icons from "lucide-react";
import styles from "./detail.module.css";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await params;
  const tx = await getTransaction(user, "PEMBAYARAN", id);
  if (!tx) notFound();

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

  const pdfCompany = await prisma.company.findUnique({ where: { id: user.companyId }, select: { name: true, code: true } });
  const isOwner = tx.createdById === user.id;
  const showActions = isOwner || (user.role === tx.currentRole) || user.role === "ADMIN" || user.role === "MANAGER" || user.role === "DIREKTUR";

  return (
    <div className={styles.page}>
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
          <ExportPdfButton
            company={{ name: pdfCompany?.name ?? user.companyCode, code: pdfCompany?.code ?? user.companyCode }}
            party={{ label: "Vendor", name: tx.vendorName ?? "Vendor", code: tx.vendorCode ?? undefined }}
            doc={{
              title: "PEMBAYARAN",
              code: tx.code,
              date: new Date(tx.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
              description: tx.description,
              status: tx.approvalStatus,
              items: tx.items.length > 0 ? tx.items : [{ productCode: "-", productName: tx.description, qty: 1, harga: tx.amount, diskon: 0 }],
              hasPPN: false,
              subtotal: tx.amount,
              ppn: 0,
              total: tx.amount,
            }}
          />
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
        <h3 className={styles.sectionTitle}>Informasi Transaksi</h3>
        <div className={styles.infoGrid}>
          <div><span>Deskripsi</span><strong>{tx.description}</strong></div>
          {tx.vendorName && <div><span>Vendor</span><strong>{tx.vendorName}</strong></div>}
          {tx.projectName && <div><span>Proyek</span><strong>{tx.projectName}</strong></div>}
          <div><span>Amount</span><strong>{formatIDR(tx.amount)}</strong></div>
        </div>
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
                    <span className={styles.timelineActor}>{step.actorName} ({step.fromRole} -&gt; {step.toRole})</span>
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
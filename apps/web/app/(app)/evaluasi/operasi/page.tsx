import { listApprovalQueue } from "@/server/services/approval.service";
import { requireSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatIDR, formatDate } from "@/lib/format";
import Link from "next/link";
import * as Icons from "lucide-react";
import styles from "./evaluasi.module.css";

export const dynamic = "force-dynamic";

export default async function EvaluasiPage({
  searchParams,
}: {
  searchParams: Promise<{ division?: string }>;
}) {
  const user = await requireSession();
  const sp = await searchParams;

  // Default to OP for users with OP/FN/GA/HR/SPV role, ADMIN sees all
  const division = sp.division ?? (user.divisionCode ?? "OP");

  const queue = await listApprovalQueue(user, {
    pageSize: 100,
    divisionCode: division,
  });

  const totalAmount = queue.data.reduce((s, t) => s + t.amount, 0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Evaluasi &amp; Approval</h1>
          <p className={styles.subtitle}>
            {queue.total} dokumen menunggu approval \u00b7 Total {formatIDR(totalAmount)}
          </p>
        </div>
        <div className={styles.filters}>
          {["OP", "FN", "GA", "HR"].map((d) => (
            <Link
              key={d}
              href={`/evaluasi/operasi?division=${d}`}
              className={`${styles.filterChip} ${division === d ? styles.filterActive : ""}`}
            >
              {d}
            </Link>
          ))}
        </div>
      </header>

      <Card>
        {queue.data.length === 0 ? (
          <div className={styles.empty}>
            <Icons.Inbox size={40} />
            <p>Tidak ada dokumen yang perlu approval untuk divisi {division}</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Type</th>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Vendor</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {queue.data.map((t) => {
                const detailHref =
                  t.divisionCode === "OP" && ["PR", "PO", "DO", "GR", "FAKTUR"].includes(t.type)
                    ? `/operasi/pembelian/${t.type.toLowerCase()}/${t.id}`
                    : "#";
                return (
                  <tr key={t.id} className={styles.row}>
                    <td className={styles.codeCell}>{t.code}</td>
                    <td><Badge variant="submitted">{t.type}</Badge></td>
                    <td>{formatDate(t.date)}</td>
                    <td className={styles.descCell}>{t.description}</td>
                    <td>{t.vendorName ?? "-"}</td>
                    <td className={styles.amountCell}>{formatIDR(t.amount)}</td>
                    <td><Badge variant="reviewed">{t.currentRole}</Badge></td>
                    <td>
                      <Link href={detailHref} className={styles.actionLink}>
                        Review <Icons.ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
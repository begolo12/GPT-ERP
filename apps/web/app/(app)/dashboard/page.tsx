import * as Icons from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import styles from "./dashboard.module.css";

const STATS = [
  { label: "Total Pembelian (Bulan Ini)", value: "Rp 1.245.000.000", change: "+12.5%", changeType: "up" as const, icon: "ShoppingCart" },
  { label: "Total Penjualan (Bulan Ini)", value: "Rp 2.180.000.000", change: "+8.3%", changeType: "up" as const, icon: "TrendingUp" },
  { label: "Piutang Outstanding", value: "Rp 456.000.000", change: "-3.2%", changeType: "down" as const, icon: "Receipt" },
  { label: "Approval Pending", value: "23", change: "+5", changeType: "up" as const, icon: "Clock" },
];

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Overview performa operasional & keuangan</p>
        </div>
      </header>

      <section className={styles.stats}>
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>

      <section className={styles.grid}>
        <Card>
          <CardHeader>
            <CardTitle>Penjualan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.chartPlaceholder}>
              <Icons.BarChart3 size={48} />
              <p>Recharts akan di-render di sini (Phase 7)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Tertunda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.emptyState}>
              <Icons.Inbox size={32} />
              <p>Belum ada approval tertunda</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.emptyState}>
              <Icons.Activity size={32} />
              <p>Aktivitas akan muncul setelah Phase 4 (Master Data) & Phase 5 (OP Chain)</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
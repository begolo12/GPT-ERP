import * as Icons from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-server";
import { getCompanyContext } from "@/lib/company";
import { getDashboardKpi } from "@/server/services/report.service";
import { getConsolidatedKpi } from "@/server/services/consolidation.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { formatIDR, formatDateTime } from "@/lib/format";
import { MonthlyTrendChart, TopVendorsChart, TopProductsChart } from "@/components/report/Charts";
import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireSession();
  const ctx = await getCompanyContext(user);

  // Jika konsolidasi, pakai consolidated KPI
  const kpi = ctx.isKonsolidasi
    ? await getConsolidatedKpi(user, ctx.accessibleCompanyIds.filter((id) => id !== ctx.activeCompany.id))
    : await getDashboardKpi(user);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {ctx.isKonsolidasi ? "Dashboard Konsolidasi Group" : `Selamat datang, ${user.name}`}
          </h1>
          <p className={styles.subtitle}>
            {ctx.isKonsolidasi
              ? `Gabungan ${ctx.accessibleCompanyIds.length - 1} company \u00b7 ${user.role}`
              : `${user.role} \u00b7 ${ctx.activeCompany.name}`}
          </p>
        </div>
        <div className={styles.meta}>
          <Icons.Clock size={14} />
          <span>{formatDateTime(new Date())}</span>
        </div>
      </header>

      <section className={styles.stats}>
        <StatCard
          label="Pembelian Bulan Ini"
          value={formatIDR(kpi.pembelianBulanIni)}
          change={`${kpi.pembelianCount} transaksi`}
          changeType="neutral"
          icon="ShoppingCart"
        />
        <StatCard
          label="Penjualan Bulan Ini"
          value={formatIDR(kpi.penjualanBulanIni)}
          change={`${kpi.penjualanCount} transaksi`}
          changeType="neutral"
          icon="TrendingUp"
        />
        <StatCard
          label="Piutang Outstanding"
          value={formatIDR(kpi.piutang)}
          change="6 bulan terakhir"
          changeType="neutral"
          icon="Receipt"
        />
        <StatCard
          label="Hutang"
          value={formatIDR(kpi.hutang)}
          change="Outstanding"
          changeType="neutral"
          icon="CreditCard"
        />
        <StatCard
          label="Approval Pending"
          value={String(kpi.approvalPending)}
          change="Untuk Anda"
          changeType="up"
          icon="Clock"
        />
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Trend Bulanan (12 Bulan Terakhir)</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={kpi.monthlyTrend} />
          </CardContent>
        </Card>
      </section>

      <section className={styles.grid2}>
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Vendor (Bulan Ini)</CardTitle>
          </CardHeader>
          <CardContent>
            {kpi.topVendors.length === 0 ? (
              <div className={styles.emptyMini}>
                <Icons.Truck size={28} />
                <p>Belum ada data pembelian bulan ini</p>
              </div>
            ) : (
              <TopVendorsChart data={kpi.topVendors} />
            )}
          </CardContent>
        </Card>

        {!ctx.isKonsolidasi && (
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Produk (Qty Bulan Ini)</CardTitle>
            </CardHeader>
            <CardContent>
              {kpi.topProducts.length === 0 ? (
                <div className={styles.emptyMini}>
                  <Icons.Package size={28} />
                  <p>Belum ada data produk</p>
                </div>
              ) : (
                <TopProductsChart data={kpi.topProducts} />
              )}
            </CardContent>
          </Card>
        )}

        {ctx.isKonsolidasi && (
          <Card>
            <CardHeader>
              <CardTitle>Per Company</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.companyList}>
                {ctx.accessibleCompanyIds
                  .filter((id) => id !== ctx.activeCompany.id)
                  .map(async (id) => {
                    const c = await prisma.company.findUnique({ where: { id } });
                    if (!c) return null;
                    const sum = await prisma.financialTransaction.aggregate({
                      _sum: { amount: true },
                      where: {
                        companyId: id,
                        type: { in: ["PO", "FAKTUR"] },
                        approvalStatus: "APPROVED",
                        deletedAt: null,
                        date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
                      },
                    });
                    return (
                      <div key={c.id} className={styles.companyItem}>
                        <div>
                          <div className={styles.companyName}>{c.name}</div>
                          <div className={styles.companyCode}>{c.code}</div>
                        </div>
                        <div className={styles.companyAmount}>
                          {formatIDR(Number(sum._sum.amount ?? 0))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
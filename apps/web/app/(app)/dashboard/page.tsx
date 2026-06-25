import * as Icons from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { formatIDR, formatDateTime } from "@/lib/format";
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
  const user = await requireSession();

  // Fetch real stats (akan di-expand di Phase 7)
  const [userCount, vendorCount, productCount, projectCount, company] = await Promise.all([
    prisma.user.count({ where: { companyId: user.companyId, isActive: true } }),
    prisma.masterDataItem.count({ where: { companyId: user.companyId, category: "Vendor", status: "AKTIF" } }),
    prisma.masterDataItem.count({ where: { companyId: user.companyId, category: "Produk", status: "AKTIF" } }),
    prisma.masterDataItem.count({ where: { companyId: user.companyId, category: "Proyek", status: "AKTIF" } }),
    prisma.company.findUnique({ where: { id: user.companyId } }),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Selamat datang, {user.name}</h1>
          <p className={styles.subtitle}>
            {user.role} \u00b7 {company?.name ?? user.companyCode}
          </p>
        </div>
        <div className={styles.meta}>
          <Icons.Clock size={14} />
          <span>{formatDateTime(new Date())}</span>
        </div>
      </header>

      <section className={styles.stats}>
        <StatCard label="User Aktif" value={String(userCount)} icon="Users" />
        <StatCard label="Vendor Aktif" value={String(vendorCount)} icon="Truck" />
        <StatCard label="Produk Aktif" value={String(productCount)} icon="Package" />
        <StatCard label="Proyek Aktif" value={String(projectCount)} icon="FolderKanban" />
      </section>

      <section className={styles.grid}>
        <Card>
          <CardHeader>
            <CardTitle>Status Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.statusList}>
              <div className={styles.statusItem}>
                <div className={styles.statusDot} data-status="ok" />
                <div>
                  <div className={styles.statusTitle}>Database</div>
                  <div className={styles.statusSub}>Neon Postgres aktif</div>
                </div>
              </div>
              <div className={styles.statusItem}>
                <div className={styles.statusDot} data-status="ok" />
                <div>
                  <div className={styles.statusTitle}>Auth</div>
                  <div className={styles.statusSub}>Session {user.email}</div>
                </div>
              </div>
              <div className={styles.statusItem}>
                <div className={styles.statusDot} data-status="warn" />
                <div>
                  <div className={styles.statusTitle}>Master Data</div>
                  <div className={styles.statusSub}>Vendor/Produk kosong \u2014 Phase 4</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phase Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className={styles.phaseList}>
              <li className={styles.phaseDone}>P0 \u2014 Repo &amp; Infra</li>
              <li className={styles.phaseDone}>P1 \u2014 Design System</li>
              <li className={styles.phaseDone}>P2 \u2014 Prisma &amp; Seeder</li>
              <li className={styles.phaseCurrent}>P3 \u2014 Auth &lpar;kamu di sini&rpar;</li>
              <li>P4 \u2014 Master Data</li>
              <li>P5 \u2014 OP Chain</li>
              <li>P6 \u2014 Approval &amp; Posting</li>
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
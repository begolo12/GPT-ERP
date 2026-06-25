/**
 * Patch konsolidasi support di getDashboardKpi
 * Jika isKonsolidasi, aggregate dari semua accessible companies
 */
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@shared/types";

export async function getConsolidatedKpi(user: SessionUser, companyIds: string[]) {
  if (companyIds.length === 0) {
    return {
      pembelianBulanIni: 0,
      pembelianCount: 0,
      penjualanBulanIni: 0,
      penjualanCount: 0,
      piutang: 0,
      hutang: 0,
      approvalPending: 0,
      topVendors: [],
      topProducts: [],
      monthlyTrend: [],
    };
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [pembelianMonth, penjualanMonth, piutang, hutang, approvalPending, topVendors, monthlyTrend] = await Promise.all([
    prisma.financialTransaction.aggregate({
      _sum: { amount: true },
      _count: true,
      where: {
        companyId: { in: companyIds },
        type: { in: ["PO", "FAKTUR"] },
        approvalStatus: "APPROVED",
        date: { gte: monthStart },
        deletedAt: null,
      },
    }),
    prisma.financialTransaction.aggregate({
      _sum: { amount: true },
      _count: true,
      where: {
        companyId: { in: companyIds },
        type: { in: ["SO", "FAKTUR"] },
        approvalStatus: "APPROVED",
        date: { gte: monthStart },
        deletedAt: null,
      },
    }),
    prisma.financialTransaction.aggregate({
      _sum: { amount: true },
      where: {
        companyId: { in: companyIds },
        type: "FAKTUR",
        approvalStatus: "APPROVED",
        date: { gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
        deletedAt: null,
      },
    }),
    prisma.financialTransaction.aggregate({
      _sum: { amount: true },
      where: {
        companyId: { in: companyIds },
        type: { in: ["PO", "FAKTUR"] },
        approvalStatus: "APPROVED",
        deletedAt: null,
      },
    }),
    prisma.financialTransaction.count({
      where: {
        companyId: { in: companyIds },
        approvalStatus: { in: ["SUBMITTED", "REVIEWED"] },
        currentRole: user.role,
        deletedAt: null,
      },
    }),
    prisma.$queryRaw<{ vendorCode: string; vendorName: string; total: number }[]>`
      SELECT
        COALESCE(metadata->>'vendorCode', 'UNKNOWN') as "vendorCode",
        COALESCE(metadata->>'vendorName', 'Tanpa Vendor') as "vendorName",
        SUM(amount)::float as total
      FROM "FinancialTransaction"
      WHERE "companyId" = ANY(${companyIds}::text[])
        AND type IN ('PO', 'FAKTUR')
        AND "approvalStatus" = 'APPROVED'
        AND "deletedAt" IS NULL
        AND date >= ${monthStart}
      GROUP BY 1, 2
      ORDER BY total DESC
      LIMIT 5
    `,
    prisma.$queryRaw<{ period: string; type: string; total: number; companyCode: string }[]>`
      SELECT
        TO_CHAR(t.date, 'YYYY-MM') as period,
        t.type,
        SUM(t.amount)::float as total,
        c.code as "companyCode"
      FROM "FinancialTransaction" t
      JOIN "Company" c ON c.id = t."companyId"
      WHERE t."companyId" = ANY(${companyIds}::text[])
        AND t."deletedAt" IS NULL
        AND t."approvalStatus" = 'APPROVED'
        AND t.date >= ${new Date(now.getFullYear(), now.getMonth() - 11, 1)}
      GROUP BY 1, 2, 4
      ORDER BY 1
    `,
  ]);

  return {
    pembelianBulanIni: Number(pembelianMonth._sum.amount ?? 0),
    pembelianCount: pembelianMonth._count,
    penjualanBulanIni: Number(penjualanMonth._sum.amount ?? 0),
    penjualanCount: penjualanMonth._count,
    piutang: Number(piutang._sum.amount ?? 0),
    hutang: Number(hutang._sum.amount ?? 0),
    approvalPending,
    topVendors: topVendors.map((v) => ({ code: v.vendorCode, name: v.vendorName, total: Number(v.total) })),
    topProducts: [], // skip di konsolidasi
    monthlyTrend: monthlyTrend.map((m) => ({ period: m.period, type: `${m.type} (${m.companyCode})`, total: Number(m.total) })),
  };
}
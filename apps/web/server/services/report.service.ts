/**
 * Report Service
 * - KPI dashboard (omzet, pembelian, piutang, hutang, approval pending)
 * - Laporan Pembelian / Penjualan (filter + aggregate)
 * - Monthly trend (12 bulan terakhir)
 */
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@shared/types";
import type { Prisma } from "@prisma/client";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

export async function getDashboardKpi(user: SessionUser) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const whereCompany: Prisma.FinancialTransactionWhereInput = {
    companyId: user.companyId,
    deletedAt: null,
  };

  const [pembelianMonth, penjualanMonth, piutang, hutang, approvalPending, topVendors, topProducts, monthlyTrend] = await Promise.all([
    // Pembelian bulan ini (PO + FAKTUR)
    prisma.financialTransaction.aggregate({
      _sum: { amount: true },
      _count: true,
      where: {
        ...whereCompany,
        type: { in: ["PO", "FAKTUR"] },
        approvalStatus: "APPROVED",
        date: { gte: monthStart, lt: monthEnd },
      },
    }),
    // Penjualan bulan ini (SO + FAKTUR Penjualan, not yet implemented -> use SO if any)
    prisma.financialTransaction.aggregate({
      _sum: { amount: true },
      _count: true,
      where: {
        ...whereCompany,
        type: { in: ["SO", "FAKTUR"] },
        approvalStatus: "APPROVED",
        date: { gte: monthStart, lt: monthEnd },
      },
    }),
    // Piutang = sum of (FAKTUR type) - (PEMBAYARAN) in jurnal -> approximate via tx
    prisma.financialTransaction.aggregate({
      _sum: { amount: true },
      where: {
        ...whereCompany,
        type: "FAKTUR",
        approvalStatus: "APPROVED",
        // No payment yet (approximate: filter by date)
        date: { gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
      },
    }),
    // Hutang = PO + FAKTUR amount
    prisma.financialTransaction.aggregate({
      _sum: { amount: true },
      where: {
        ...whereCompany,
        type: { in: ["PO", "FAKTUR"] },
        approvalStatus: "APPROVED",
      },
    }),
    // Approval pending
    prisma.financialTransaction.count({
      where: {
        ...whereCompany,
        approvalStatus: { in: ["SUBMITTED", "REVIEWED"] },
        currentRole: user.role,
      },
    }),
    // Top vendors (by PO+FAKTUR amount)
    prisma.$queryRaw<{ vendorCode: string; vendorName: string; total: number }[]>`
      SELECT
        COALESCE(metadata->>'vendorCode', 'UNKNOWN') as "vendorCode",
        COALESCE(metadata->>'vendorName', 'Tanpa Vendor') as "vendorName",
        SUM(amount)::float as total
      FROM "FinancialTransaction"
      WHERE "companyId" = ${user.companyId}
        AND type IN ('PO', 'FAKTUR')
        AND "approvalStatus" = 'APPROVED'
        AND "deletedAt" IS NULL
        AND date >= ${monthStart}
      GROUP BY 1, 2
      ORDER BY total DESC
      LIMIT 5
    `,
    // Top products
    prisma.$queryRaw<{ name: string; qty: number }[]>`
      SELECT
        COALESCE(item->>'productName', item->>'productCode', 'Unknown') as name,
        SUM((item->>'qty')::float) as qty
      FROM "FinancialTransaction",
        jsonb_array_elements(metadata->'items') as item
      WHERE "companyId" = ${user.companyId}
        AND type IN ('PO', 'GR', 'FAKTUR')
        AND "approvalStatus" = 'APPROVED'
        AND "deletedAt" IS NULL
        AND date >= ${monthStart}
      GROUP BY 1
      ORDER BY qty DESC
      LIMIT 5
    `,
    // Monthly trend (last 12 months)
    prisma.$queryRaw<{ period: string; type: string; total: number }[]>`
      SELECT
        TO_CHAR(date, 'YYYY-MM') as period,
        type,
        SUM(amount)::float as total
      FROM "FinancialTransaction"
      WHERE "companyId" = ${user.companyId}
        AND "deletedAt" IS NULL
        AND "approvalStatus" = 'APPROVED'
        AND date >= ${new Date(now.getFullYear(), now.getMonth() - 11, 1)}
      GROUP BY 1, 2
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
    topProducts: topProducts.map((p) => ({ name: p.name, qty: Number(p.qty) })),
    monthlyTrend: monthlyTrend.map((m) => ({ period: m.period, type: m.type, total: Number(m.total) })),
  };
}

export interface PurchaseReportFilter {
  user: SessionUser;
  startDate?: Date;
  endDate?: Date;
  vendorCode?: string;
  projectCode?: string;
  status?: string;
}

export async function getPurchaseReport(filter: PurchaseReportFilter) {
  const { user, startDate, endDate, vendorCode, projectCode, status } = filter;

  const where: Prisma.FinancialTransactionWhereInput = {
    companyId: user.companyId,
    type: { in: ["PO", "FAKTUR", "GR"] },
    deletedAt: null,
  };

  if (startDate) where.date = { ...((where.date as object) ?? {}), gte: startDate };
  if (endDate) where.date = { ...((where.date as object) ?? {}), lte: endDate };
  if (projectCode) where.projectCode = projectCode;
  if (status) where.approvalStatus = status as any;
  if (vendorCode) {
    where.metadata = { path: ["vendorCode"], equals: vendorCode };
  }

  const data = await prisma.financialTransaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: 500,
  });

  // Aggregate by vendor
  const byVendor = new Map<string, { name: string; total: number; count: number }>();
  for (const tx of data) {
    const meta = (tx.metadata as any) ?? {};
    const code = meta.vendorCode ?? "UNKNOWN";
    const name = meta.vendorName ?? "Tanpa Vendor";
    const cur = byVendor.get(code) ?? { name, total: 0, count: 0 };
    cur.total += Number(tx.amount);
    cur.count += 1;
    byVendor.set(code, cur);
  }

  // Aggregate by project
  const byProject = new Map<string, { name: string; total: number; count: number }>();
  for (const tx of data) {
    const meta = (tx.metadata as any) ?? {};
    const code = tx.projectCode ?? "NO_PROJECT";
    const name = meta.projectName ?? code;
    const cur = byProject.get(code) ?? { name, total: 0, count: 0 };
    cur.total += Number(tx.amount);
    cur.count += 1;
    byProject.set(code, cur);
  }

  const total = data.reduce((s, t) => s + Number(t.amount), 0);

  return {
    data: data.map((tx) => ({
      id: tx.id,
      code: (tx.metadata as any)?.code ?? tx.id.slice(-6).toUpperCase(),
      type: tx.type,
      date: tx.date.toISOString().slice(0, 10),
      description: tx.description,
      vendorCode: (tx.metadata as any)?.vendorCode ?? null,
      vendorName: (tx.metadata as any)?.vendorName ?? null,
      projectCode: tx.projectCode ?? null,
      projectName: (tx.metadata as any)?.projectName ?? null,
      amount: Number(tx.amount),
      status: tx.approvalStatus,
    })),
    total,
    count: data.length,
    byVendor: Array.from(byVendor.entries())
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => b.total - a.total),
    byProject: Array.from(byProject.entries())
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => b.total - a.total),
  };
}

export async function getTransactionHistory(
  user: SessionUser,
  options: { page?: number; pageSize?: number; type?: string; startDate?: Date; endDate?: Date } = {},
) {
  const { page = 1, pageSize = 50, type, startDate, endDate } = options;

  const where: Prisma.FinancialTransactionWhereInput = {
    companyId: user.companyId,
    deletedAt: null,
  };
  if (type) where.type = type as any;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as any).gte = startDate;
    if (endDate) (where.date as any).lte = endDate;
  }

  const [data, total] = await Promise.all([
    prisma.financialTransaction.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.financialTransaction.count({ where }),
  ]);

  return {
    data: data.map((tx) => ({
      id: tx.id,
      type: tx.type,
      code: (tx.metadata as any)?.code ?? tx.id.slice(-6).toUpperCase(),
      date: tx.date.toISOString().slice(0, 10),
      description: tx.description,
      amount: Number(tx.amount),
      status: tx.approvalStatus,
      currentRole: tx.currentRole,
      updatedAt: tx.updatedAt.toISOString(),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
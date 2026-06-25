/**
 * Transaction service untuk OP chain
 * - PR, PO, DO, GR, Faktur (semua Purchase/AP flow)
 * - Auto-generate document number
 * - Carry-forward dari parent doc
 * - List with filter + pagination
 */
import { prisma } from "@/lib/prisma";
import { Prisma, ApprovalStatus, DocType } from "@prisma/client";
import type { SessionUser } from "@shared/types";
import type { LineItem } from "@/lib/schemas/transaction";

export interface TransactionWithChain {
  id: string;
  companyId: string;
  type: DocType;
  code: string;
  date: string;
  description: string;
  amount: number;
  approvalStatus: ApprovalStatus;
  currentRole: string | null;
  vendorCode: string | null;
  vendorName: string | null;
  projectCode: string | null;
  projectName: string | null;
  hasPPN: boolean;
  items: LineItem[];
  refType: string | null;
  refId: string | null;
  refCode: string | null;
  parentId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

function formatTx(tx: any): TransactionWithChain {
  const meta = (tx.metadata as any) ?? {};
  return {
    id: tx.id,
    companyId: tx.companyId,
    type: tx.type,
    code: meta.code ?? tx.id.slice(-6).toUpperCase(),
    date: tx.date.toISOString().slice(0, 10),
    description: tx.description,
    amount: Number(tx.amount),
    approvalStatus: tx.approvalStatus,
    currentRole: tx.currentRole ?? null,
    vendorCode: meta.vendorCode ?? null,
    vendorName: meta.vendorName ?? null,
    projectCode: tx.projectCode ?? null,
    projectName: meta.projectName ?? null,
    hasPPN: meta.hasPPN ?? false,
    items: meta.items ?? [],
    refType: tx.refType ?? null,
    refId: tx.refId ?? null,
    refCode: meta.refCode ?? null,
    parentId: tx.parentId ?? null,
    createdById: tx.createdById,
    createdAt: tx.createdAt.toISOString(),
    updatedAt: tx.updatedAt.toISOString(),
  };
}

// Generate document code: PR-2026-0001
export async function generateDocCode(
  companyId: string,
  type: DocType,
  date: Date,
): Promise<string> {
  const year = date.getFullYear();
  const prefix = `${type}-${year}-`;

  // Count existing docs of this type in this year for this company
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const count = await prisma.financialTransaction.count({
    where: {
      companyId,
      type,
      date: { gte: startOfYear, lt: endOfYear },
      deletedAt: null,
    },
  });

  const seq = String(count + 1).padStart(4, "0");
  return `${prefix}${seq}`;
}

export interface ListTxParams {
  user: SessionUser;
  type: DocType;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ApprovalStatus;
  projectCode?: string;
  vendorCode?: string;
}

export async function listTransactions(params: ListTxParams) {
  const { user, type, page = 1, pageSize = 20, search, status, projectCode, vendorCode } = params;

  const where: Prisma.FinancialTransactionWhereInput = {
    companyId: user.companyId,
    type,
    deletedAt: null,
  };

  if (status) where.approvalStatus = status;
  if (projectCode) where.projectCode = projectCode;
  if (vendorCode) {
    where.metadata = { path: ["vendorCode"], equals: vendorCode };
  }
  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { metadata: { path: ["code"], string_contains: search } },
      { metadata: { path: ["vendorName"], string_contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.financialTransaction.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.financialTransaction.count({ where }),
  ]);

  return {
    data: data.map(formatTx),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getTransaction(user: SessionUser, type: DocType, id: string) {
  const tx = await prisma.financialTransaction.findUnique({ where: { id } });
  if (!tx || tx.type !== type || tx.companyId !== user.companyId) return null;
  return formatTx(tx);
}

export interface CreateTxInput {
  type: DocType;
  date: string;
  description: string;
  vendorCode?: string;
  vendorName?: string;
  projectCode?: string;
  projectName?: string;
  hasPPN?: boolean;
  notes?: string;
  items: LineItem[];
  parentId?: string;
  refType?: string;
  refId?: string;
  refCode?: string;
  extraMetadata?: Record<string, any>;
}

export async function createTransaction(user: SessionUser, input: CreateTxInput) {
  const date = new Date(input.date);
  const code = await generateDocCode(user.companyId, input.type, date);

  // Compute total amount
  const subtotal = input.items.reduce((sum, item) => {
    return sum + item.qty * item.harga - (item.diskon ?? 0);
  }, 0);
  const total = input.hasPPN ? subtotal * 1.11 : subtotal;

  // Carry forward from parent (jika ada)
  let parent = null;
  if (input.parentId) {
    parent = await prisma.financialTransaction.findUnique({ where: { id: input.parentId } });
    if (parent && parent.companyId === user.companyId) {
      const pmeta = (parent.metadata as any) ?? {};
      input.vendorCode = input.vendorCode ?? pmeta.vendorCode;
      input.vendorName = input.vendorName ?? pmeta.vendorName;
      input.projectCode = input.projectCode ?? parent.projectCode ?? undefined;
      input.projectName = input.projectName ?? pmeta.projectName;
      input.hasPPN = input.hasPPN ?? pmeta.hasPPN ?? false;
    }
  }

  const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  const metadata: any = {
    code,
    vendorCode: input.vendorCode,
    vendorName: input.vendorName,
    projectName: input.projectName,
    hasPPN: input.hasPPN ?? false,
    items: input.items,
    notes: input.notes,
    refCode: input.refCode,
    subtotal,
    ppn: input.hasPPN ? subtotal * 0.11 : 0,
    ...input.extraMetadata,
  };

  const tx = await prisma.financialTransaction.create({
    data: {
      companyId: user.companyId,
      divisionCode: "OP",
      projectCode: input.projectCode,
      date,
      period,
      type: input.type,
      description: input.description,
      amount: new Prisma.Decimal(total),
      approvalStatus: "DRAFT",
      parentId: input.parentId,
      refType: input.refType,
      refId: input.refId,
      createdById: user.id,
      metadata,
    },
  });

  return formatTx(tx);
}

export async function updateTransaction(
  user: SessionUser,
  type: DocType,
  id: string,
  input: Partial<CreateTxInput>,
) {
  const existing = await prisma.financialTransaction.findUnique({ where: { id } });
  if (!existing || existing.type !== type || existing.companyId !== user.companyId) {
    throw new Error("Transaksi tidak ditemukan");
  }
  if (existing.approvalStatus !== "DRAFT") {
    throw new Error("Hanya dokumen DRAFT yang bisa diedit");
  }

  const date = input.date ? new Date(input.date) : existing.date;
  const existingMeta = (existing.metadata as any) ?? {};
  const merged: any = { ...existingMeta };

  if (input.vendorCode !== undefined) merged.vendorCode = input.vendorCode;
  if (input.vendorName !== undefined) merged.vendorName = input.vendorName;
  if (input.projectName !== undefined) merged.projectName = input.projectName;
  if (input.hasPPN !== undefined) merged.hasPPN = input.hasPPN;
  if (input.notes !== undefined) merged.notes = input.notes;
  if (input.items) {
    merged.items = input.items;
    const subtotal = input.items.reduce((s, i) => s + i.qty * i.harga - (i.diskon ?? 0), 0);
    merged.subtotal = subtotal;
    merged.ppn = merged.hasPPN ? subtotal * 0.11 : 0;
  }
  if (input.extraMetadata) Object.assign(merged, input.extraMetadata);

  const subtotal = merged.subtotal ?? Number(existing.amount);
  const total = merged.hasPPN ? subtotal * 1.11 : subtotal;

  const tx = await prisma.financialTransaction.update({
    where: { id },
    data: {
      date,
      description: input.description ?? existing.description,
      projectCode: input.projectCode ?? existing.projectCode,
      amount: new Prisma.Decimal(total),
      metadata: merged,
    },
  });

  return formatTx(tx);
}

export async function deleteTransaction(user: SessionUser, type: DocType, id: string) {
  const existing = await prisma.financialTransaction.findUnique({ where: { id } });
  if (!existing || existing.type !== type || existing.companyId !== user.companyId) {
    throw new Error("Transaksi tidak ditemukan");
  }
  if (existing.approvalStatus !== "DRAFT") {
    throw new Error("Hanya dokumen DRAFT yang bisa dihapus");
  }
  await prisma.financialTransaction.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
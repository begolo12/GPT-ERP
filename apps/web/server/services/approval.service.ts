/**
 * Approval Service
 * - submitForApproval: DRAFT -> SUBMITTED
 * - approve: SUBMITTED/REVIEWED -> APPROVED (auto-post jika eligible)
 * - reject: -> REJECTED
 * - revise: -> REVISED
 * - cancel: -> CANCELLED
 */
import { prisma } from "@/lib/prisma";
import { Prisma, ApprovalStatus } from "@prisma/client";
import type { SessionUser } from "@shared/types";
import { canApprove, determineNextRole } from "@/server/engine/approval";
import { postTransaction } from "@/server/engine/posting";

export class ApprovalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApprovalError";
  }
}

export async function submitForApproval(
  user: SessionUser,
  transactionId: string,
  note?: string,
) {
  const tx = await prisma.financialTransaction.findUnique({ where: { id: transactionId } });
  if (!tx || tx.companyId !== user.companyId) throw new ApprovalError("Transaksi tidak ditemukan");
  if (tx.approvalStatus !== "DRAFT" && tx.approvalStatus !== "REVISED") {
    throw new ApprovalError(`Tidak bisa submit dari status ${tx.approvalStatus}`);
  }

  const nextRole = determineNextRole(Number(tx.amount), tx.type);

  const result = await prisma.$transaction(async (db) => {
    const updated = await db.financialTransaction.update({
      where: { id: transactionId },
      data: {
        approvalStatus: "SUBMITTED",
        currentRole: nextRole,
      },
    });

    await db.approvalStep.create({
      data: {
        transactionId,
        fromRole: user.role,
        toRole: nextRole,
        action: "SEND",
        actorId: user.id,
        actorName: user.name,
        note: note ?? null,
        status: "SUBMITTED",
      },
    });

    // Notify users with nextRole
    await db.notification.create({
      data: {
        recipientRole: nextRole,
        companyId: user.companyId,
        divisionCode: tx.divisionCode,
        transactionId,
        type: "APPROVAL",
        title: `Dokumen perlu approval: ${tx.type}`,
        message: `${user.name} mengirim ${tx.type} (${(tx.metadata as any)?.code ?? ""}) senilai Rp ${Number(tx.amount).toLocaleString("id-ID")}`,
      },
    });

    return updated;
  });

  return result;
}

export async function approveTransaction(
  user: SessionUser,
  transactionId: string,
  note?: string,
) {
  const tx = await prisma.financialTransaction.findUnique({
    where: { id: transactionId },
    include: { company: true },
  });
  if (!tx || tx.companyId !== user.companyId) throw new ApprovalError("Transaksi tidak ditemukan");
  if (tx.approvalStatus !== "SUBMITTED" && tx.approvalStatus !== "REVIEWED") {
    throw new ApprovalError(`Tidak bisa approve dari status ${tx.approvalStatus}`);
  }

  if (!canApprove(user.role as any, tx.currentRole as any, Number(tx.amount), tx.type)) {
    throw new ApprovalError(`Role ${user.role} tidak punya hak approve untuk ${tx.type} sebesar Rp ${Number(tx.amount).toLocaleString("id-ID")}`);
  }

  const result = await prisma.$transaction(async (db) => {
    const updated = await db.financialTransaction.update({
      where: { id: transactionId },
      data: {
        approvalStatus: "APPROVED",
        currentRole: null,
        updatedById: user.id,
      },
    });

    await db.approvalStep.create({
      data: {
        transactionId,
        fromRole: user.role,
        toRole: "APPROVED",
        action: "APPROVE",
        actorId: user.id,
        actorName: user.name,
        note: note ?? null,
        status: "APPROVED",
      },
    });

    // Notify creator
    await db.notification.create({
      data: {
        recipientUserId: tx.createdById,
        companyId: user.companyId,
        divisionCode: tx.divisionCode,
        transactionId,
        type: "STATUS",
        title: `Dokumen disetujui: ${tx.type}`,
        message: `${user.name} menyetujui ${tx.type} (${(tx.metadata as any)?.code ?? ""})`,
      },
    });

    // Auto-posting (best effort: log error jika gagal, jangan rollback approval)
    try {
      const linesCount = await postTransaction(
        db,
        transactionId,
        user.companyId,
        tx.type,
        Number(tx.amount),
        tx.metadata as any,
      );
      if (linesCount > 0) {
        await db.notification.create({
          data: {
            recipientUserId: tx.createdById,
            companyId: user.companyId,
            transactionId,
            type: "INFO",
            title: `Jurnal ter-posting`,
            message: `${linesCount} jurnal line untuk ${tx.type} ${(tx.metadata as any)?.code ?? ""}`,
          },
        });
      }
    } catch (e: any) {
      // Posting gagal, log saja (admin perlu fix COA)
      await db.notification.create({
        data: {
          recipientRole: "ADMIN",
          companyId: user.companyId,
          type: "INFO",
          title: `Posting gagal: ${tx.type}`,
          message: `${(tx.metadata as any)?.code ?? transactionId}: ${e.message}`,
        },
      });
    }

    return updated;
  });

  return result;
}

export async function rejectTransaction(
  user: SessionUser,
  transactionId: string,
  note: string,
) {
  if (!note?.trim()) throw new ApprovalError("Alasan reject wajib diisi");

  const tx = await prisma.financialTransaction.findUnique({ where: { id: transactionId } });
  if (!tx || tx.companyId !== user.companyId) throw new ApprovalError("Transaksi tidak ditemukan");
  if (tx.approvalStatus !== "SUBMITTED" && tx.approvalStatus !== "REVIEWED") {
    throw new ApprovalError(`Tidak bisa reject dari status ${tx.approvalStatus}`);
  }

  return await prisma.$transaction(async (db) => {
    const updated = await db.financialTransaction.update({
      where: { id: transactionId },
      data: {
        approvalStatus: "REJECTED",
        currentRole: null,
        updatedById: user.id,
      },
    });

    await db.approvalStep.create({
      data: {
        transactionId,
        fromRole: user.role,
        toRole: "REJECTED",
        action: "REJECT",
        actorId: user.id,
        actorName: user.name,
        note,
        status: "REJECTED",
      },
    });

    await db.notification.create({
      data: {
        recipientUserId: tx.createdById,
        companyId: user.companyId,
        divisionCode: tx.divisionCode,
        transactionId,
        type: "STATUS",
        title: `Dokumen ditolak: ${tx.type}`,
        message: `${user.name} menolak: ${note}`,
      },
    });

    return updated;
  });
}

export async function reviseTransaction(
  user: SessionUser,
  transactionId: string,
  note: string,
) {
  if (!note?.trim()) throw new ApprovalError("Alasan revisi wajib diisi");

  const tx = await prisma.financialTransaction.findUnique({ where: { id: transactionId } });
  if (!tx || tx.companyId !== user.companyId) throw new ApprovalError("Transaksi tidak ditemukan");
  if (tx.approvalStatus !== "SUBMITTED" && tx.approvalStatus !== "REVIEWED" && tx.approvalStatus !== "REJECTED") {
    throw new ApprovalError(`Tidak bisa revisi dari status ${tx.approvalStatus}`);
  }

  return await prisma.$transaction(async (db) => {
    const updated = await db.financialTransaction.update({
      where: { id: transactionId },
      data: {
        approvalStatus: "REVISED",
        currentRole: null,
        updatedById: user.id,
      },
    });

    await db.approvalStep.create({
      data: {
        transactionId,
        fromRole: user.role,
        toRole: "REVISED",
        action: "REVISE",
        actorId: user.id,
        actorName: user.name,
        note,
        status: "REVISED",
      },
    });

    await db.notification.create({
      data: {
        recipientUserId: tx.createdById,
        companyId: user.companyId,
        divisionCode: tx.divisionCode,
        transactionId,
        type: "STATUS",
        title: `Dokumen perlu revisi: ${tx.type}`,
        message: `${user.name}: ${note}`,
      },
    });

    return updated;
  });
}

export async function listApprovalQueue(
  user: SessionUser,
  options: { page?: number; pageSize?: number; divisionCode?: string } = {},
) {
  const { page = 1, pageSize = 20, divisionCode } = options;

  const where: Prisma.FinancialTransactionWhereInput = {
    companyId: user.companyId,
    approvalStatus: { in: ["SUBMITTED", "REVIEWED"] },
    deletedAt: null,
  };

  // Filter by user's role (currentRole = user's role)
  if (user.role === "ADMIN") {
    // ADMIN sees all
  } else {
    where.currentRole = user.role;
  }

  if (divisionCode) {
    where.divisionCode = divisionCode as any;
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
    data: data.map((t) => ({
      id: t.id,
      type: t.type,
      code: (t.metadata as any)?.code ?? t.id.slice(-6).toUpperCase(),
      date: t.date.toISOString().slice(0, 10),
      description: t.description,
      amount: Number(t.amount),
      approvalStatus: t.approvalStatus,
      currentRole: t.currentRole,
      divisionCode: t.divisionCode,
      vendorName: (t.metadata as any)?.vendorName ?? null,
      projectName: (t.metadata as any)?.projectName ?? t.projectCode ?? null,
      createdBy: t.createdById,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
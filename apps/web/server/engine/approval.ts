/**
 * Approval Engine
 * - Define min role & escalation threshold per DocType
 * - Determine next role saat submit
 * - Check apakah current user boleh approve
 */
import type { DocType, UserRole } from "@prisma/client";

export interface ApprovalRule {
  minRole: UserRole;
  escalateAbove?: number; // amount threshold (Rp)
  escalateTo?: UserRole;
}

export const APPROVAL_RULES: Record<string, ApprovalRule> = {
  PR: { minRole: "SPV" },
  PO: { minRole: "MANAGER", escalateAbove: 100_000_000, escalateTo: "DIREKTUR" },
  DO: { minRole: "SPV" },
  GR: { minRole: "SPV" },
  FAKTUR: { minRole: "MANAGER", escalateAbove: 100_000_000, escalateTo: "DIREKTUR" },
  PEMBAYARAN: { minRole: "MANAGER", escalateAbove: 100_000_000, escalateTo: "DIREKTUR" },
  PERMINTAAN_BAYAR: { minRole: "MANAGER", escalateAbove: 100_000_000, escalateTo: "DIREKTUR" },
  REALISASI_BIAYA: { minRole: "MANAGER", escalateAbove: 100_000_000, escalateTo: "DIREKTUR" },
  REALISASI_PEMBELIAN: { minRole: "MANAGER", escalateAbove: 100_000_000, escalateTo: "DIREKTUR" },
  PENGADAAN_GA: { minRole: "MANAGER", escalateAbove: 50_000_000, escalateTo: "DIREKTUR" },
  PENGADAAN_ATK: { minRole: "SPV", escalateAbove: 5_000_000, escalateTo: "MANAGER" },
  BEBAN: { minRole: "SPV", escalateAbove: 5_000_000, escalateTo: "MANAGER" },
  PERAWATAN_KENDARAAN: { minRole: "SPV", escalateAbove: 10_000_000, escalateTo: "MANAGER" },
  PENGGAJIAN: { minRole: "DIREKTUR" },
  REIMBURSE: { minRole: "SPV" },
  PELUNASAN: { minRole: "SPV" },
};

const ROLE_RANK: Record<string, number> = {
  OP: 1,
  FINANCE: 1,
  GA: 1,
  HR: 1,
  SPV: 2,
  MANAGER: 3,
  DIREKTUR: 4,
  ADMIN: 99,
};

export function canApprove(userRole: UserRole, requiredRole: UserRole, amount: number, type: DocType): boolean {
  const rule = APPROVAL_RULES[type] ?? { minRole: "MANAGER" };
  const userRank = ROLE_RANK[userRole] ?? 0;
  const requiredRank = ROLE_RANK[requiredRole] ?? 99;

  // ADMIN always can
  if (userRole === "ADMIN") return true;

  // If has escalation, user must be at least escalateTo level
  if (rule.escalateAbove && amount >= rule.escalateAbove) {
    return userRank >= (ROLE_RANK[rule.escalateTo!] ?? 99);
  }

  return userRank >= requiredRank;
}

export function determineNextRole(amount: number, type: DocType): UserRole {
  const rule = APPROVAL_RULES[type] ?? { minRole: "MANAGER" };
  if (rule.escalateAbove && amount >= rule.escalateAbove && rule.escalateTo) {
    return rule.escalateTo;
  }
  return rule.minRole;
}

export function getApprovalRule(type: DocType): ApprovalRule {
  return APPROVAL_RULES[type] ?? { minRole: "MANAGER" };
}
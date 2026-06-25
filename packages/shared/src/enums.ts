// =====================================================
// Shared enums \u2014 digunakan FE dan BE
// =====================================================

export const UserRole = {
  ADMIN: "ADMIN",
  FINANCE: "FINANCE",
  OP: "OP",
  GA: "GA",
  HR: "HR",
  SPV: "SPV",
  MANAGER: "MANAGER",
  DIREKTUR: "DIREKTUR",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const DivisionCode = {
  OP: "OP",
  FN: "FN",
  GA: "GA",
  HR: "HR",
} as const;
export type DivisionCode = (typeof DivisionCode)[keyof typeof DivisionCode];

export const ApprovalStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  REVIEWED: "REVIEWED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  REVISED: "REVISED",
  CANCELLED: "CANCELLED",
} as const;
export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

export const ApprovalAction = {
  SEND: "SEND",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  REVISE: "REVISE",
} as const;
export type ApprovalAction = (typeof ApprovalAction)[keyof typeof ApprovalAction];

export const AccountType = {
  ASSET: "ASSET",
  LIABILITY: "LIABILITY",
  EQUITY: "EQUITY",
  REVENUE: "REVENUE",
  EXPENSE: "EXPENSE",
} as const;
export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const ItemStatus = {
  AKTIF: "AKTIF",
  NONAKTIF: "NONAKTIF",
} as const;
export type ItemStatus = (typeof ItemStatus)[keyof typeof ItemStatus];

export const DocType = {
  PR: "PR",
  PO: "PO",
  DO: "DO",
  GR: "GR",
  QUOTATION: "QUOTATION",
  SO: "SO",
  SURAT_JALAN: "SURAT_JALAN",
  FAKTUR: "FAKTUR",
  PIUTANG: "PIUTANG",
  PEMBAYARAN: "PEMBAYARAN",
  PELUNASAN: "PELUNASAN",
  JURNAL_MEMORIAL: "JURNAL_MEMORIAL",
  BEBAN: "BEBAN",
  HUTANG: "HUTANG",
  REIMBURSE: "REIMBURSE",
  PERMINTAAN_BAYAR: "PERMINTAAN_BAYAR",
  PERMINTAAN_BIAYA_OP: "PERMINTAAN_BIAYA_OP",
  RENCANA_BIAYA: "RENCANA_BIAYA",
  PENGAJUAN_OPERASIONAL: "PENGAJUAN_OPERASIONAL",
  PENGADAAN_GA: "PENGADAAN_GA",
  PENGADAAN_ATK: "PENGADAAN_ATK",
  PERAWATAN_ASET: "PERAWATAN_ASET",
  PERAWATAN_KENDARAAN: "PERAWATAN_KENDARAAN",
  PERIZINAN: "PERIZINAN",
  PENGELUARAN_GA: "PENGELUARAN_GA",
  REKRUTMEN: "REKRUTMEN",
  INPUT_KANDIDAT: "INPUT_KANDIDAT",
  PANGGILAN_HR: "PANGGILAN_HR",
  FOLLOW_UP_KANDIDAT: "FOLLOW_UP_KANDIDAT",
  ONBOARDING: "ONBOARDING",
  WAWANCARA: "WAWANCARA",
  PENGGAJIAN: "PENGGAJIAN",
  ABSENSI: "ABSENSI",
  CUTI: "CUTI",
  REALISASI_BIAYA: "REALISASI_BIAYA",
  REALISASI_PEMBELIAN: "REALISASI_PEMBELIAN",
  ANGGARAN: "ANGGARAN",
} as const;
export type DocType = (typeof DocType)[keyof typeof DocType];

export const NotificationType = {
  APPROVAL: "APPROVAL",
  ROUTING: "ROUTING",
  STATUS: "STATUS",
  INFO: "INFO",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// Division colors (sesuai prompt)
export const DIVISION_COLORS: Record<DivisionCode, string> = {
  OP: "#2563eb",
  FN: "#b88324",
  GA: "#059669",
  HR: "#dc2626",
};

// Division labels (Indonesia)
export const DIVISION_LABELS: Record<DivisionCode, string> = {
  OP: "Operasi",
  FN: "Keuangan",
  GA: "General Affair",
  HR: "Human Resource",
};

// Role hierarchy (for approval routing)
// Staff level = OP/FINANCE/GA/HR (divisi-based)
export const ROLE_HIERARCHY: UserRole[] = [
  UserRole.OP,
  UserRole.FINANCE,
  UserRole.GA,
  UserRole.HR,
  UserRole.SPV,
  UserRole.MANAGER,
  UserRole.DIREKTUR,
];

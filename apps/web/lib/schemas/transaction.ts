import { z } from "zod";

export const lineItemSchema = z.object({
  productCode: z.string().min(1, "Produk wajib diisi"),
  productName: z.string().optional(),
  qty: z.coerce.number().positive("Qty harus > 0"),
  satuan: z.string().optional(),
  harga: z.coerce.number().min(0, "Harga >= 0"),
  diskon: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

export const transactionBaseSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  vendorCode: z.string().optional(),
  vendorName: z.string().optional(),
  projectCode: z.string().optional(),
  projectName: z.string().optional(),
  hasPPN: z.boolean().default(false),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "Minimal 1 item"),
});

export const prSchema = transactionBaseSchema.extend({
  type: z.literal("PR").default("PR"),
  refRencanaBiayaCode: z.string().optional(), // PR bisa ref Rencana Biaya
});

export const poSchema = transactionBaseSchema.extend({
  type: z.literal("PO").default("PO"),
  refPrId: z.string().optional(), // PO ref PR
  refPrCode: z.string().optional(),
  noPO: z.string().min(1, "No PO wajib diisi"),
  tanggalPO: z.string().min(1, "Tanggal PO wajib diisi"),
});

export const doSchema = transactionBaseSchema.extend({
  type: z.literal("DO").default("DO"),
  refPoId: z.string().min(1, "Ref PO wajib"),
  refPoCode: z.string().optional(),
});

export const grSchema = transactionBaseSchema.extend({
  type: z.literal("GR").default("GR"),
  refDoId: z.string().min(1, "Ref DO wajib"),
  refDoCode: z.string().optional(),
  gudangCode: z.string().optional(),
  gudangName: z.string().optional(),
});

export const fakturSchema = transactionBaseSchema.extend({
  type: z.literal("FAKTUR").default("FAKTUR"),
  refGrId: z.string().min(1, "Ref GR wajib"),
  refGrCode: z.string().optional(),
  noFaktur: z.string().min(1, "No Faktur wajib"),
  tanggalFaktur: z.string().min(1, "Tanggal Faktur wajib"),
  dueDate: z.string().optional(),
  pphPersen: z.coerce.number().min(0).max(100).default(0),
});

export type TransactionInput = z.infer<typeof transactionBaseSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
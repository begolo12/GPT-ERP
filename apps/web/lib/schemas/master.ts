import { z } from "zod";

const VALID_CATEGORIES = ["Vendor", "Pelanggan", "Produk", "Proyek", "Gudang", "Satuan", "Kategori Produk", "Metode Pembayaran", "Pengaturan Pajak"] as const;

export const masterCategorySchema = z.enum(VALID_CATEGORIES);

// Schema untuk create/update
// name & code required, sisanya optional + flexible
export const masterItemSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(200),
  code: z.string().min(1, "Kode wajib diisi").max(50),
  status: z.enum(["AKTIF", "NONAKTIF"]).default("AKTIF"),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type MasterItemInput = z.infer<typeof masterItemSchema>;
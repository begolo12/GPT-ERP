import { TxForm } from "@/components/transaction/TxForm";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-server";
import { listTransactions } from "@/server/services/transaction.service";
import { notFound } from "next/navigation";

export const metadata = { title: "Buah PR \u2014 GPT-ERP" };

export default async function Page() {
  const user = await requireSession();

  // Fetch master data
  const [vendors, products, projects] = await Promise.all([
    prisma.masterDataItem.findMany({
      where: { companyId: user.companyId, category: "Vendor", status: "AKTIF" },
      select: { code: true, name: true },
      orderBy: { code: "asc" },
    }),
    prisma.masterDataItem.findMany({
      where: { companyId: user.companyId, category: "Produk", status: "AKTIF" },
      select: { code: true, name: true, metadata: true },
      orderBy: { code: "asc" },
    }),
    prisma.masterDataItem.findMany({
      where: { companyId: user.companyId, category: "Proyek", status: "AKTIF" },
      select: { code: true, name: true },
      orderBy: { code: "asc" },
    }),
  ]);

  // Map produk dengan satuan dari metadata
  const productsWithSatuan = products.map((p) => ({
    code: p.code,
    name: p.name,
    satuan: (p.metadata as any)?.satuan,
  }));

  return (
    <TxForm
      type="PR"
      title="PR_TITLE"
      vendors={vendors}
      products={productsWithSatuan}
      projects={projects}
    />
  );
}
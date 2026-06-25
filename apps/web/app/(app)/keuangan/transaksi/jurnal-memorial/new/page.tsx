import { TxForm } from "@/components/transaction/TxForm";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-server";

export const metadata = { title: "Buat JURNAL_MEMORIAL \u2014 GPT-ERP" };

export default async function Page() {
  const user = await requireSession();
  const vendors = await prisma.masterDataItem.findMany({
    where: { companyId: user.companyId, category: "Vendor", status: "AKTIF" },
    select: { code: true, name: true },
    orderBy: { code: "asc" },
  });
  const projects = await prisma.masterDataItem.findMany({
    where: { companyId: user.companyId, category: "Proyek", status: "AKTIF" },
    select: { code: true, name: true },
    orderBy: { code: "asc" },
  });

  return (
    <TxForm
      type="JURNAL_MEMORIAL"
      title="Jurnal Memorial"
      vendors={vendors}
      products={[]}
      projects={projects}
      showHasPPN={false}
    />
  );
}
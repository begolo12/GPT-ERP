import { MasterPage } from "@/components/master/MasterPage";
import { MASTER_FIELDS, MASTER_TABLE_COLUMNS, MASTER_TITLE } from "@/lib/master-fields";
import { notFound } from "next/navigation";

const ALLOWED = ["Jabatan", "Tahap Wawancara", "Sumber Kandidat", "Keahlian", "Lokasi Aset", "Kategori Perawatan"];

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const sp = await searchParams;
  const cat = (sp.category ?? "Jabatan") as keyof typeof MASTER_FIELDS;
  if (!ALLOWED.includes(cat as string)) notFound();
  const titleInfo = MASTER_TITLE[cat];
  return (
    <MasterPage
      category={cat}
      title={titleInfo.title}
      subtitle={titleInfo.subtitle}
      fieldGroups={MASTER_FIELDS[cat]}
      tableColumns={MASTER_TABLE_COLUMNS[cat]}
    />
  );
}
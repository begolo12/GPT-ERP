import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "SURAT_JALAN \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="SURAT_JALAN"
      title="Surat Jalan"
      subtitle="SUBSurat Jalan"
      createHref="/operasi/penjualan/surat-jalan/new"
      detailHrefBase="/operasi/penjualan/surat-jalan"
    />
  );
}
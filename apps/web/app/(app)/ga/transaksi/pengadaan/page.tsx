import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "PENGADAAN_GA \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="PENGADAAN_GA"
      title="Pengadaan GA"
      subtitle="SUBPengadaan GA"
      createHref="/ga/transaksi/pengadaan/new"
      detailHrefBase="/ga/transaksi/pengadaan"
    />
  );
}
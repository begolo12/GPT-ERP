import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "PERAWATAN_KENDARAAN \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="PERAWATAN_KENDARAAN"
      title="Perawatan Kendaraan"
      subtitle="SUBPerawatan Kendaraan"
      createHref="/ga/transaksi/perawatan/new"
      detailHrefBase="/ga/transaksi/perawatan"
    />
  );
}
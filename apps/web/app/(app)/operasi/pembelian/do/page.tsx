import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "DO \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="DO"
      title="Pengiriman Barang"
      subtitle="SUBPengiriman Barang"
      createHref="/operasi/pembelian/do/new"
      detailHrefBase="/operasi/pembelian/do"
    />
  );
}
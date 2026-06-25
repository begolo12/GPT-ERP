import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "SO \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="SO"
      title="Pesanan Penjualan"
      subtitle="SUBPesanan Penjualan"
      createHref="/operasi/penjualan/so/new"
      detailHrefBase="/operasi/penjualan/so"
    />
  );
}
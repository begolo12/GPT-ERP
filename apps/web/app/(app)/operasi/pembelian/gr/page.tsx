import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "GR \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="GR"
      title="Penerimaan Barang"
      subtitle="SUBPenerimaan Barang"
      createHref="/operasi/pembelian/gr/new"
      detailHrefBase="/operasi/pembelian/gr"
    />
  );
}
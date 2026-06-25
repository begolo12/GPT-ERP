import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "PO \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="PO"
      title="Pesanan Pembelian"
      subtitle="SUBPesanan Pembelian"
      createHref="/operasi/pembelian/po/new"
      detailHrefBase="/operasi/pembelian/po"
    />
  );
}
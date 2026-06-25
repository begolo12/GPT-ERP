import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "QUOTATION \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="QUOTATION"
      title="Penawaran Harga"
      subtitle="SUBPenawaran Harga"
      createHref="/operasi/penjualan/quotation/new"
      detailHrefBase="/operasi/penjualan/quotation"
    />
  );
}
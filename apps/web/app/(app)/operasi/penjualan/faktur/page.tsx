import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "FAKTUR \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="FAKTUR"
      title="Faktur Penjualan"
      subtitle="SUBFaktur Penjualan"
      createHref="/operasi/penjualan/faktur/new"
      detailHrefBase="/operasi/penjualan/faktur"
    />
  );
}
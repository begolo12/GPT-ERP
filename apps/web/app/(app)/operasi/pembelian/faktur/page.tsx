import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "FAKTUR \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="FAKTUR"
      title="Faktur Pembelian"
      subtitle="SUBFaktur Pembelian"
      createHref="/operasi/pembelian/faktur/new"
      detailHrefBase="/operasi/pembelian/faktur"
    />
  );
}
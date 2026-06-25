import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "JURNAL_MEMORIAL \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="JURNAL_MEMORIAL"
      title="Jurnal Memorial"
      subtitle="SUBJurnal Memorial"
      createHref="/keuangan/transaksi/jurnal-memorial/new"
      detailHrefBase="/keuangan/transaksi/jurnal-memorial"
    />
  );
}
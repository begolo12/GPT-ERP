import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "HUTANG \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="HUTANG"
      title="Hutang"
      subtitle="SUBHutang"
      createHref="/keuangan/transaksi/hutang/new"
      detailHrefBase="/keuangan/transaksi/hutang"
    />
  );
}
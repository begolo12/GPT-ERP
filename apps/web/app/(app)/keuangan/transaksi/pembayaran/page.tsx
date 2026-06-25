import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "PEMBAYARAN \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="PEMBAYARAN"
      title="Pembayaran"
      subtitle="SUBPembayaran"
      createHref="/keuangan/transaksi/pembayaran/new"
      detailHrefBase="/keuangan/transaksi/pembayaran"
    />
  );
}
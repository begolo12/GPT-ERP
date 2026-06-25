import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "PENGGAJIAN \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="PENGGAJIAN"
      title="Penggajian"
      subtitle="SUBPenggajian"
      createHref="/hr/transaksi/penggajian/new"
      detailHrefBase="/hr/transaksi/penggajian"
    />
  );
}
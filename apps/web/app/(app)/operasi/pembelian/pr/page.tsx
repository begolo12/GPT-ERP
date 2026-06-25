import { TxList } from "@/components/transaction/TxList";

export const metadata = { title: "PR \u2014 GPT-ERP" };

export default function Page() {
  return (
    <TxList
      type="PR"
      title="Permintaan Pembelian"
      subtitle="SUBPermintaan Pembelian"
      createHref="/operasi/pembelian/pr/new"
      detailHrefBase="/operasi/pembelian/pr"
    />
  );
}
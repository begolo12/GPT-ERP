import { MasterPage } from "@/components/master/MasterPage";
import { MASTER_FIELDS, MASTER_TABLE_COLUMNS, MASTER_TITLE } from "@/lib/master-fields";

const CAT = "Gudang" as const;
const titleInfo = MASTER_TITLE[CAT];

export default function Page() {
  return (
    <MasterPage
      category={CAT}
      title={titleInfo.title}
      subtitle={titleInfo.subtitle}
      fieldGroups={MASTER_FIELDS[CAT]}
      tableColumns={MASTER_TABLE_COLUMNS[CAT]}
    />
  );
}
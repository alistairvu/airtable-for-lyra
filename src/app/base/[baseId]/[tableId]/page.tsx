import { BaseContainer } from "~/components/base/base-container";
import { BaseTable } from "~/components/base/base-table";
import { api } from "~/trpc/server";

type BaseProps = {
  baseId: string;
  tableId: string;
};

export default async function TablePage({
  params,
}: {
  params: Promise<BaseProps>;
}) {
  const baseId = (await params).baseId;

  const base = await api.base.get({ baseId });

  const tableId = (await params).tableId;

  const columns = await api.table.getColumns(tableId);

  const { count: rowCount } = await api.table.countRows(tableId);

  return (
    <BaseContainer base={base}>
      <BaseTable
        tableId={tableId}
        initialColumns={columns}
        rowCount={rowCount}
      />
    </BaseContainer>
  );
}
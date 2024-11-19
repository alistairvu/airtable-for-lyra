import {
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { BaseTable } from "~/components/base/base-table";
import { api } from "~/trpc/server";

type BaseProps = {
  baseId: string;
  tableId: string;
  viewId: string;
};

export default async function TablePage({
  params,
}: {
  params: Promise<BaseProps>;
}) {
  const tableId = (await params).tableId;
  const viewId = (await params).viewId;

  const columns = await api.table.getColumns(tableId);

  const { count: rowCount } = await api.table.countRows(tableId);
  const view = await api.view.get({ viewId });

  return (
    <BaseTable
      tableId={tableId}
      initialColumns={columns}
      initialRowCount={rowCount}
      viewId={viewId}
      initialSorting={(view?.sorting ?? ([] as unknown)) as SortingState}
      initialColumnFilters={
        (view?.columnFilters ?? ([] as unknown)) as ColumnFiltersState
      }
    />
  );
}

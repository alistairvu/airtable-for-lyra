import { BaseTable } from "~/components/base/table/base-table";
import {
  columnFiltersSchema,
  sortingStateSchema,
} from "~/schemas/sorting.schema";
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

  const allViews = await api.view.getViews({ tableId });

  const parsedInitialSorting = sortingStateSchema.safeParse(view?.sorting);
  const parsedInitialFilters = columnFiltersSchema.safeParse(
    view?.columnFilters,
  );

  return (
    <BaseTable
      tableId={tableId}
      initialColumns={columns}
      initialRowCount={rowCount}
      viewId={viewId}
      initialSorting={
        parsedInitialSorting.success ? parsedInitialSorting.data : []
      }
      initialColumnFilters={
        parsedInitialFilters.success ? parsedInitialFilters.data : []
      }
      initialViews={allViews}
    />
  );
}

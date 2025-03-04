import { type Column } from "@prisma/client";
import { api } from "~/trpc/react";
import { useColumnFilters } from "./use-column-filters";
import { useSearchQuery } from "./use-search-query";
import { useSorting } from "./use-sorting";

type UseAddDummyRowParams = {
  tableId: string;
  columns: Column[];
  rowCount: number;
  limit: number;
};

export const useAddDummyRows = ({
  tableId,
  columns,
  rowCount,
  limit,
}: UseAddDummyRowParams) => {
  const utils = api.useUtils();
  const [sorting] = useSorting();
  const [query] = useSearchQuery();
  const [columnFilters] = useColumnFilters();

  const addRow = api.table.addDummyRows.useMutation({
    onMutate: async ({ dummyRows }) => {
      // Cancel query
      await utils.table.getInfiniteRows.cancel();

      // Snapshot previous value
      const previousRows = utils.table.getInfiniteRows.getInfiniteData({
        tableId,
        limit,
        sorting,
        query,
        columnFilters,
      });

      const emptyNewRows = dummyRows
        .slice(0, limit)
        .map(({ name, age }, index) => ({
          index: rowCount + index + 1,
          id: crypto.randomUUID(),
          tableId,
          createdAt: new Date(),
          updatedAt: new Date(),
          cells: columns.map((column) => {
            if (column.name === "Name") {
              return {
                columnId: column.id,
                intValue: null,
                textValue: name,
                id: crypto.randomUUID(),
                rowId: crypto.randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            }

            if (column.name === "Age") {
              return {
                columnId: column.id,
                intValue: age,
                textValue: String(age),
                id: crypto.randomUUID(),
                rowId: crypto.randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            }

            return {
              columnId: column.id,
              intValue: column.type === "NUMBER" ? 0 : null,
              textValue: "",
              id: crypto.randomUUID(),
              rowId: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }),
        }));

      utils.table.countRows.setData(tableId, (data) =>
        data
          ? {
              count: data.count + 5000,
            }
          : undefined,
      );

      // Optimistically update
      utils.table.getInfiniteRows.setInfiniteData(
        { tableId, limit, sorting, query, columnFilters },
        (data) => {
          if (!data) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          return {
            ...data,
            pages: [
              ...data.pages,
              {
                items: emptyNewRows,
                nextCursor:
                  (data.pages[data.pages.length - 1]?.nextCursor ?? 0) + limit,
              },
            ],
          };
        },
      );

      return { previousRows };
    },

    onError: (_err, _newRow, context) => {
      utils.table.getInfiniteRows.setInfiniteData(
        { tableId, limit, sorting, query, columnFilters },
        context?.previousRows ?? {
          pages: [],
          pageParams: [],
        },
      );
    },

    onSettled: async () => {
      await utils.table.getInfiniteRows.invalidate({
        tableId,
        limit,
        sorting,
        query,
        columnFilters,
      });
      await utils.table.countRows.invalidate(tableId);
    },
  });

  return addRow;
};

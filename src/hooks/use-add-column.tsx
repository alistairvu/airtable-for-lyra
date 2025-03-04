import { ColumnType } from "@prisma/client";
import { api } from "~/trpc/react";
import { useColumnFilters } from "./use-column-filters";
import { useSearchQuery } from "./use-search-query";
import { useSorting } from "./use-sorting";

/**
 * Hook encapsulating the logic for adding a text column.
 *
 * @param tableId
 * @returns
 */
export const useAddTextColumn = (tableId: string, limit = 1000) => {
  const utils = api.useUtils();
  const [query] = useSearchQuery();
  const [sorting] = useSorting();
  const [columnFilters] = useColumnFilters();

  // SECTION: Mutations for adding a new  text column
  const addTextColumn = api.table.addTextColumn.useMutation({
    onMutate: async () => {
      // Cancel query
      await utils.table.getColumns.cancel();
      await utils.table.getInfiniteRows.cancel();

      // Snapshot previous value
      const previousColumns = utils.table.getColumns.getData(tableId);
      const previousRows = utils.table.getInfiniteRows.getInfiniteData({
        tableId,
        limit,
        query,
        sorting,
        columnFilters,
      });

      const nextIndex =
        Math.max(...(previousColumns?.map((col) => col.index) ?? [0])) + 1;

      // Empty column
      const emptyNewColumn = {
        index: nextIndex,
        id: crypto.randomUUID(),
        tableId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: "Label",
        type: ColumnType.TEXT,
        disabled: true,
      };

      // Optimistically update the cells
      utils.table.getInfiniteRows.setInfiniteData(
        { tableId, limit, query, sorting, columnFilters },
        (data) => {
          if (!data) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          const newPages = data.pages.map((page) => {
            const { items } = page;

            return {
              ...page,
              items: items.map((row) => ({
                ...row,
                cells: [
                  ...row.cells,
                  {
                    columnId: emptyNewColumn.id,
                    intValue: null,
                    textValue: "",
                    id: crypto.randomUUID(),
                    rowId: crypto.randomUUID(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                ],
              })),
            };
          });

          return {
            ...data,
            pages: newPages,
          };
        },
      );

      // Optimistically update the columns
      utils.table.getColumns.setData(tableId, (data) => {
        if (!data) {
          return [emptyNewColumn];
        }

        return [...data, emptyNewColumn];
      });

      return { previousColumns, previousRows };
    },

    onError: (_err, _newRow, context) => {
      utils.table.getColumns.setData(tableId, context?.previousColumns ?? []);
      utils.table.getInfiniteRows.setInfiniteData(
        { tableId, limit, query, sorting, columnFilters },
        context?.previousRows ?? {
          pages: [],
          pageParams: [],
        },
      );
    },

    onSettled: async () => {
      await Promise.allSettled([
        utils.table.getInfiniteRows.invalidate({
          tableId,
          limit,
          query,
          sorting,
          columnFilters,
        }),
        utils.table.getColumns.invalidate(tableId),
      ]);
    },
  });

  return addTextColumn;
};

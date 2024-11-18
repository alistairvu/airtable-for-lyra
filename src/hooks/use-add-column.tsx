import { ColumnType } from "@prisma/client";
import { api } from "~/trpc/react";

/**
 * Hook encapsulating the logic for adding a text column.
 *
 * @param tableId
 * @returns
 */
export const useAddTextColumn = (tableId: string, limit = 1000) => {
  const utils = api.useUtils();

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
      });

      // Empty column
      const emptyNewColumn = {
        index: (previousColumns?.length ?? 0) + 1,
        id: crypto.randomUUID(),
        tableId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: "Label",
        type: ColumnType.TEXT,
      };

      // Optimistically update the columns
      utils.table.getColumns.setData(tableId, (data) => {
        if (!data) {
          return [emptyNewColumn];
        }

        return [...data, emptyNewColumn];
      });

      // Optimistically update the cells
      utils.table.getInfiniteRows.setInfiniteData(
        { tableId, limit },
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
                    tempId: true,
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

      return { previousColumns, previousRows };
    },

    onError: (_err, _newRow, context) => {
      utils.table.getColumns.setData(tableId, context?.previousColumns ?? []);
      utils.table.getInfiniteRows.setInfiniteData(
        { tableId, limit },
        context?.previousRows ?? {
          pages: [],
          pageParams: [],
        },
      );
    },

    onSettled: async () => {
      await utils.table.getColumns.invalidate(tableId);
      await utils.table.getInfiniteRows.invalidate({ tableId, limit });
    },
  });

  return addTextColumn;
};

import { ColumnType } from "@prisma/client";
import { api } from "~/trpc/react";

/**
 * Hook encapsulating the logic for adding a text column.
 *
 * @param tableId
 * @returns
 */
export const useAddTextColumn = (tableId: string) => {
  const utils = api.useUtils();

  // SECTION: Mutations for adding a new  text column
  const addTextColumn = api.table.addTextColumn.useMutation({
    onMutate: async () => {
      // Cancel query
      await utils.table.getColumns.cancel();
      await utils.table.getRows.cancel();

      // Snapshot previous value
      const previousColumns = utils.table.getColumns.getData(tableId);
      const previousRows = utils.table.getRows.getData(tableId);

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
      utils.table.getRows.setData(tableId, (data) => {
        return data?.map((row) => ({
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
        }));
      });

      return { previousColumns, previousRows };
    },

    onError: (_err, _newRow, context) => {
      utils.table.getColumns.setData(tableId, context?.previousColumns ?? []);
      utils.table.getRows.setData(tableId, context?.previousRows ?? []);
    },

    onSettled: async () => {
      await utils.table.getColumns.invalidate(tableId);
      await utils.table.getRows.invalidate(tableId);
    },
  });

  return addTextColumn;
};

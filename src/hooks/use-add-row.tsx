import { Column } from "@prisma/client";
import { api } from "~/trpc/react";

type UseAddRowParams = {
  tableId: string;
  columns: Column[];
  rowCount: number;
};

export const useAddRow = ({ tableId, columns, rowCount }: UseAddRowParams) => {
  const utils = api.useUtils();

  const addRow = api.table.addRow.useMutation({
    onMutate: async () => {
      // Cancel query
      await utils.table.getRows.cancel();

      // Snapshot previous value
      const previousRows = utils.table.getRows.getData(tableId);

      const emptyNewRow = {
        index: rowCount,
        id: crypto.randomUUID(),
        tableId,
        createdAt: new Date(),
        updatedAt: new Date(),
        cells: columns.map((column) => ({
          columnId: column.id,
          intValue: column.type === "NUMBER" ? 0 : null,
          textValue: "",
          id: crypto.randomUUID(),
          rowId: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      // Optimistically update
      utils.table.getRows.setData(tableId, (data) => {
        if (!data) {
          return [emptyNewRow];
        }

        return [...data, emptyNewRow];
      });

      return { previousRows };
    },

    onError: (_err, _newRow, context) => {
      utils.table.getRows.setData(tableId, context?.previousRows ?? []);
    },

    onSettled: async () => {
      await utils.table.getRows.invalidate(tableId);
    },
  });

  return addRow;
};

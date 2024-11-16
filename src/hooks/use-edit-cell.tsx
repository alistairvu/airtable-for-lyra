import { api } from "~/trpc/react";

/**
 * Provides text cell editing functionality
 *
 * @param tableId The id of the current table.
 * @returns
 */
export const useEditTextCell = (tableId: string) => {
  const utils = api.useUtils();

  const editTextCell = api.table.editTextCell.useMutation({
    onMutate: async ({ value, cellId }) => {
      // Cancel query
      await utils.table.getRows.cancel();

      // Snapshot previous value
      const previousRows = utils.table.getRows.getData(tableId);

      // Optimistically update
      utils.table.getRows.setData(tableId, (data) => {
        if (!data) {
          return [];
        }

        return data.map((row) => {
          const matchingCell = row.cells.find((cell) => cell.id === cellId);

          if (matchingCell === null) {
            return row;
          }

          return {
            ...row,
            cells: row.cells.map((cell) => {
              if (cell.id !== cellId) {
                return cell;
              }

              return { ...cell, textValue: value };
            }),
          };
        });
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

  return editTextCell;
};

/**
 * Provides integer cell editing functionality
 *
 * @param tableId
 * @returns
 */
export const useEditIntCell = (tableId: string) => {
  const utils = api.useUtils();

  const editIntCell = api.table.editIntCell.useMutation({
    onMutate: async ({ value, cellId }) => {
      // Cancel query
      await utils.table.getRows.cancel();

      // Snapshot previous value
      const previousRows = utils.table.getRows.getData(tableId);

      // Optimistically update
      utils.table.getRows.setData(tableId, (data) => {
        if (!data) {
          return [];
        }

        return data.map((row) => {
          const matchingCell = row.cells.find((cell) => cell.id === cellId);

          if (matchingCell === null) {
            return row;
          }

          return {
            ...row,
            cells: row.cells.map((cell) => {
              if (cell.id !== cellId) {
                return cell;
              }

              return { ...cell, intValue: value, textValue: String(value) };
            }),
          };
        });
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

  return editIntCell;
};

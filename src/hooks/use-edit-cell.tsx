import { api } from "~/trpc/react";

/**
 * Provides text cell editing functionality
 *
 * @param tableId The id of the current table.
 * @returns
 */
export const useEditTextCell = (
  tableId: string,
  viewId: string,
  limit = 1000,
) => {
  const utils = api.useUtils();

  const editTextCell = api.table.editTextCell.useMutation({
    onMutate: async ({ value, cellId }) => {
      // Cancel query
      await utils.table.getInfiniteRows.cancel();

      // Snapshot previous value
      const previousRows = utils.table.getInfiniteRows.getInfiniteData({
        tableId,
        limit,
        viewId,
      });

      // Optimistically update
      utils.table.getInfiniteRows.setInfiniteData(
        { tableId, limit, viewId },
        (data) => {
          console.log(data);

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
                cells: row.cells.map((cell) => {
                  if (cell.id !== cellId) {
                    return cell;
                  }

                  return { ...cell, textValue: value };
                }),
              })),
            };
          });

          console.log({ newPages });

          return {
            ...data,
            pages: newPages,
          };
        },
      );

      return { previousRows };
    },

    onError: (_err, _newRow, context) => {
      utils.table.getInfiniteRows.setInfiniteData(
        { tableId, limit, viewId },
        context?.previousRows ?? {
          pages: [],
          pageParams: [],
        },
      );
    },

    onSettled: async () => {
      await utils.table.getInfiniteRows.invalidate({ tableId, viewId, limit });
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
export const useEditIntCell = (
  tableId: string,
  viewId: string,
  limit = 1000,
) => {
  const utils = api.useUtils();

  const editIntCell = api.table.editIntCell.useMutation({
    onMutate: async ({ value, cellId }) => {
      // Cancel query
      await utils.table.getInfiniteRows.cancel();

      // Snapshot previous value
      const previousRows = utils.table.getInfiniteRows.getInfiniteData({
        tableId,
        limit,
        viewId,
      });

      // Optimistically update
      utils.table.getInfiniteRows.setInfiniteData(
        { tableId, limit, viewId },
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
                cells: row.cells.map((cell) => {
                  if (cell.id !== cellId) {
                    return cell;
                  }
                  return { ...cell, intValue: value, textValue: String(value) };
                }),
              })),
            };
          });

          return {
            ...data,
            pages: newPages,
          };
        },
      );

      return { previousRows };
    },

    onError: (_err, _newRow, context) => {
      utils.table.getInfiniteRows.setInfiniteData(
        { tableId, limit, viewId },
        context?.previousRows ?? {
          pages: [],
          pageParams: [],
        },
      );
    },

    onSettled: async () => {
      await utils.table.getInfiniteRows.invalidate({ tableId, limit, viewId });
    },
  });

  return editIntCell;
};

import { type Column } from "@prisma/client";
import { api } from "~/trpc/react";

type UseAddRowParams = {
  tableId: string;
  columns: Column[];
  rowCount: number;
  limit: number;
  viewId: string;
};

export const useAddRow = ({
  tableId,
  columns,
  rowCount,
  limit,
  viewId,
}: UseAddRowParams) => {
  const utils = api.useUtils();

  const addRow = api.table.addRow.useMutation({
    onMutate: async () => {
      // Cancel query
      await utils.table.getInfiniteRows.cancel();

      // Snapshot previous value
      const previousRows = utils.table.getInfiniteRows.getInfiniteData({
        tableId,
        limit,
        viewId,
      });

      const emptyNewRow = {
        index: rowCount + 1,
        id: crypto.randomUUID(),
        tempId: crypto.randomUUID(),
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
          tempId: crypto.randomUUID(),
        })),
      };

      utils.table.countRows.setData(tableId, (data) =>
        data
          ? {
              count: data.count + 1,
            }
          : undefined,
      );

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

          return {
            ...data,
            pages: data.pages.map((page, idx) => {
              if (idx + 1 < data.pages.length) {
                return page;
              }

              return {
                ...page,
                items: [...page.items, emptyNewRow],
              };
            }),
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
      await utils.table.countRows.invalidate(tableId);
      await utils.table.getInfiniteRows.invalidate({ tableId, limit, viewId });
    },
  });

  return addRow;
};

"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type RowData,
  useReactTable,
} from "@tanstack/react-table";
import { ColumnType, type Column } from "@prisma/client";
import { type RowWithCells } from "~/@types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { BaseTableCell } from "./base-table-cell";
import { api } from "~/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { v4 as uuidv4 } from "uuid";

type BaseTableProps = {
  tableId: string;
  initialColumns: Column[];
  rowCount: number;
};

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateData?: (
      rowId: string,
      columnId: string,
      value: string | number,
    ) => void;

    isNumber?: (columnId: string) => boolean;
  }
}

export const BaseTable = ({
  tableId,
  initialColumns,
  rowCount,
}: BaseTableProps) => {
  // Query client
  const utils = api.useUtils();
  const queryClient = useQueryClient();

  // Loading in data
  const { data: columns } = api.table.getColumns.useQuery(tableId, {
    initialData: initialColumns,
  });

  const getRowsQuery = api.table.getRows.useQuery(tableId);

  const rows = getRowsQuery.data ?? [];

  // SECTION: Mutations for editing a text cell
  const editTextCell = api.table.editTextCell.useMutation({
    onSettled: async () => {
      const queryKey = getQueryKey(api.table.getRows, tableId, "any");
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  // SECTION: Mutations for editing a text cell
  const editIntCell = api.table.editIntCell.useMutation({
    onSettled: async () => {
      const queryKey = getQueryKey(api.table.getRows, tableId, "any");
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  // SECTION: Mutations for adding a new row
  const addRow = api.table.addRow.useMutation({
    onMutate: async () => {
      // Cancel query
      await utils.table.getRows.cancel();

      // Snapshot previous value
      const previousRows = utils.table.getRows.getData(tableId);

      const emptyNewRow = {
        index: rowCount,
        id: uuidv4(),
        tableId,
        createdAt: new Date(),
        updatedAt: new Date(),
        cells: columns.map((column) => ({
          columnId: column.id,
          intValue: column.type === "NUMBER" ? 0 : null,
          textValue: "",
          id: uuidv4(),
          rowId: uuidv4(),
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
        id: uuidv4(),
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
              id: uuidv4(),
              rowId: uuidv4(),
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
      await utils.table.getRows.invalidate(tableId);
      await utils.table.getColumns.invalidate(tableId);
    },
  });

  // Column definitions
  const columnDef: ColumnDef<RowWithCells, string | number>[] = columns.map(
    (column) => ({
      id: column.id,
      accessorFn: (row: RowWithCells) => {
        const cell = row.cells.find((cell) => cell.columnId === column.id);

        if (column.type === "NUMBER") {
          return cell?.intValue ?? 0;
        }

        return `${cell?.textValue}`;
      },
      header: column.name,
      cell: BaseTableCell,
    }),
  );

  // Actual table hook
  const table = useReactTable({
    data: rows,
    columns: columnDef,
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",

    getRowId: (originalRow, _index, _parent) => {
      return originalRow.id;
    },

    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowId: string, columnId: string, value: string | number) => {
        const isNumber =
          columns.find((col) => col.id === columnId)?.type === "NUMBER";
        const matchingRow = rows.find((row) => row.id === rowId);

        if (!matchingRow) {
          return;
        }

        const matchingCell = matchingRow.cells.find(
          (cell) => cell.columnId === columnId,
        );
        if (!matchingCell) {
          return;
        }

        const cellId = matchingCell.id;

        if (isNumber) {
          editIntCell.mutate({
            value: parseInt(`${value}`),
            cellId,
          });
        } else {
          editTextCell.mutate({ value: `${value}`, cellId });
        }
      },

      isNumber: (columnId: string) => {
        return columns.find((col) => col.id === columnId)?.type === "NUMBER";
      },
    },
  });

  // Setting up for virtualizer
  const { rows: tableRows } = table.getRowModel();

  const tableContainerRef = useRef<HTMLTableElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    estimateSize: () => 50,
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== "undefined" && !navigator.userAgent.includes("Firefox")
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <div ref={tableContainerRef} className="h-screen w-screen overflow-auto">
      <Table style={{ width: table.getTotalSize() * 2 }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              <TableHead className="w-4 bg-slate-100" />
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="border bg-slate-100"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className="absolute right-0 top-0 h-full w-1 bg-slate-600 opacity-0"
                    />
                  </TableHead>
                );
              })}
              <TableHead
                className="w-4 cursor-pointer bg-slate-100"
                onClick={() => addTextColumn.mutate({ tableId })}
              >
                +
              </TableHead>
            </TableRow>
          ))}
        </TableHeader>

        <TableBody
          style={{
            width: table.getTotalSize() * 2,
            height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
          }}
        >
          {table.getRowModel().rows.map((row, index) => {
            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                <TableCell className="border bg-slate-100 p-2 font-semibold text-slate-400">
                  {index + 1}
                </TableCell>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell key={cell.id} className="border py-0">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}

          <TableRow
            onClick={() => addRow.mutate(tableId)}
            className="cursor-pointer"
          >
            <TableCell className="border bg-slate-100 p-2 font-semibold text-slate-400">
              +
            </TableCell>

            {columns.map((column) => (
              <TableCell className="border" key={column.id} />
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

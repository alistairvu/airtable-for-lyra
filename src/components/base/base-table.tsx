"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type RowData,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { type Column } from "@prisma/client";
import { type IntFilter, type RowWithCells } from "~/@types";
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
import { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { BaseTableHeader } from "./base-table-header";
import { cn } from "~/lib/utils";
import { PlusIcon } from "lucide-react";
import { BaseContainerHeader } from "./base-container-header";
import { useEditIntCell, useEditTextCell } from "~/hooks/use-edit-cell";
import { useAddTextColumn } from "~/hooks/use-add-column";
import { useAddRow } from "~/hooks/use-add-row";

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
  // SECTION: Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // SECTION: Filter state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // SECTION: State related to search
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");

  // Loading in data
  const { data: columns } = api.table.getColumns.useQuery(tableId, {
    initialData: initialColumns,
  });

  const getRowsQuery = api.table.getRows.useQuery(tableId);

  const rows = getRowsQuery.data ?? [];

  // SECTION: Mutations for editing a text cell
  const editTextCell = useEditTextCell(tableId);

  // SECTION: Mutations for editing a text cell
  const editIntCell = useEditIntCell(tableId);

  // SECTION: Mutations for adding a new row
  const addRow = useAddRow({ tableId, columns, rowCount });

  // SECTION: Mutations for adding a new text column
  const addTextColumn = useAddTextColumn(tableId);

  // Column definitions
  const columnDef: ColumnDef<RowWithCells, string | number>[] = columns.map(
    (col) => ({
      id: col.id,
      name: col.name,
      filterFn:
        col.type === "NUMBER"
          ? (row, columnId, filterValue) => {
              const cell = row
                .getAllCells()
                .find((cell) => cell.column.id === columnId);

              if (cell && typeof cell.getValue() === "number") {
                const { mode, value } = filterValue as IntFilter;

                if (value === null) {
                  return true;
                }

                if (mode == "gt") {
                  return value < (cell.getValue() as number);
                }

                if (mode == "lt") {
                  return value > (cell.getValue() as number);
                }

                return true;
              }

              return false;
            }
          : (row, columnId, filterValue) => {
              const cell = row
                .getAllCells()
                .find((cell) => cell.column.id === columnId);

              if (cell) {
                return filterValue
                  ? cell.getValue() === ""
                  : cell.getValue() !== "";
              }

              return false;
            },

      accessorFn: (row: RowWithCells) => {
        const cell = row.cells.find((cell) => cell.columnId === col.id);

        if (col.type === "NUMBER") {
          return cell?.intValue ?? 0;
        }

        return cell?.textValue ?? "";
      },

      header: ({ column }) => (
        <BaseTableHeader
          column={column}
          name={col.name}
          isNumber={col.type === "NUMBER"}
        />
      ),

      cell: (props) => (
        <BaseTableCell {...props} query={query} isSearching={isSearching} />
      ),
    }),
  );

  // Actual table hook
  const table = useReactTable({
    data: rows,
    columns: columnDef,
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",

    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),

    state: {
      sorting,
      columnFilters,
    },

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
    estimateSize: () => 32,
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== "undefined" && !navigator.userAgent.includes("Firefox")
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <div
      ref={tableContainerRef}
      className="h-screen w-screen overflow-auto"
      style={{ fontSize: "13px" }}
    >
      <BaseContainerHeader
        isSearching={isSearching}
        setIsSearching={setIsSearching}
        query={query}
        setQuery={setQuery}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        columns={columns}
      />

      {/* <BaseSidebar /> */}

      <Table style={{ width: table.getTotalSize() * 2 }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="h-8 text-black">
              <TableHead className="w-4 bg-[#f5f5f5]" />
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="h-6 border border-l-0 border-t-0 bg-[#f5f5f5] pl-[1px] pt-[1px]"
                    style={{
                      width: header.getSize(),
                      borderBottom: "1px solid hsl(0, 0%, 82%)",
                      fontSize: 13,
                    }}
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
                className="w-[94px] cursor-pointer bg-[#f5f5f5] hover:bg-slate-200"
                onClick={() => addTextColumn.mutate({ tableId })}
              >
                <div className="flex items-center justify-center">
                  <PlusIcon className="h-4 w-4" />
                </div>
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
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = tableRows[virtualRow.index]!;

            return (
              <TableRow
                key={row.id}
                className="h-8"
                data-state={row.getIsSelected() && "selected"}
              >
                <TableCell className="text-center text-slate-400">
                  {virtualRow.index + 1}
                </TableCell>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell
                      key={cell.id}
                      className="h-[32px] border border-l-0 py-0"
                    >
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
            className="h-8 cursor-pointer"
          >
            <TableCell className="flex h-8 items-center justify-center border-b text-center text-slate-400">
              <PlusIcon />
            </TableCell>

            {columns.map((column, index) => (
              <TableCell
                className={cn(
                  index + 1 === columns.length ? "border-r" : "border-x-0",
                  "border-b",
                )}
                key={column.id}
              />
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

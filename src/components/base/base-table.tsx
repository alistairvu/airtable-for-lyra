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
  functionalUpdate,
} from "@tanstack/react-table";
import { type View, type Column } from "@prisma/client";
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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { BaseTableHeader } from "./base-table-header";
import { cn } from "~/lib/utils";
import { PlusIcon } from "lucide-react";
import { BaseTableActions } from "./base-table-actions";
import { useEditIntCell, useEditTextCell } from "~/hooks/use-edit-cell";
import { useAddTextColumn } from "~/hooks/use-add-column";
import { useAddRow } from "~/hooks/use-add-row";
import { BaseSidebar } from "./base-sidebar";
import { TableSidebarContext } from "~/hooks/use-table-sidebar";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useAddDummyRows } from "~/hooks/use-add-dummy-rows";
import { faker } from "@faker-js/faker";

type BaseTableProps = {
  tableId: string;
  viewId: string;
  initialColumns: Column[];
  initialSorting: SortingState;
  initialColumnFilters: ColumnFiltersState;
  initialRowCount: number;
  initialViews: View[];
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
  viewId,
  initialColumns,
  initialRowCount,
  initialSorting,
  initialColumnFilters,
  initialViews,
}: BaseTableProps) => {
  const FETCH_LIMIT = 250;
  const utils = api.useUtils();
  const queryClient = useQueryClient();

  // SECTION: Sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // SECTION: Sorting state
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  // SECTION: Filter state
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);

  // SECTION: State related to search
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");

  // Loading in data
  const rowCountQuery = api.table.countRows.useQuery(tableId, {
    initialData: { count: initialRowCount },
  });

  const { count: rowCount } = rowCountQuery.data;

  const { data: columns } = api.table.getColumns.useQuery(tableId, {
    initialData: initialColumns,
  });

  const {
    data: infiniteRowsData,
    fetchNextPage,
    isFetching,
  } = api.table.getInfiniteRows.useInfiniteQuery(
    { tableId, limit: FETCH_LIMIT, viewId },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const rows = useMemo(
    () => infiniteRowsData?.pages.flatMap((page) => page.items) ?? [],
    [infiniteRowsData],
  );
  const totalFetched = rows.length;

  // SECTION: Mutations for editing a text cell
  const editTextCell = useEditTextCell(tableId, viewId, FETCH_LIMIT);

  // SECTION: Mutations for editing a text cell
  const editIntCell = useEditIntCell(tableId, viewId, FETCH_LIMIT);

  // SECTION: Mutations for adding a new row
  const addRow = useAddRow({
    tableId,
    columns,
    rowCount,
    limit: FETCH_LIMIT,
    viewId,
  });

  // SECTION: Mutations for adding a dummy row
  const addDummyRows = useAddDummyRows({
    tableId,
    columns,
    rowCount,
    limit: FETCH_LIMIT,
    viewId,
  });

  const generateDummyRows = (count = 5000) => {
    const dummyRows = [];

    for (let i = 0; i < count; i++) {
      dummyRows.push({
        name: faker.person.fullName(),
        age: Math.floor(Math.random() * 100),
      });
    }

    return dummyRows;
  };

  // SECTION: Mutations for adding a new text column
  const addTextColumn = useAddTextColumn(tableId, viewId, FETCH_LIMIT);

  // SECTION: Mutation for editing the cell state
  const setViewSorting = api.view.setSortState.useMutation({
    onMutate: () => {
      queryClient.removeQueries({
        queryKey: getQueryKey(
          api.table.getInfiniteRows,
          { tableId, limit: FETCH_LIMIT, viewId },
          "infinite",
        ),
      });
    },

    onSettled: async () => {
      await utils.table.getInfiniteRows.invalidate({
        tableId,
        limit: FETCH_LIMIT,
        viewId,
      });
    },
  });

  // SECTION: Mutation for saving the sorting view
  const setViewColumnFilters = api.view.setColumnFilters.useMutation({
    // onMutate: () => {
    //   queryClient.removeQueries({
    //     queryKey: getQueryKey(
    //       api.table.getInfiniteRows,
    //       { tableId, limit: FETCH_LIMIT, viewId },
    //       "infinite",
    //     ),
    //   });
    // },
    // onSettled: async () => {
    //   await utils.table.getInfiniteRows.invalidate({
    //     tableId,
    //     limit: FETCH_LIMIT,
    //     viewId,
    //   });
    // },
  });

  // Column definitions
  const columnDef: ColumnDef<RowWithCells, string | number>[] = useMemo(
    () =>
      columns.map((col) => ({
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

        footer: (props) => props.column.id,

        cell: (props) => (
          <BaseTableCell {...props} query={query} isSearching={isSearching} />
        ),
      })),
    [columns, query, isSearching],
  );

  // Actual table hook
  const table = useReactTable({
    data: rows,
    columns: columnDef,
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",

    onSortingChange: (updater) => {
      const newSorting = functionalUpdate(updater, sorting);
      setSorting(updater);
      setViewSorting.mutate({
        viewId,
        sorting: newSorting,
      });
    },
    getSortedRowModel: getSortedRowModel(),

    onColumnFiltersChange: (updater) => {
      const newFilters = functionalUpdate(updater, columnFilters);
      setColumnFilters(updater);
      setViewColumnFilters.mutate({
        viewId,
        columnFilters: newFilters,
      });
    },
    getFilteredRowModel: getFilteredRowModel(),

    manualSorting: true,

    state: {
      sorting,
      columnFilters,
    },

    getRowId: (originalRow, _index, _parent) => {
      return "row:" + String(originalRow.index);
    },

    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowId: string, columnId: string, value: string | number) => {
        const matchingColumn = columns.find((col) => col.id === columnId);

        if (!matchingColumn) {
          return;
        }

        const isNumber = matchingColumn.type === "NUMBER";
        const matchingRow = rows.find((row) => row.id === rowId);

        if (!matchingRow) {
          return;
        }

        const matchingCell = matchingRow.cells.find(
          (cell) => cell.columnId === matchingColumn.id,
        );
        if (!matchingCell) {
          return;
        }

        console.log({ matchingCell });

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
    overscan: 10,
  });

  // Setting up infinite scrolling
  const fetchMoreOnBottomReached = useCallback(
    async (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 2000 &&
          !isFetching &&
          totalFetched < rowCount
        ) {
          await fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, rowCount],
  );

  useEffect(() => {
    void fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  return (
    <TableSidebarContext.Provider
      value={{ open: sidebarOpen, setIsOpen: setSidebarOpen }}
    >
      <div style={{ fontSize: "13px", marginTop: "88px" }}>
        <BaseTableActions
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          query={query}
          setQuery={setQuery}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          columns={columns}
          sorting={sorting}
          setSorting={setSorting}
        />

        <div className="flex">
          <BaseSidebar
            initialViews={initialViews}
            tableId={tableId}
            viewId={viewId}
          />

          <div
            ref={tableContainerRef}
            onScroll={(e) =>
              fetchMoreOnBottomReached(e.target as HTMLDivElement)
            }
            className="flex-grow"
            style={{
              height: "calc(100vh - 88px - 44px)",
              overflow: "auto",
              position: "relative",
            }}
          >
            <Table style={{ display: "grid" }}>
              <TableHeader
                style={{
                  display: "grid",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  width: "100%",
                }}
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="h-8 text-black"
                    style={{
                      display: "flex",
                    }}
                  >
                    <TableHead className="w-12 bg-[#f5f5f5]" />
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className="h-8 border border-l-0 border-t-0 bg-[#f5f5f5] pl-[1px] pt-[1px]"
                          style={{
                            width: header.getSize() * 1.5,
                            borderBottom: "1px solid hsl(0, 0%, 82%)",
                            fontSize: 13,
                            display: "flex",
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
                      className="h-8 w-[94px] cursor-pointer border-b border-r bg-[#f5f5f5] hover:bg-slate-200"
                      onClick={() => addTextColumn.mutate({ tableId })}
                    >
                      <div className="flex h-8 items-center justify-center">
                        <PlusIcon className="h-4 w-4" />
                      </div>
                    </TableHead>
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody
                style={{
                  display: "grid",
                  height: `${rowVirtualizer.getTotalSize() + 32 * 5}px`, //tells scrollbar how big the table is
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = tableRows[virtualRow.index]!;

                  return (
                    <TableRow
                      key={row.id}
                      data-index={virtualRow.index}
                      data-state={row.getIsSelected() && "selected"}
                      style={{
                        display: "flex",
                        position: "absolute",
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <TableCell className="w-12 text-center text-slate-400">
                        <div className="flex h-full items-center justify-center">
                          {virtualRow.index + 1}
                        </div>
                      </TableCell>
                      {row.getVisibleCells().map((cell, index) => {
                        return (
                          <TableCell
                            key={`${row.id}:cell:${index}`}
                            className="h-[32px] border border-b-0 border-l-0 border-t-0 py-0"
                            style={{
                              display: "flex",
                              width: cell.column.getSize() * 1.5,
                            }}
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

                {table.getFooterGroups().map((footerGroup, index) => (
                  <TableRow
                    key={footerGroup.id}
                    onClick={() => addRow.mutate(tableId)}
                    className="h-8 cursor-pointer"
                    style={{
                      display: "flex",
                      position: "absolute",
                      transform: `translateY(${rowVirtualizer.getTotalSize() + index * 32}px)`,
                    }}
                  >
                    <TableCell className="flex h-8 w-12 items-center justify-center border-b text-center text-slate-400">
                      <PlusIcon className="h-4 w-4" />
                    </TableCell>

                    {footerGroup.headers.map((column, index) => {
                      return (
                        <TableCell
                          key={column.id}
                          className={cn(
                            index + 1 === columns.length
                              ? "border-r"
                              : "border-x-0",
                            "border-b-0",
                          )}
                          style={{
                            display: "flex",
                            width: column.getSize() * 1.5,
                          }}
                        />
                      );
                    })}
                  </TableRow>
                ))}

                {table.getFooterGroups().map((footerGroup, index) => (
                  <TableRow
                    key={footerGroup.id}
                    onClick={() =>
                      addDummyRows.mutate({
                        tableId,
                        dummyRows: generateDummyRows(5000),
                      })
                    }
                    className="h-8 cursor-pointer border-t-0"
                    style={{
                      display: "flex",
                      position: "absolute",
                      transform: `translateY(${rowVirtualizer.getTotalSize() + (index + 1) * 32}px)`,
                    }}
                  >
                    <TableCell className="flex h-8 w-12 items-center justify-center border-b text-center text-slate-400">
                      <PlusIcon className="h-3 w-3" /> 5k
                    </TableCell>

                    {footerGroup.headers.map((column, index) => {
                      return (
                        <TableCell
                          key={column.id}
                          className={cn(
                            index + 1 === columns.length
                              ? "border-r"
                              : "border-x-0",
                            "border-b",
                            "border-t-0",
                          )}
                          style={{
                            display: "flex",
                            width: column.getSize() * 1.5,
                          }}
                        />
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div
              className={`fixed bottom-0 ${sidebarOpen ? "left-[282px]" : "left-0"} z-20 flex h-[24px] w-full items-center justify-start border-t bg-slate-100 pl-2 text-[11px]`}
            >
              <span>
                {rowCount} {rowCount !== 1 ? "rows" : "row"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </TableSidebarContext.Provider>
  );
};

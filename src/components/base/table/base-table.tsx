"use client";

import { faker } from "@faker-js/faker";
import type { Column, View } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  type RowData,
  type SortingState,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { getQueryKey } from "@trpc/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { PlusIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import type { RowWithCells } from "~/@types";
import { useAddTextColumn } from "~/hooks/use-add-column";
import { useAddDummyRows } from "~/hooks/use-add-dummy-rows";
import { useAddRow } from "~/hooks/use-add-row";
import { useColumnFilters } from "~/hooks/use-column-filters";
import { useEditIntCell, useEditTextCell } from "~/hooks/use-edit-cell";
import { useSearchQuery } from "~/hooks/use-search-query";
import { useSorting } from "~/hooks/use-sorting";
import { TableSidebarContext } from "~/hooks/use-table-sidebar";
import { cn } from "~/lib/utils";
import { columnFiltersSchema } from "~/schemas/sorting.schema";
import { api } from "~/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { BaseTableActions } from "../headers/base-table-actions";
import { BaseSidebar } from "../layout/base-sidebar";
import { getColumns } from "./base-table-columns";

type BaseTableProps = {
  tableId: string;
  viewId: string;
  initialColumns: Column[];
  initialSorting: SortingState;
  initialColumnFilters: z.infer<typeof columnFiltersSchema>;
  initialRowCount: number;
  initialViews: View[];
};

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateData?: (
      rowId: string,
      columnIndex: number,
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
  const [sorting, setSorting] = useSorting(initialSorting);

  // SECTION: Filter state
  const [columnFilters, setColumnFilters] =
    useColumnFilters(initialColumnFilters);

  // SECTION: State related to search
  const [isSearching, setIsSearching] = useState(false);
  const [query, _setQuery] = useSearchQuery();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (table.getRowModel().rows.length) {
      rowVirtualizer.scrollToIndex?.(0);
    }
  }, [debouncedQuery]);

  // Loading in data
  const rowCountQuery = api.table.countRows.useQuery(tableId, {
    initialData: { count: initialRowCount },
  });

  const { count: rowCount } = rowCountQuery.data;

  // Column definitions
  const { data: columns } = api.table.getColumns.useQuery(tableId, {
    initialData: initialColumns,
  });

  const columnDef: ColumnDef<RowWithCells, string | number>[] = useMemo(
    () => getColumns({ columns, isSearching }),
    [columns, isSearching],
  );

  // Row data
  const {
    data: infiniteRowsData,
    fetchNextPage,
    isFetching,
  } = api.table.getInfiniteRows.useInfiniteQuery(
    {
      tableId,
      limit: FETCH_LIMIT,
      sorting,
      columnFilters,
      query: debouncedQuery,
    },
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
          { tableId, limit: FETCH_LIMIT, sorting, columnFilters },
          "infinite",
        ),
      });
    },

    onSettled: async () => {
      await utils.table.getInfiniteRows.invalidate({
        tableId,
        limit: FETCH_LIMIT,
        sorting,
        columnFilters,
      });
    },
  });

  // SECTION: Mutation for saving the sorting view
  const setViewColumnFilters = api.view.setColumnFilters.useMutation({
    onMutate: () => {
      queryClient.removeQueries({
        queryKey: getQueryKey(
          api.table.getInfiniteRows,
          { tableId, limit: FETCH_LIMIT, sorting, columnFilters },
          "infinite",
        ),
      });
    },

    onSettled: async () => {
      await utils.table.getInfiniteRows.invalidate({
        tableId,
        limit: FETCH_LIMIT,
        sorting,
        columnFilters,
      });
    },
  });

  // Column definitions

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
      const rawFilters = functionalUpdate(updater, columnFilters);
      const newFilters = columnFiltersSchema.safeParse(rawFilters);

      if (newFilters.success) {
        setColumnFilters(newFilters.data);
        setViewColumnFilters.mutate({
          viewId,
          columnFilters: newFilters.data,
        });
      }
    },

    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",

    manualSorting: true,
    manualFiltering: true,

    state: {
      sorting,
      columnFilters,
    },

    getRowId: (originalRow, _index, _parent) => {
      return originalRow.id;
    },

    // Provide our updateData function to our table meta
    meta: {
      updateData: (
        rowId: string,
        columnIndex: number,
        value: string | number,
      ) => {
        const visibleColumn = table.getVisibleLeafColumns()[columnIndex];

        if (!visibleColumn) {
          return;
        }

        const matchingColumn = columns.find(
          (col) => col.id === visibleColumn.id,
        );

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

        const cellId = matchingCell.id;

        if (isNumber) {
          editIntCell.mutate({
            value: Number.parseInt(`${value}`),
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
          columns={columns}
          viewId={viewId}
          tableId={tableId}
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
              minHeight: "calc(100vh - 88px - 44px)",
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
                  minHeight: "calc(100vh - 88px - 44px - 64px)",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  // biome-ignore lint/style/noNonNullAssertion: <explanation>
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
              className={
                "sticky bottom-0 left-0 z-20 flex h-[24px] w-full items-center justify-start border-t bg-slate-100 pl-2 text-[11px]"
              }
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

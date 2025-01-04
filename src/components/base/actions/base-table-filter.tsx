import type { Column } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  functionalUpdate,
  type ColumnFilter,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { getQueryKey } from "@trpc/react-query";
import { ListFilter, Plus, Trash } from "lucide-react";
import { createContext, use, type Dispatch, type SetStateAction } from "react";
import { z } from "zod";
import type { IntFilter } from "~/@types";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useColumnFilters } from "~/hooks/use-column-filters";
import { columnFiltersSchema } from "~/schemas/sorting.schema";
import { api } from "~/trpc/react";

type BaseTableFilterProps = {
  columns: Column[];
  viewId: string;
  tableId: string;
};

// TODO: Handle saving of context

// Handles the context for the base table filter
const BaseTableFilterContext = createContext<BaseTableFilterProps | null>(null);

// Hook for the context
const useFilterContext = () => {
  return use(BaseTableFilterContext);
};

type BaseTableTextFilterProps = {
  column: Column;
  tableId: string;
};

/**
 * Renders the row related to the text filter
 *
 * @param param0
 */
const BaseTableTextFilter = ({ column, tableId }: BaseTableTextFilterProps) => {
  const filterContext = useFilterContext();
  const queryClient = useQueryClient();
  const FETCH_LIMIT = 250;
  const utils = api.useUtils();
  const [columnFilters, setColumnFilters] = useColumnFilters();

  const setViewColumnFilters = api.view.setColumnFilters.useMutation({
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

  if (filterContext === null) {
    return null;
  }

  const { columns, viewId } = filterContext;

  const matchingFilter = columnFilters.find(
    (filters) => filters.id === column.id,
  );

  if (matchingFilter === undefined) {
    return null;
  }

  /**
   * Applies a column filter update and persists it to the backend.
   *
   * @param updater - A function that takes the previous column filters state and returns the new state
   * @returns void
   *
   * This helper function:
   * 1. Updates the local state using setColumnFilters
   * 2. Persists the change to the backend by calling the mutation with the same update
   */
  const applyUpdater = (
    updater: (prev: ColumnFiltersState) => ColumnFilter[],
  ) => {
    const rawFilters = functionalUpdate(updater, columnFilters);
    const parsedFilters = columnFiltersSchema.safeParse(rawFilters);

    if (parsedFilters.success) {
      setColumnFilters(parsedFilters.data);
      setViewColumnFilters.mutate({
        viewId,
        columnFilters: parsedFilters.data,
      });
    }
  };

  const changeSortColumn = (newColumnId: string) => {
    if (newColumnId === column.id) {
      return;
    }

    const newColumn = columns.find((col) => col.id === newColumnId);

    if (newColumn === undefined) {
      return;
    }

    const updater = (prev: ColumnFiltersState) =>
      prev.map((filter) =>
        filter.id === column.id
          ? {
              id: newColumnId,
              value:
                newColumn.type === "TEXT"
                  ? false
                  : {
                      mode: "lt",
                      value: null,
                    },
            }
          : filter,
      );
    applyUpdater(updater);
  };

  const removeFilter = () => {
    const updater = (prev: ColumnFiltersState) =>
      prev.filter((x) => x.id !== column.id);
    applyUpdater(updater);
  };

  const toggleValue = (mode: string) => {
    const updater = (prev: ColumnFiltersState) =>
      prev.map((filter) =>
        filter.id === column.id
          ? {
              ...filter,
              value: mode === "empty",
            }
          : filter,
      );
    applyUpdater(updater);
  };

  return (
    <div className="flex flex-auto items-center gap-2">
      <Select value={column.id} onValueChange={changeSortColumn}>
        <SelectTrigger className="w-96">
          <SelectValue>{column.name}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {columns
            .filter(
              (col) =>
                col.id === column.id ||
                columnFilters.findIndex((filter) => filter.id === col.id) < 0,
            )
            .map((col) => (
              <SelectItem
                key={col.id}
                value={col.id}
                className="cursor-pointer"
              >
                {col.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Select
        value={matchingFilter.value ? "empty" : "not empty"}
        onValueChange={toggleValue}
      >
        <SelectTrigger className="w-96">
          <SelectValue>
            {matchingFilter.value ? "is empty" : "is not empty"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="empty">is empty</SelectItem>
          <SelectItem value="not empty">is not empty</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" onClick={removeFilter}>
        <Trash />
      </Button>
    </div>
  );
};

type BaseTableIntFilterProps = {
  column: Column;
  tableId: string;
};

/**
 * Renders the row related to integer filters
 *
 * @param param0
 */
const BaseTableIntFilter = ({ column, tableId }: BaseTableIntFilterProps) => {
  const filterContext = useFilterContext();
  const queryClient = useQueryClient();
  const FETCH_LIMIT = 250;
  const utils = api.useUtils();
  const [columnFilters, setColumnFilters] = useColumnFilters();

  const setViewColumnFilters = api.view.setColumnFilters.useMutation({
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

  if (filterContext === null) {
    return null;
  }

  const { columns, viewId } = filterContext;

  const matchingFilter = columnFilters.find(
    (filters) => filters.id === column.id,
  );

  if (matchingFilter === undefined) {
    return null;
  }

  const filterValue = matchingFilter.value as IntFilter;

  /**
   * Applies a column filter update and persists it to the backend.
   *
   * @param updater - A function that takes the previous column filters state and returns the new state
   * @returns void
   *
   * This helper function:
   * 1. Updates the local state using setColumnFilters
   * 2. Persists the change to the backend by calling the mutation with the same update
   */
  const applyUpdater = (
    updater: (prev: ColumnFiltersState) => ColumnFilter[],
  ) => {
    const rawFilters = functionalUpdate(updater, columnFilters);
    const parsedFilters = columnFiltersSchema.safeParse(rawFilters);

    if (parsedFilters.success) {
      setColumnFilters(parsedFilters.data);
      setViewColumnFilters.mutate({
        viewId,
        columnFilters: parsedFilters.data,
      });
    }
  };

  /**
   * Changes the column being filtered when a new column is selected in the dropdown.
   *
   * @param newColumnId - The ID of the newly selected column
   * @returns void
   *
   * This function:
   * 1. Checks if the new column is different from the current one
   * 2. Finds the new column's details from the columns array
   * 3. Updates the filter state by mapping through existing filters and:
   *    - For the matching filter, changes its ID and resets its value based on column type
   *    - For TEXT columns, sets value to false
   *    - For NUMBER columns, sets value to { mode: "lt", value: null }
   * 4. Persists the change using the applyUpdater helper
   */
  const changeSortColumn = (newColumnId: string) => {
    if (newColumnId === column.id) {
      return;
    }

    const newColumn = columns.find((col) => col.id === newColumnId);

    if (newColumn === undefined) {
      return;
    }

    const updater = (prev: ColumnFiltersState) =>
      prev.map((filter) =>
        filter.id === column.id
          ? {
              id: newColumnId,
              value:
                newColumn.type === "TEXT"
                  ? false
                  : {
                      mode: "lt",
                      value: null,
                    },
            }
          : filter,
      );
    applyUpdater(updater);
  };

  const removeFilter = () => {
    const updater = (prev: ColumnFiltersState) =>
      prev.filter((x) => x.id !== column.id);
    applyUpdater(updater);
  };

  const toggleValue = (mode: "lt" | "gt") => {
    const updater = (prev: ColumnFiltersState) =>
      prev.map((filter) =>
        filter.id === column.id
          ? {
              ...filter,
              value: {
                ...(filter.value as IntFilter),
                mode,
              },
            }
          : filter,
      );

    applyUpdater(updater);
  };

  const setValue = (value: number | null) => {
    const updater = (prev: ColumnFiltersState) =>
      prev.map((filter) =>
        filter.id === column.id
          ? {
              ...filter,
              value: {
                ...(filter.value as IntFilter),
                value,
              },
            }
          : filter,
      );
    applyUpdater(updater);
  };

  return (
    <div className="flex flex-auto items-center gap-2">
      <Select value={column.id} onValueChange={changeSortColumn}>
        <SelectTrigger className="w-96">
          <SelectValue>{column.name}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {columns
            .filter(
              (col) =>
                col.id === column.id ||
                columnFilters.findIndex((filter) => filter.id === col.id) < 0,
            )
            .map((col) => (
              <SelectItem
                key={col.id}
                value={col.id}
                className="cursor-pointer"
              >
                {col.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Select value={filterValue.mode} onValueChange={toggleValue}>
        <SelectTrigger className="w-96">
          <SelectValue>
            {filterValue.mode === "lt" ? "less than" : "greater than"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lt" className="cursor-pointer">
            less than
          </SelectItem>
          <SelectItem value="gt" className="cursor-pointer">
            greater than
          </SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="number"
        value={filterValue.value ?? ""}
        onChange={(e) =>
          setValue(
            Number.isNaN(e.target.valueAsNumber)
              ? null
              : e.target.valueAsNumber,
          )
        }
      />

      <Button variant="ghost" size="icon" onClick={removeFilter}>
        <Trash />
      </Button>
    </div>
  );
};

/**
 * A component that provides filtering functionality for a table.
 * It renders a popover with filter conditions that can be added, modified, or removed.
 *
 * @component
 * @param {Object} props
 * @param {ColumnFiltersState} props.columnFilters - Current state of column filters
 * @param {Dispatch<SetStateAction<ColumnFiltersState>>} props.setColumnFilters - Function to update column filters
 * @param {Column[]} props.columns - Array of available columns that can be filtered
 *
 * @returns A button that opens a popover containing filter options for the table columns.
 * Supports TEXT and NUMBER type columns with different filtering operations for each type.
 * Users can add new conditions if there are unused columns available.
 */
export const BaseTableFilter = ({
  columns,
  viewId,
  tableId,
}: BaseTableFilterProps) => {
  const [columnFilters, setColumnFilters] = useColumnFilters();
  // Handle filter saving mutation
  const setViewColumnFilters = api.view.setColumnFilters.useMutation();

  const addCondition = () => {
    const addedColumns = new Set(columnFilters.map((filter) => filter.id));
    const conditionColumn = columns.find((col) => !addedColumns.has(col.id));
    if (conditionColumn === undefined) {
      return;
    }

    const calculateColumnFilters = (
      prev: z.infer<typeof columnFiltersSchema>,
    ) => {
      return [
        ...prev,
        {
          id: conditionColumn.id,
          value:
            conditionColumn.type === "TEXT"
              ? false
              : {
                  mode: "lt" as const,
                  value: null,
                },
        },
      ];
    };

    setColumnFilters(calculateColumnFilters);
    setViewColumnFilters.mutate({
      viewId,
      columnFilters: calculateColumnFilters(columnFilters),
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 py-1">
          <ListFilter />
          <span className="hidden md:block">Filter</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px]">
        <pre>{JSON.stringify(columnFilters, null, 2)}</pre>

        <BaseTableFilterContext.Provider value={{ columns, viewId, tableId }}>
          <div className="flex flex-col gap-2">
            {columnFilters.map((filter) => {
              const column = columns.find((col) => col.id === filter.id);

              if (column?.type === "TEXT") {
                return (
                  <BaseTableTextFilter
                    tableId={tableId}
                    key={filter.id}
                    column={column}
                  />
                );
              }

              if (column?.type === "NUMBER") {
                return (
                  <BaseTableIntFilter
                    tableId={tableId}
                    key={filter.id}
                    column={column}
                  />
                );
              }

              return null;
            })}
          </div>

          <div className="mt-2">
            <Button
              variant="ghost"
              className="px-2 py-1 text-blue-600"
              size="sm"
              disabled={columnFilters.length === columns.length}
              onClick={addCondition}
            >
              <Plus className="h-2 w-2" /> Add condition
            </Button>
          </div>
        </BaseTableFilterContext.Provider>
      </PopoverContent>
    </Popover>
  );
};

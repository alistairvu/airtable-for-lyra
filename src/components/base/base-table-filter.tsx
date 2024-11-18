import { ListFilter, Plus, Trash } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { type ColumnFiltersState } from "@tanstack/react-table";
import { createContext, type Dispatch, type SetStateAction, use } from "react";
import { type Column } from "@prisma/client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { type IntFilter } from "~/@types";
import { Input } from "../ui/input";

type BaseTableFilterProps = {
  columnFilters: ColumnFiltersState;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;

  columns: Column[];
};

// Handles the context for the base table filter
const BaseTableFilterContext = createContext<BaseTableFilterProps | null>(null);

// Hook for the context
const useFilterContext = () => {
  return use(BaseTableFilterContext);
};

type BaseTableTextFilterProps = {
  column: Column;
};

/**
 * Renders the row related to the text filter
 *
 * @param param0
 */
const BaseTableTextFilter = ({ column }: BaseTableTextFilterProps) => {
  const filterContext = useFilterContext();

  if (filterContext === null) {
    return null;
  }

  const { columnFilters, setColumnFilters, columns } = filterContext;

  const matchingFilter = columnFilters.find(
    (filters) => filters.id === column.id,
  );

  if (matchingFilter === undefined) {
    return null;
  }

  const changeSortColumn = (newColumnId: string) => {
    if (newColumnId === column.id) {
      return;
    }

    const newColumn = columns.find((col) => col.id === newColumnId);

    if (newColumn === undefined) {
      return;
    }

    setColumnFilters((prev) =>
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
      ),
    );
  };

  const removeFilter = () => {
    setColumnFilters((prev) => prev.filter((x) => x.id !== column.id));
  };

  const toggleValue = (mode: string) => {
    setColumnFilters((prev) =>
      prev.map((filter) =>
        filter.id === column.id
          ? {
              ...filter,
              value: mode === "empty",
            }
          : filter,
      ),
    );
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
};

/**
 * Renders the row related to integer filters
 *
 * @param param0
 */
const BaseTableIntFilter = ({ column }: BaseTableIntFilterProps) => {
  const filterContext = useFilterContext();

  if (filterContext === null) {
    return null;
  }

  const { columnFilters, setColumnFilters, columns } = filterContext;

  const matchingFilter = columnFilters.find(
    (filters) => filters.id === column.id,
  );

  if (matchingFilter === undefined) {
    return null;
  }

  const filterValue = matchingFilter.value as IntFilter;

  const changeSortColumn = (newColumnId: string) => {
    if (newColumnId === column.id) {
      return;
    }

    const newColumn = columns.find((col) => col.id === newColumnId);

    if (newColumn === undefined) {
      return;
    }

    setColumnFilters((prev) =>
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
      ),
    );
  };

  const removeFilter = () => {
    setColumnFilters((prev) => prev.filter((x) => x.id !== column.id));
  };

  const toggleValue = (mode: "lt" | "gt") => {
    setColumnFilters((prev) =>
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
      ),
    );
  };

  const setValue = (value: number | null) => {
    setColumnFilters((prev) =>
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
      ),
    );
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
            isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber,
          )
        }
      />

      <Button variant="ghost" size="icon" onClick={removeFilter}>
        <Trash />
      </Button>
    </div>
  );
};

export const BaseTableFilter = ({
  columnFilters,
  setColumnFilters,
  columns,
}: BaseTableFilterProps) => {
  const addCondition = () => {
    const addedColumns = new Set(columnFilters.map((filter) => filter.id));
    const conditionColumn = columns.find((col) => !addedColumns.has(col.id));
    if (conditionColumn === undefined) {
      return;
    }

    setColumnFilters((prev) => [
      ...prev,
      {
        id: conditionColumn.id,
        value:
          conditionColumn.type === "TEXT"
            ? false
            : {
                mode: "lt",
                value: null,
              },
      },
    ]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 py-1">
          <ListFilter />
          <span className="hidden lg:block">Filter</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px]">
        <BaseTableFilterContext.Provider
          value={{ columnFilters, setColumnFilters, columns }}
        >
          <div className="flex flex-col gap-2">
            {columnFilters.map((filter) => {
              const column = columns.find((col) => col.id === filter.id);

              if (column?.type === "TEXT") {
                return <BaseTableTextFilter key={filter.id} column={column} />;
              }

              if (column?.type === "NUMBER") {
                return <BaseTableIntFilter key={filter.id} column={column} />;
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

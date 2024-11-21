import { memo, useCallback, useEffect, useState } from "react";
import { TableInput } from "../ui/table-input";
import {
  type SortDirection,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { type RowWithCells } from "~/@types";
import { cn } from "~/lib/utils";

type BaseTableCellProps = {
  query: string;
  isSearching?: boolean;
  isNumber?: boolean;
  table: TanstackTable<RowWithCells>;
  initialValue: string | number | undefined;
  isSorted: false | SortDirection;
  rowId: string;
  columnIndex: number;

  disabled?: boolean;
};

export const BaseTableCell = memo(function BaseTableCell({
  initialValue,
  rowId,
  columnIndex,
  table,
  query,
  isNumber,
  isSorted,
  disabled,
}: BaseTableCellProps) {
  const [value, setValue] = useState(initialValue ?? "");

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const handleBlur = useCallback(() => {
    if (typeof value === "number") {
      if (!isNaN(value) && value !== initialValue) {
        table.options.meta?.updateData?.(rowId, columnIndex, value);
      }
    } else {
      if (value !== initialValue) {
        table.options.meta?.updateData?.(rowId, columnIndex, value);
      }
    }
  }, [value, initialValue, columnIndex, rowId, table.options.meta]);

  const matchesQuery = () => {
    if (query === "") {
      return false;
    }

    const searchRegex = new RegExp(`${query}`, "ig");

    return searchRegex.test(String(value));
  };

  return (
    <TableInput
      className={cn(
        "my-0 truncate rounded-none border-none px-2 shadow-none",
        (isSorted || matchesQuery()) && "bg-[#f4e9e4]",
      )}
      value={typeof value === "string" ? value : isNaN(value) ? "" : value}
      onChange={(e) =>
        isNumber ? setValue(e.target.valueAsNumber) : setValue(e.target.value)
      }
      onBlur={handleBlur}
      type={isNumber ? "number" : "text"}
      disabled={disabled}
    />
  );
});

import type {
  SortDirection,
  Table as TanstackTable,
} from "@tanstack/react-table";
import { useDebounce } from "@uidotdev/usehooks";
import { memo, useCallback, useEffect, useState } from "react";
import type { RowWithCells } from "~/@types";
import { useSearchQuery } from "~/hooks/use-search-query";
import { cn } from "~/lib/utils";
import { TableInput } from "../../ui/table-input";

type BaseTableCellProps = {
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
  isNumber,
  isSorted,
  disabled,
}: BaseTableCellProps) {
  const [value, setValue] = useState(initialValue ?? "");
  const [query] = useSearchQuery();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const handleBlur = useCallback(() => {
    if (typeof value === "number") {
      if (!Number.isNaN(value) && value !== initialValue) {
        table.options.meta?.updateData?.(rowId, columnIndex, value);
      }
    } else {
      if (value !== initialValue) {
        table.options.meta?.updateData?.(rowId, columnIndex, value);
      }
    }
  }, [value, initialValue, columnIndex, rowId, table.options.meta]);

  const matchesQuery = () => {
    if (debouncedQuery === "") {
      return false;
    }

    const searchRegex = new RegExp(`${debouncedQuery}`, "ig");

    return searchRegex.test(String(value));
  };

  return (
    <TableInput
      className={cn(
        "my-0 truncate rounded-none border-none px-2 shadow-none",
        (isSorted || matchesQuery()) && "bg-[#f4e9e4]",
      )}
      value={
        typeof value === "string" ? value : Number.isNaN(value) ? "" : value
      }
      onChange={(e) =>
        isNumber ? setValue(e.target.valueAsNumber) : setValue(e.target.value)
      }
      onBlur={handleBlur}
      type={isNumber ? "number" : "text"}
      disabled={disabled}
    />
  );
});

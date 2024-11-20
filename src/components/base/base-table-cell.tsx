import { memo, useEffect, useState } from "react";
import { TableInput } from "../ui/table-input";
import {
  type Getter,
  type SortDirection,
  type Row as TanstackRow,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { type RowWithCells } from "~/@types";
import { cn } from "~/lib/utils";

type BaseTableCellProps = {
  query: string;
  isSearching?: boolean;
  isNumber?: boolean;
  table: TanstackTable<RowWithCells>;
  getValue: Getter<string | number>;
  isSorted: false | SortDirection;
  row: TanstackRow<RowWithCells>;
  columnIndex: number;
};

export const BaseTableCell = memo(function BaseTableCell({
  getValue,
  row,
  columnIndex,
  table,
  query,
  isSearching,
  isNumber,
  isSorted,
}: BaseTableCellProps) {
  const initialValue = getValue();

  const [value, setValue] = useState(initialValue ?? "");

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    if (typeof initialValue === "number" && typeof value === "number") {
      if (!isNaN(value) && value !== initialValue) {
        table.options.meta?.updateData?.(row.original.id, columnIndex, value);
      }
    } else {
      if (value !== initialValue) {
        table.options.meta?.updateData?.(row.original.id, columnIndex, value);
      }
    }
  };

  const matchesQuery = () => {
    if (!isSearching) {
      return false;
    }

    if (query === "") {
      return false;
    }

    return String(value).includes(query);
  };

  return (
    <TableInput
      className={cn(
        "my-0 truncate rounded-none border-none px-2 shadow-none",
        (isSorted ?? matchesQuery()) && "bg-[#f4e9e4]",
      )}
      value={typeof value === "string" ? value : isNaN(value) ? "" : value}
      onChange={(e) =>
        isNumber ? setValue(e.target.valueAsNumber) : setValue(e.target.value)
      }
      onBlur={handleBlur}
      type={isNumber ? "number" : "text"}
    />
  );
});

BaseTableCell.whyDidYouRender = true;

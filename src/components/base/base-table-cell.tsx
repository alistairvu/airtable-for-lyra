import { useEffect, useState } from "react";
import { TableInput } from "../ui/table-input";
import { type CellContext } from "@tanstack/react-table";
import { type RowWithCells } from "~/@types";
import { cn } from "~/lib/utils";

type BaseTableCellProps = CellContext<RowWithCells, string | number> & {
  query: string;
  isSearching?: boolean;
};

export const BaseTableCell = ({
  getValue,
  row,
  column,
  table,
  query,
  isSearching,
}: BaseTableCellProps) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue ?? "");

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    if (typeof initialValue === "number" && typeof value === "number") {
      if (!isNaN(value) && value !== initialValue) {
        console.log(`editing cell ${row.id}`);
        table.options.meta?.updateData?.(row.id, column.id, value);
      }
    } else {
      if (value !== initialValue) {
        console.log(`editing cell ${row.id}`);
        table.options.meta?.updateData?.(row.id, column.id, value);
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
        "my-0 rounded-none border-none px-2 shadow-none",
        (column.getIsSorted() || matchesQuery()) && "bg-[#f4e9e4]",
      )}
      value={typeof value === "string" ? value : isNaN(value) ? "" : value}
      onChange={(e) =>
        table.options.meta?.isNumber?.(column.id)
          ? setValue(e.target.valueAsNumber)
          : setValue(e.target.value)
      }
      onBlur={handleBlur}
      type={table.options.meta?.isNumber?.(column.id) ? "number" : "text"}
    />
  );
};

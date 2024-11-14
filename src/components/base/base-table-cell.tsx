import { useRef, useState } from "react";
import { TableInput } from "../ui/table-input";
import { type CellContext } from "@tanstack/react-table";
import { type RowWithCells } from "~/@types";

type BaseTableCellProps = CellContext<RowWithCells, string | number>;

export const BaseTableCell = ({
  getValue,
  row,
  column,
  table,
}: BaseTableCellProps) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <TableInput
      ref={inputRef}
      className="my-0 rounded-none border-hidden px-2 py-2 shadow-none"
      value={value}
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

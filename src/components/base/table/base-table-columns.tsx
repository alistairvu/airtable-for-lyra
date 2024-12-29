import type { ColumnDef } from "@tanstack/react-table";
import type { ColumnWithDisabled, IntFilter, RowWithCells } from "~/@types";
import { BaseTableCell } from "./base-table-cell";
import { BaseTableColumnHeader } from "./base-table-column-header";

type GetColumnsParams = {
  columns: ColumnWithDisabled[];
  query: string;
  isSearching: boolean;
};

export const getColumns = ({
  columns,
  query,
  isSearching,
}: GetColumnsParams): ColumnDef<RowWithCells, string | number>[] => {
  return columns.map((col) => ({
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

              if (mode === "gt") {
                return value < (cell.getValue() as number);
              }

              if (mode === "lt") {
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
      <BaseTableColumnHeader
        column={column}
        name={col.name}
        isNumber={col.type === "NUMBER"}
      />
    ),

    footer: (props) => props.column.id,

    cell: (props) => {
      const isSorted = props.column.getIsSorted();
      const columnIndex = props.column.getIndex();
      const initialValue = props.getValue();

      return (
        <BaseTableCell
          table={props.table}
          rowId={props.row.original.id}
          initialValue={initialValue}
          isSorted={isSorted}
          columnIndex={columnIndex}
          query={query}
          isSearching={isSearching}
          isNumber={col.type === "NUMBER"}
          disabled={col.disabled}
        />
      );
    },
  }));
};

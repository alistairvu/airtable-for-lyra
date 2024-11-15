import { type Column } from "@tanstack/react-table";
import { type RowWithCells } from "~/@types";
import { TableHead } from "../ui/table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";

type BaseTableHeaderProps = {
  column: Column<RowWithCells, string | number>;
  name: string;
};

export const BaseTableHeader = ({ column, name }: BaseTableHeaderProps) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {name}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

import { type Column } from "@tanstack/react-table";
import { type RowWithCells } from "~/@types";
import { Button } from "../ui/button";
import {
  ArrowDown01,
  ArrowDown10,
  ArrowDownAZ,
  ArrowDownZA,
  ChevronDown,
  PencilIcon,
} from "lucide-react";
import { NumberColumnIcon } from "../icons/number-column-icon";
import { TextColumnIcon } from "../icons/text-column-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type BaseTableHeaderProps = {
  column: Column<RowWithCells, string | number>;
  name: string;
  isNumber?: boolean;
};

export const BaseTableHeader = ({
  column,
  name,
  isNumber,
}: BaseTableHeaderProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-[30px] w-full items-center justify-between text-black"
          style={{
            fontSize: "13px",
            color: "#333333",
          }}
          // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <div className="flex items-center justify-center gap-2">
            {isNumber ? (
              <NumberColumnIcon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <TextColumnIcon className="h-4 w-4 text-muted-foreground" />
            )}
            {name}
          </div>

          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem>
          <PencilIcon />
          Edit
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => column.toggleSorting(false)}
        >
          {isNumber ? <ArrowDown01 /> : <ArrowDownAZ />}
          {isNumber ? "Sort Increasing" : "Sort A → Z"}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => column.toggleSorting(true)}
        >
          {isNumber ? <ArrowDown10 /> : <ArrowDownZA />}
          {isNumber ? "Sort Decreasing" : "Sort Z → A"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

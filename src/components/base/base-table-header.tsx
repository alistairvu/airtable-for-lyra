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
  X,
} from "lucide-react";
import { NumberColumnIcon } from "../icons/number-column-icon";
import { TextColumnIcon } from "../icons/text-column-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "~/lib/utils";

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
          className={cn(
            "flex h-[30px] w-full items-center justify-between text-black",
            column.getIsSorted() && "bg-[#fef3ee]",
          )}
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

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => column.clearSorting()}
        >
          <X /> Remove Sort
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) =>
            column.setFilterValue(
              isNumber
                ? {
                    mode: "gt",
                    value: 0,
                  }
                : true,
            )
          }
        >
          {isNumber ? "Filter > 0" : "Filter Empty"}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) =>
            column.setFilterValue(isNumber ? { mode: "lt", value: 0 } : false)
          }
        >
          {isNumber ? "Filter < 0" : "Filter Not Empty"}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => column.setFilterValue(undefined)}
        >
          Clear Filter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

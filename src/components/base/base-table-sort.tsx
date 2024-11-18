import { type Column } from "@prisma/client";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { type SortingState } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { Button } from "../ui/button";

type BaseTableSortProps = {
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  columns: Column[];
};

export const BaseTableSort = ({
  sorting,
  setSorting,
  columns,
}: BaseTableSortProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 py-1">
          <ArrowUpDown /> <span className="hidden md:block">Sort</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px] bg-white">
        <pre>{JSON.stringify(sorting, null, 2)}</pre>
      </PopoverContent>
    </Popover>
  );
};

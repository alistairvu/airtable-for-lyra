import { type Column } from "@prisma/client";
import { ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useSorting } from "~/hooks/use-sorting";

type BaseTableSortProps = {
  columns: Column[];
};

export const BaseTableSort = ({ columns }: BaseTableSortProps) => {
  const [sorting, _setSorting] = useSorting();

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

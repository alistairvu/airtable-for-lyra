import { Filter } from "lucide-react";
import { Popover, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

export const BaseTableFilter = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <Filter />
          Filter
        </Button>
      </PopoverTrigger>
    </Popover>
  );
};

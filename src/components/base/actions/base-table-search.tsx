import { Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";
import { type Dispatch, type SetStateAction } from "react";

type BaseTableSearchProps = {
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;

  query: string;
  handleEditQuery: (query: string) => void;
};

export const BaseTableSearch = ({
  isSearching,
  setIsSearching,
  query,
  handleEditQuery,
}: BaseTableSearchProps) => {
  return (
    <Popover
      open={isSearching}
      onOpenChange={(open) => {
        setIsSearching(open);
        handleEditQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Search Table">
          <Search />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <Input
          type="text"
          placeholder="Find in view"
          value={query}
          onChange={(e) => handleEditQuery(e.target.value)}
        />
      </PopoverContent>
    </Popover>
  );
};

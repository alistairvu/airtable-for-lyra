import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { type Dispatch, type SetStateAction } from "react";

type BaseTableSearchProps = {
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;

  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
};

export const BaseTableSearch = ({
  isSearching,
  setIsSearching,
  query,
  setQuery,
}: BaseTableSearchProps) => {
  return (
    <Popover open={isSearching} onOpenChange={(open) => setIsSearching(open)}>
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
          onChange={(e) => setQuery(e.target.value)}
        />
      </PopoverContent>
    </Popover>
  );
};

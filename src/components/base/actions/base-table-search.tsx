import { Search } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useSearchQuery } from "~/hooks/use-search-query";

type BaseTableSearchProps = {
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
};

export const BaseTableSearch = ({
  isSearching,
  setIsSearching,
}: BaseTableSearchProps) => {
  const [query, setQuery] = useSearchQuery();

  return (
    <Popover
      open={isSearching}
      onOpenChange={(open) => {
        setIsSearching(open);
        setQuery("");
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
          onChange={(e) => setQuery(e.target.value)}
        />
      </PopoverContent>
    </Popover>
  );
};

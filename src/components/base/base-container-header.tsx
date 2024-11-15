import { type Dispatch, type SetStateAction } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { BaseTableFilter } from "./base-table-filter";
import { BaseTableSearch } from "./base-table-search";

type BaseContainerHeaderProps = {
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
};

export const BaseContainerHeader = (props: BaseContainerHeaderProps) => {
  const { isSearching, setIsSearching, query, setQuery } = props;

  return (
    <div
      className="relative left-0 right-2 top-0 z-[7] flex h-[44px] items-center justify-between whitespace-nowrap px-1 font-normal"
      style={{ boxShadow: "rgba(200, 200, 200) 0 1px 0 0" }}
    >
      <div className="flex items-center justify-center">
        {/* <SidebarTrigger /> */}

        <BaseTableFilter />
      </div>

      <div className="">
        <BaseTableSearch
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          query={query}
          setQuery={setQuery}
        />
      </div>
    </div>
  );
};

import { type Dispatch, type SetStateAction } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { BaseTableFilter } from "./base-table-filter";
import { BaseTableSearch } from "./base-table-search";
import { ColumnFiltersState } from "@tanstack/react-table";
import { Column } from "@prisma/client";

type BaseContainerHeaderProps = {
  columns: Column[];

  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;

  columnFilters: ColumnFiltersState;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
};

export const BaseContainerHeader = (props: BaseContainerHeaderProps) => {
  const { isSearching, setIsSearching, query, setQuery } = props;
  const { columns, columnFilters, setColumnFilters } = props;

  return (
    <div
      className="relative left-0 right-2 top-0 z-[7] flex h-[44px] items-center justify-between whitespace-nowrap px-1 font-normal"
      style={{ boxShadow: "rgba(200, 200, 200) 0 1px 0 0" }}
    >
      <div className="flex items-center justify-center">
        {/* <SidebarTrigger /> */}

        <BaseTableFilter
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          columns={columns}
        />
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

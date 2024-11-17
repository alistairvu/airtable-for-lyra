import { type Dispatch, type SetStateAction } from "react";
import { BaseTableFilter } from "./base-table-filter";
import { BaseTableSearch } from "./base-table-search";
import { type ColumnFiltersState } from "@tanstack/react-table";
import { type Column } from "@prisma/client";
import { Button } from "../ui/button";
import {
  ArrowUpDown,
  ChevronDown,
  ExternalLink,
  EyeOff,
  Menu,
  PaintBucket,
} from "lucide-react";
import { GridFeatureIcon } from "../icons/grid-feature-icon";
import { GroupIcon } from "../icons/group-icon";
import { RowHeightIcon } from "../icons/row-height-icon";
import { Separator } from "../ui/separator";

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
      <div className="flex items-center justify-center gap-1 overflow-auto">
        {/* <SidebarTrigger /> */}
        <Button variant="ghost" size="sm" className="px-2 py-1">
          <Menu /> Views
        </Button>

        <Separator
          className="ml-1 mr-3 h-[16px] bg-gray-800"
          orientation="vertical"
        />

        <Button variant="ghost" size="sm" className="px-2 py-1">
          <GridFeatureIcon className="fill-blue-600" /> Grid view{" "}
          <ChevronDown className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" className="px-2 py-1">
          <EyeOff /> Hide fields
        </Button>

        <BaseTableFilter
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          columns={columns}
        />

        <Button variant="ghost" size="sm" className="px-2 py-1">
          <GroupIcon /> Group
        </Button>

        <Button variant="ghost" size="sm" className="px-2 py-1">
          <ArrowUpDown /> Sort
        </Button>

        <Button variant="ghost" size="sm" className="px-2 py-1">
          <PaintBucket /> Color
        </Button>

        <Button variant="ghost" size="icon" className="px-2 py-1">
          <RowHeightIcon />
        </Button>

        <Button variant="ghost" size="sm" className="px-2 py-1">
          <ExternalLink /> Share and sync
        </Button>
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

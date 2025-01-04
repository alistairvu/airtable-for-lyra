"use client";

import type { Column } from "@prisma/client";
import {
  ChevronDown,
  ExternalLink,
  EyeOff,
  Menu,
  PaintBucket,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useTableSidebar } from "~/hooks/use-table-sidebar";
import { GridFeatureIcon } from "../../icons/grid-feature-icon";
import { GroupIcon } from "../../icons/group-icon";
import { RowHeightIcon } from "../../icons/row-height-icon";
import { UsersThreeIcon } from "../../icons/users-three-icon";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { BaseTableFilter } from "../actions/base-table-filter";
import { BaseTableSearch } from "../actions/base-table-search";
import { BaseTableSort } from "../actions/base-table-sort";

type BaseTableActionsProps = {
  columns: Column[];
  viewId: string;
  tableId: string;

  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
};

export const BaseTableActions = (props: BaseTableActionsProps) => {
  const { isSearching, setIsSearching } = props;
  const { columns } = props;
  const { viewId, tableId } = props;

  const { setIsOpen } = useTableSidebar();

  return (
    <div
      className="sticky left-0 right-2 top-0 z-[7] flex h-[44px] items-center justify-between whitespace-nowrap px-1 font-normal"
      style={{ boxShadow: "rgba(200, 200, 200) 0 1px 0 0" }}
    >
      <div className="flex items-center justify-center gap-1 overflow-auto">
        <Button
          variant="ghost"
          size="sm"
          className="px-2 py-1"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Menu /> Views
        </Button>

        <Separator
          className="ml-1 mr-3 h-[16px] bg-gray-800"
          orientation="vertical"
        />

        <Button variant="ghost" size="sm" className="px-2 py-1">
          <GridFeatureIcon className="fill-blue-600" /> Grid view{" "}
          <UsersThreeIcon className="h-4 w-4" />
          <ChevronDown className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" className="px-2 py-1">
          <EyeOff /> <span className="hidden md:block">Hide fields</span>
        </Button>

        <BaseTableFilter columns={columns} viewId={viewId} tableId={tableId} />

        <Button variant="ghost" size="sm" className="px-2 py-1">
          <GroupIcon /> <span className="hidden md:block">Group</span>
        </Button>

        <BaseTableSort columns={columns} />

        <Button variant="ghost" size="sm" className="px-2 py-1">
          <PaintBucket /> <span className="hidden md:block">Color</span>
        </Button>

        <Button variant="ghost" size="icon" className="px-2 py-1">
          <RowHeightIcon />
        </Button>

        <Button variant="ghost" size="sm" className="px-2 py-1">
          <ExternalLink />{" "}
          <span className="hidden md:block">Share and sync</span>
        </Button>
      </div>

      <div className="">
        <BaseTableSearch
          isSearching={isSearching}
          setIsSearching={setIsSearching}
        />
      </div>
    </div>
  );
};

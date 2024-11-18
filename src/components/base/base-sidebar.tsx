"use client";

import {
  Calendar,
  ChartNoAxesGantt,
  Check,
  ChevronDown,
  ChevronUp,
  Kanban,
  LayoutGrid,
  ListChecks,
  PlusIcon,
  Search,
} from "lucide-react";
import { useTableSidebar } from "~/hooks/use-table-sidebar";
import { GridFeatureIcon } from "../icons/grid-feature-icon";
import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { GanttIcon } from "../icons/gantt-icon";
import { Separator } from "../ui/separator";
import { FormIcon } from "../icons/form-icon";

export const BaseSidebar = () => {
  const { open } = useTableSidebar();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div
      className={`${open ? "block" : "hidden"} flex flex-col border-r`}
      style={{
        height: "calc(100vh - 88px - 45px)",
        width: 282,
      }}
    >
      <div className="flex w-full grow flex-col px-3 pb-3 pt-2">
        {/** Search bar */}
        <div className="flex w-full items-center border-b">
          <div className="flex items-center justify-center p-2 pl-[10px]">
            <Search className="h-4 w-4" />
          </div>

          <input
            type="text"
            className="m-0 grow border-none p-0 pr-2"
            placeholder="Find a view"
          />
        </div>

        {/** Views */}
        <div className="flex grow flex-col gap-1 overflow-y-scroll pb-3 pt-2">
          <div className="flex cursor-pointer items-center justify-between rounded-md bg-blue-100 px-2 pb-2 pt-2">
            <div className="flex items-center gap-1">
              <GridFeatureIcon className="fill-blue-600" /> Grid view
            </div>

            <Check className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/** Create bar */}
      <div className="mx-4 border-t">
        <div
          className="my-2 flex cursor-pointer items-center justify-between py-2 pl-3 pr-[10px]"
          onClick={() => setCreateOpen((prev) => !prev)}
        >
          <p className="truncate text-[15px]">Create...</p>

          {createOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </div>

        {/** View formats */}
        {createOpen && (
          <div className={cn("mb-4 flex flex-col gap-1 text-[13px]")}>
            <Button variant="ghost" className="h-[32px]">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  <GridFeatureIcon className="fill-blue-600" /> Grid
                </div>

                <PlusIcon className="h-4 w-4" />
              </div>
            </Button>

            <Button variant="ghost" className="h-[32px]">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  <Calendar className="stroke-red-600" /> Calendar
                </div>

                <PlusIcon className="h-4 w-4" />
              </div>
            </Button>

            <Button variant="ghost" className="h-[32px]">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  <LayoutGrid className="stroke-purple-600" /> Gallery
                </div>

                <PlusIcon className="h-4 w-4" />
              </div>
            </Button>

            <Button variant="ghost" className="h-[32px]">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  <Kanban className="stroke-green-600" /> Kanban
                </div>

                <PlusIcon className="h-4 w-4" />
              </div>
            </Button>

            <Button variant="ghost" className="h-[32px]">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  <ChartNoAxesGantt className="stroke-red-600" /> Timeline
                </div>

                <PlusIcon className="h-4 w-4" />
              </div>
            </Button>

            <Button variant="ghost" className="h-[32px]">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  <ListChecks className="stroke-blue-600" /> List
                </div>

                <PlusIcon className="h-4 w-4" />
              </div>
            </Button>

            <Button variant="ghost" className="h-[32px]">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  <GanttIcon className="fill-green-600" /> Gantt
                </div>

                <PlusIcon className="h-4 w-4" />
              </div>
            </Button>

            <Button variant="ghost" className="h-[32px]">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  New section
                </div>

                <PlusIcon className="h-4 w-4" />
              </div>
            </Button>

            <Separator />

            <Button variant="ghost" className="mt-1 h-[32px]">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  <FormIcon className="fill-red-600" /> Form
                </div>

                <PlusIcon className="h-4 w-4" />
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

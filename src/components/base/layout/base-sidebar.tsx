"use client";

import type { View } from "@prisma/client";
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
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useTableSidebar } from "~/hooks/use-table-sidebar";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { FormIcon } from "../../icons/form-icon";
import { GanttIcon } from "../../icons/gantt-icon";
import { GridFeatureIcon } from "../../icons/grid-feature-icon";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";

type BaseSidebarProps = {
  initialViews: View[];
  tableId: string;
  viewId: string;
};

export const BaseSidebar = ({
  initialViews,
  tableId,
  viewId,
}: BaseSidebarProps) => {
  const { open } = useTableSidebar();
  const [createOpen, setCreateOpen] = useState(false);

  const params = useParams<{
    baseId: string;
    tableId?: string;
    viewId?: string;
  }>();
  const router = useRouter();

  // Logic for creating a grid view
  const utils = api.useUtils();

  const { data: views } = api.view.getViews.useQuery(
    { tableId },
    {
      initialData: initialViews,
    },
  );

  const createView = api.view.create.useMutation({
    onMutate: async () => {
      // Cancel queries
      await utils.view.getViews.cancel();

      // Snapshot
      const previousViews = utils.view.getViews.getData({ tableId });

      const emptyView = {
        id: crypto.randomUUID(),
        name: `Grid ${(previousViews?.length ?? 0) + 1}`,
        tableId,
        sorting: [],
        columnFilters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSeen: null,
      };

      // Optimistically update the columns
      utils.view.getViews.setData({ tableId }, (data) => {
        if (!data) {
          return [emptyView];
        }

        return [...data, emptyView];
      });

      return { previousViews };
    },

    onError: (_err, _newView, context) => {
      utils.view.getViews.setData({ tableId }, context?.previousViews ?? []);
    },

    onSettled: async (data, _variables, _context) => {
      router.replace(`/base/${params.baseId}/${tableId}/${data?.id}`);
      await utils.view.getViews.invalidate({ tableId });
    },
  });

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
        <div className="flex grow flex-col gap-0 overflow-y-scroll pb-3 pt-2">
          {views.map((view) =>
            view.id === viewId ? (
              <div
                className="flex cursor-pointer items-center justify-between rounded-md bg-blue-100 px-2 pb-2 pt-2"
                key={view.id}
              >
                <div className="flex items-center gap-1">
                  <GridFeatureIcon className="fill-blue-600" /> {view.name}
                </div>

                <Check className="h-4 w-4" />
              </div>
            ) : (
              <Link
                key={view.id}
                href={`/base/${params.baseId}/${tableId}/${view.id}`}
                prefetch
              >
                <div
                  className="flex cursor-pointer items-center justify-between rounded-md px-2 pb-2 pt-2 hover:bg-gray-100"
                  key={view.id}
                >
                  <div className="flex items-center gap-1">
                    <GridFeatureIcon className="fill-blue-600" /> {view.name}
                  </div>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>

      {/** Create bar */}
      <div className="mx-4 border-t">
        <div
          className="my-2 flex cursor-pointer items-center justify-between py-2 pl-3 pr-[10px]"
          onClick={() => setCreateOpen((prev) => !prev)}
          onKeyDown={() => setCreateOpen((prev) => !prev)}
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
            <Button
              variant="ghost"
              className="h-[32px]"
              onClick={() => createView.mutate({ tableId })}
            >
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
                  <ChartNoAxesGantt className="stroke-red-600" /> Timeline{" "}
                  <span className="h-[18px] rounded-full bg-blue-200 px-2 text-[11px] text-blue-700">
                    Team
                  </span>
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
                  <GanttIcon className="fill-green-600" /> Gantt{" "}
                  <span className="h-[18px] rounded-full bg-blue-200 px-2 text-[11px] text-blue-700">
                    Team
                  </span>
                </div>

                <PlusIcon className="h-4 w-4" />
              </div>
            </Button>

            <Button variant="ghost" className="h-[32px]">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  New section{" "}
                  <span className="h-[18px] rounded-full bg-blue-200 px-2 text-[11px] text-blue-700">
                    Team
                  </span>
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

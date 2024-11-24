"use client";

import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type BaseWithTables } from "~/@types";
import { api } from "~/trpc/react";
import { BaseTableRename } from "../actions/base-table-rename";

type BaseHeaderTableProps = {
  base: BaseWithTables;
};

export const BaseHeaderTableList = ({ base }: BaseHeaderTableProps) => {
  // Query client
  const utils = api.useUtils();

  const router = useRouter();

  const params = useParams<{ baseId: string; tableId?: string }>();

  // TO TRY: redirect to a new /new page that triggers the mutation
  const { data: tables } = api.base.getAllTables.useQuery(
    {
      baseId: base.id,
    },
    {
      initialData: base.tables,
    },
  );

  const isSelected = (tableIndex: number) => {
    if (params.tableId === undefined) {
      return tableIndex === 0;
    }

    if (tables[tableIndex] === undefined) {
      return false;
    }

    return tables[tableIndex].id === params.tableId;
  };

  const addTableMutation = api.base.createTable.useMutation({
    onSuccess: async (data, _variables, _context) => {
      router.replace(`/base/${base.id}/${data.id}`);
      await utils.base.getAllTables.invalidate({ baseId: base.id });
    },
  });

  return (
    <div className="flex h-8 bg-rose-600 text-white">
      <div className="relative flex flex-auto rounded-tr-lg">
        <div className="absolute bottom-0 left-0 right-0 top-0 rounded-tr-lg bg-rose-700 pl-[0.75rem]">
          <div className="ml-[-0.25rem] flex flex-auto overflow-auto rounded-tr-lg bg-rose-700 pl-1">
            <nav className="flex flex-none text-[13px]" aria-label="Tables">
              {tables.map((table, index) =>
                isSelected(index) ? (
                  <BaseTableRename table={table} key={table.id} />
                ) : (
                  <Link
                    key={table.id}
                    href={`/base/${base.id}/${table.id}`}
                    className="flex h-full items-center justify-center hover:bg-rose-800"
                    prefetch
                  >
                    <div className="height-full flex flex-auto cursor-pointer items-center rounded-t p-1 px-3 text-white">
                      {table.name}
                    </div>
                    {!isSelected(index + 1) && (
                      <div className="h-[12px] w-[1px] bg-rose-300/50" />
                    )}
                  </Link>
                ),
              )}
            </nav>

            <div className="flex items-center justify-center">
              <button
                className="h-[32px] w-[40px] rounded-t text-center hover:bg-rose-800"
                aria-label="Add or import table"
              >
                <div className="flex items-center justify-center">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              <div className="h-[12px] w-[1px] bg-rose-300/50" />
            </div>

            <button
              className="h-[32px] w-[40px] rounded-t text-center hover:bg-rose-800"
              aria-label="Add or import table"
              onClick={() => addTableMutation.mutate({ baseId: base.id })}
            >
              <div className="flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
            </button>

            <div className="rounded-tr-lg px-2" />
          </div>
        </div>
      </div>

      <div className="ml-2 flex gap-1 rounded-tl-lg bg-rose-700">
        <button className="h-[32px] rounded-t px-3 py-1 text-center text-[13px] hover:text-gray-100">
          Extensions
        </button>

        <button className="h-[32px] rounded-t px-3 py-1 text-center text-[13px] hover:text-gray-100">
          <div className="flex items-center justify-center gap-1">
            Tools <ChevronDown className="h-4 w-4" />
          </div>
        </button>
      </div>
    </div>
  );
};

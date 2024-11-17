"use client";

import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type BaseWithTables } from "~/@types";
import { api } from "~/trpc/react";

type BaseHeaderTableProps = {
  base: BaseWithTables;
};

export const BaseHeaderTable = ({ base }: BaseHeaderTableProps) => {
  // Query client
  const utils = api.useUtils();

  const router = useRouter();

  const params = useParams<{ baseId: string; tableId?: string }>();

  const isSelected = (tableId: string, tableIndex: number) => {
    if (params.tableId === undefined) {
      return tableIndex === 0;
    }

    return tableId === params.tableId;
  };

  // TO TRY: redirect to a new /new page that triggers the mutation
  const { data: tables } = api.base.getAllTables.useQuery(
    {
      baseId: base.id,
    },
    {
      initialData: base.tables,
    },
  );

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
            <nav className="flex flex-none" aria-label="Tables">
              {tables.map((table, index) =>
                isSelected(table.id, index) ? (
                  <div
                    key={table.id}
                    className="height-full flex flex-auto cursor-pointer items-center rounded-t bg-white p-1 px-3 font-medium text-black"
                  >
                    {table.name}
                  </div>
                ) : (
                  <Link
                    key={table.id}
                    href={`/base/${base.id}/${table.id}`}
                    prefetch
                  >
                    <div className="height-full flex flex-auto cursor-pointer items-center rounded-t border border-rose-800 p-1 px-3 font-medium text-white hover:bg-rose-700">
                      {table.name}
                    </div>
                  </Link>
                ),
              )}
            </nav>

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

      <div className="ml-1 flex gap-1 rounded-tl-lg bg-rose-700">
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

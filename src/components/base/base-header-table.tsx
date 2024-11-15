"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type BaseWithTables } from "~/@types";
import { api } from "~/trpc/react";

type BaseHeaderTableProps = {
  base: BaseWithTables;
};

export const BaseHeaderTable = ({ base }: BaseHeaderTableProps) => {
  const router = useRouter();

  // IDEA: redirect to a new /new page that triggers the mutation
  const addTableMutation = api.base.createTable.useMutation({
    onSuccess: (data, _variables, _context) => {
      router.replace(`/base/${base.id}/${data.id}`);
    },
  });

  return (
    <div className="flex h-8 bg-rose-700 text-white">
      <div
        className="relative flex flex-auto"
        style={{
          clipPath: "inset(-3px 0px 0px)",
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 top-0 pl-[0.75rem]">
          <div className="ml-[-0.25rem] flex flex-auto overflow-auto pl-1">
            <nav className="flex flex-none" aria-label="Tables">
              {base.tables.map((table) => (
                <Link key={table.id} href={`/base/${base.id}/${table.id}`}>
                  <div className="height-full flex flex-auto cursor-pointer items-center rounded-t bg-white p-1 px-3 font-medium text-black">
                    {table.name}
                  </div>
                </Link>
              ))}

              <button
                className="h-[32px] w-[40px] rounded-t text-center hover:bg-rose-800"
                aria-label="Add or import table"
                onClick={() => addTableMutation.mutate({ baseId: base.id })}
              >
                <div className="flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

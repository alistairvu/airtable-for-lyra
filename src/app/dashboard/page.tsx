import { ChevronDown } from "lucide-react";
import { DashboardCard } from "~/components/dashboard/dashboard-card";
import { DashboardSidebar } from "~/components/dashboard/dashboard-sidebar";
import { api } from "~/trpc/server";

export default async function Dashboard() {
  const bases = await api.base.getAll();

  return (
    <div className="flex flex-auto">
      <DashboardSidebar />

      <div className="mt-[56px] w-full bg-slate-100 px-11 pt-[38px]">
        <h1
          className="pb-6 leading-5"
          style={{ fontSize: "27px", fontWeight: 600 }}
        >
          Home
        </h1>

        <div className="flex items-center justify-between pt-8 text-[15px]">
          <div className="flex items-center justify-center gap-2">
            <div className="flex cursor-pointer items-center justify-center text-gray-700 hover:text-black">
              Opened by you <ChevronDown className="h-4 w-4" />
            </div>

            <div className="flex cursor-pointer items-center justify-center text-gray-700 hover:text-black">
              Show all types <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="grid w-full gap-4 pt-11 md:grid-cols-2 lg:grid-cols-3">
          {bases.map((base) => (
            <DashboardCard key={base.id} base={base} />
          ))}
        </div>
      </div>
    </div>
  );
}

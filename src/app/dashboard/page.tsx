import { DashboardCard } from "~/components/dashboard/dashboard-card";
import { DashboardSidebar } from "~/components/dashboard/dashboard-sidebar";
import { api } from "~/trpc/server";

export default async function Dashboard() {
  const bases = await api.base.getAll();

  return (
    <div className="flex flex-auto">
      <DashboardSidebar />

      <div className="mt-[56px] w-full px-12 pt-8">
        <h1
          className="pb-6 leading-5"
          style={{ fontSize: "27px", fontWeight: 600 }}
        >
          Home
        </h1>

        <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bases.map((base) => (
            <DashboardCard key={base.id} base={base} />
          ))}
        </div>
      </div>
    </div>
  );
}

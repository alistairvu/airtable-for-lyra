import { redirect } from "next/navigation";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <HydrateClient>
      <SidebarProvider
        style={{ "--sidebar-width": "300px" } as React.CSSProperties}
      >
        <SidebarInset>
          <div className="relative">
            <DashboardHeader />
            <main className="z-20">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}

import { redirect } from "next/navigation";
import { DashboardSidebar } from "~/components/dashboard/dashboard-sidebar";
import {
  SidebarInput,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
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
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <main>
            <SidebarTrigger />
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}

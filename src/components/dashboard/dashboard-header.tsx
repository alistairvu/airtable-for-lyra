import { signOut } from "~/server/auth";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";

export const DashboardHeader = async () => {
  return (
    <header className="absolute left-0 top-0 z-30 flex h-[56px] w-full flex-none items-center justify-between border-b bg-white px-4 py-2">
      <nav className="flex w-full items-center justify-between pl-1 pr-2">
        <div className="flex items-center justify-center gap-2">
          <SidebarTrigger />
          <h1 className="font-semibold">Airtable</h1>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button variant="outline">Log out</Button>
        </form>
      </nav>
    </header>
  );
};

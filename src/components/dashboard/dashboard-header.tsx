import { signOut } from "~/server/auth";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";

export const DashboardHeader = async () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 shadow-md">
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
    </div>
  );
};

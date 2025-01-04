"use client";

import { CircleHelp, Menu, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { AirtableTextLogoIcon } from "../icons/airtable-text-logo-icon";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

export const DashboardHeader = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="absolute left-0 top-0 z-30 flex h-[56px] w-full flex-none items-center justify-between border-b bg-white px-4 py-2">
      <nav className="flex w-full items-center justify-between pl-1 pr-2">
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-4 w-4" />
          </Button>

          <AirtableTextLogoIcon />
        </div>

        <div className="flex h-[32px] w-[320px] cursor-pointer items-center justify-between rounded-full border px-4 text-[13px] text-gray-500 hover:shadow-md">
          <div className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            <span>Search...</span>
          </div>

          <span>⌘ K</span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" className="rounded-full px-3">
            <CircleHelp className="h-4 w-4" />
          </Button>

          <Button variant="outline" onClick={() => signOut()}>
            Log out
          </Button>
        </div>
      </nav>
    </header>
  );
};

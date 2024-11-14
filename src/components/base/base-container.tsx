"use client";

import { type BaseWithTables } from "~/@types";
import { BaseContainerHeader } from "./base-container-header";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { BaseSidebar } from "./base-sidebar";

type BaseHeaderInfoProps = {
  base: BaseWithTables;
};

export const BaseContainer = ({ base }: BaseHeaderInfoProps) => {
  return (
    <div className="">
      <SidebarProvider>
        <SidebarInset>
          <BaseContainerHeader />

          <BaseSidebar />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

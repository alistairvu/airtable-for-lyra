"use client";

import { type BaseWithTables } from "~/@types";
import { BaseContainerHeader } from "./base-container-header";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { BaseSidebar } from "./base-sidebar";

type BaseHeaderInfoProps = {
  base: BaseWithTables;
  children?: React.ReactNode;
};

export const BaseContainer = ({ base, children }: BaseHeaderInfoProps) => {
  return (
    <SidebarProvider>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

"use client";

import { SidebarInset, SidebarProvider } from "../../ui/sidebar";

type BaseHeaderInfoProps = {
  children?: React.ReactNode;
};

export const BaseContainer = ({ children }: BaseHeaderInfoProps) => {
  return (
    <SidebarProvider>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

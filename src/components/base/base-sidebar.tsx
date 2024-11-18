"use client";

import { PlusIcon } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  Sidebar,
  SidebarGroupLabel,
} from "../ui/sidebar";
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { useTableSidebar } from "~/hooks/use-table-sidebar";

const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export const BaseSidebar = () => {
  const { open } = useTableSidebar();

  return (
    <div
      className={`${open ? "block" : "hidden"} border-r`}
      style={{
        height: "calc(100vh - 88px - 45px)",
        width: 282,
      }}
    >
      <p>sidebar</p>
    </div>
  );
};

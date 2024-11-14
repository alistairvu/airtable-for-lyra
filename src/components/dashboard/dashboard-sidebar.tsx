"use client";

import { Home, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { api } from "~/trpc/react";

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
];

export function DashboardSidebar() {
  const router = useRouter();

  // Mutation that creates a new base
  const baseCreateMutation = api.base.create.useMutation({
    onSuccess: (data, _variables, _context) => {
      router.replace(`/base/${data.id}`);
    },
  });

  return (
    <Sidebar className="bg-white px-3 py-3 pt-[56px]">
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
              onClick={() => {
                baseCreateMutation.mutate();
              }}
              disabled={baseCreateMutation.isPending}
            >
              <PlusIcon />
              <span>Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

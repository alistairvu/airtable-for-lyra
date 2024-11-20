"use client";

import {
  Book,
  BookOpen,
  ChevronDown,
  Home,
  PlusIcon,
  Share,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "~/components/ui/sidebar";
import { api } from "~/trpc/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Button } from "../ui/button";

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
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger asChild>
                <Button
                  className="flex items-center justify-between text-[15px] font-semibold text-black"
                  variant="ghost"
                >
                  <span>Home</span>
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </Button>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <div className="flex justify-center gap-2 py-2">
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-sm border">
                    <Star className="h-4 w-4" />
                  </div>

                  <p className="text-[11px]" style={{ lineHeight: 1.25 }}>
                    Your starred bases, interfaces, and workspaces will appear
                    here
                  </p>
                </div>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <Button
              className="flex items-center justify-between text-[15px] font-semibold text-black"
              variant="ghost"
            >
              <span>All workspaces</span>

              <div className="flex items-center justify-center gap-2">
                <PlusIcon className="h-4 w-4" />
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </div>
            </Button>
          </SidebarGroupLabel>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-white">
        <SidebarMenu>
          <SidebarSeparator className="mb-4" />

          <SidebarMenuItem className="flex cursor-pointer items-center gap-1 bg-white py-1 text-[13px] hover:bg-gray-100">
            <BookOpen className="h-4 w-4" /> Templates and apps
          </SidebarMenuItem>

          <SidebarMenuItem className="flex cursor-pointer items-center gap-1 bg-white py-1 text-[13px] hover:bg-gray-100">
            <ShoppingBag className="h-4 w-4" /> Marketplace
          </SidebarMenuItem>

          <SidebarMenuItem className="flex cursor-pointer items-center gap-1 bg-white py-1 text-[13px] hover:bg-gray-100">
            <Share className="h-4 w-4" /> Import
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              className="mt-4 flex w-full items-center justify-center bg-blue-600 text-center text-white hover:bg-blue-500 hover:text-white"
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

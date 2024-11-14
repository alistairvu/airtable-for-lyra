import { SidebarTrigger } from "../ui/sidebar";

export const BaseContainerHeader = () => {
  return (
    <div
      className="relative left-0 right-2 top-0 z-[7] flex h-[44px] items-center justify-between whitespace-nowrap font-normal"
      style={{ boxShadow: "rgba(200, 200, 200) 0 1px 0 0" }}
    >
      <SidebarTrigger />
    </div>
  );
};

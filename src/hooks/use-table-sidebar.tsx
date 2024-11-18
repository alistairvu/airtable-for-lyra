import { type SetStateAction, type Dispatch, createContext, use } from "react";

type TableSidebarContextValue = {
  open: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const TableSidebarContext = createContext<TableSidebarContextValue>({
  open: false,
  setIsOpen: () => {
    return;
  },
});

export const useTableSidebar = () => {
  return use(TableSidebarContext);
};

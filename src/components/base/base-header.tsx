"use client";

import { BaseHeaderInfo } from "./base-header-info";
import { BaseHeaderTableList } from "./base-header-table-list";
import { type BaseWithTables } from "~/@types";

type BaseHeaderProps = {
  base: BaseWithTables;
};

export const BaseHeader = ({ base }: BaseHeaderProps) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 10,
        width: "100%",
      }}
    >
      <BaseHeaderInfo base={base} />
      <BaseHeaderTableList base={base} />
    </div>
  );
};

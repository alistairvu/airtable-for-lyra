"use client";

import { BaseHeaderInfo } from "./base-header-info";
import { BaseHeaderTable } from "./base-header-table";
import { type BaseWithTables } from "~/@types";

type BaseHeaderProps = {
  base: BaseWithTables;
};

export const BaseHeader = ({ base }: BaseHeaderProps) => {
  return (
    <div>
      <BaseHeaderInfo base={base} />
      <BaseHeaderTable base={base} />
    </div>
  );
};

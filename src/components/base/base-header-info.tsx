import Link from "next/link";
import { WhiteIcon } from "../icons/white-icon";
import { type BaseWithTables } from "~/@types";

type BaseHeaderInfoProps = {
  base: BaseWithTables;
};

export const BaseHeaderInfo = ({ base }: BaseHeaderInfoProps) => {
  return (
    <div className="flex h-[56px] items-center justify-between bg-rose-600 pl-[20px] text-white">
      <div className="flex items-center gap-x-4">
        <Link href="/dashboard">
          <WhiteIcon />
        </Link>
        <h1 className="truncate text-[17px] font-medium"> {base.name}</h1>
      </div>
    </div>
  );
};

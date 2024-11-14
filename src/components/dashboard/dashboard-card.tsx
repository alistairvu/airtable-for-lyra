import { type Base } from "@prisma/client";
import Link from "next/link";

type DashboardCardProps = {
  base: Base;
};

export const DashboardCard = ({ base }: DashboardCardProps) => {
  return (
    <Link href={`/base/${base.id}`}>
      <div className="flex h-[92px] w-full cursor-pointer items-center justify-center rounded-[6px] border">
        <div className="relative flex h-[92px] w-[92px] items-center justify-center">
          <div className="flex h-[56px] w-[56px] items-center justify-center rounded-lg bg-rose-600 text-white">
            <span style={{ fontSize: 22 }}>{base.name.substring(0, 2)}</span>
          </div>
        </div>

        <div className="mr-4 flex flex-auto flex-col items-start justify-center">
          <h3 className="truncate font-medium">{base.name}</h3>

          <div className="text-xs text-gray-700">
            <span>Base</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

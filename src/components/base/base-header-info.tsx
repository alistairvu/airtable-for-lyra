import Link from "next/link";
import { WhiteIcon } from "../icons/white-icon";
import { type BaseWithTables } from "~/@types";
import { Bell, ChevronDown, CircleHelp, History, Users } from "lucide-react";
import { AirtablePlusIcon } from "../icons/airtable-plus-icon";

type BaseHeaderInfoProps = {
  base: BaseWithTables;
};

export const BaseHeaderInfo = ({ base }: BaseHeaderInfoProps) => {
  return (
    <div className="flex h-[56px] items-center justify-between bg-rose-600 px-[20px] text-white">
      <div className="flex items-center gap-x-4">
        <Link href="/dashboard">
          <WhiteIcon />
        </Link>

        <div className="flex items-center justify-center gap-1">
          <h1 className="truncate text-[17px] font-medium">{base.name}</h1>

          <ChevronDown className="h-4 w-4" />
        </div>

        <div className="mx-4 flex gap-2">
          <div className="flex h-[28px] items-center justify-center rounded-full bg-rose-700 px-3">
            <p className="text-[13px] leading-normal">Data</p>
          </div>

          <div className="flex h-[28px] cursor-pointer items-center justify-center rounded-full bg-rose-600 px-3 hover:bg-rose-700">
            <p className="text-[13px] leading-normal">Automations</p>
          </div>

          <div className="flex h-[28px] cursor-pointer items-center justify-center rounded-full bg-rose-600 px-3 hover:bg-rose-700">
            <p className="text-[13px] leading-normal">Interfaces</p>
          </div>

          <div className="flex h-[28px] cursor-pointer items-center justify-center rounded-full bg-rose-600 px-3 hover:bg-rose-700">
            <p className="text-[13px] leading-normal">Forms</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className="flex h-[28px] cursor-pointer items-center justify-center rounded-full bg-rose-600 px-3 hover:bg-rose-700">
          <History className="h-4 w-4" />
        </div>

        <div className="flex h-[28px] cursor-pointer items-center justify-center rounded-full bg-rose-600 px-3 hover:bg-rose-700">
          <CircleHelp className="mr-2 h-4 w-4" />
          <p className="text-[13px] leading-normal">Help</p>
        </div>

        <div className="flex h-[28px] cursor-pointer items-center justify-center rounded-full bg-rose-700 px-3 hover:bg-rose-700">
          <AirtablePlusIcon className="mr-2 h-4 w-4 fill-white" />
          <p className="text-[13px] leading-normal">Upgrade</p>
        </div>

        <div className="flex h-[28px] cursor-pointer items-center justify-center rounded-full bg-white px-3 text-red-500">
          <Users className="mr-2 h-4 w-4 border-red-500" />
          <p className="text-[13px] leading-normal">Share</p>
        </div>

        <div className="flex h-[28px] cursor-pointer items-center justify-center rounded-full bg-white px-3 text-red-500">
          <Bell className="h-4 w-4 border-red-500" />
        </div>
      </div>
    </div>
  );
};

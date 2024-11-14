import { type BaseWithTables } from "~/@types";

type BaseHeaderTableProps = {
  base: BaseWithTables;
};

export const BaseHeaderTable = ({ base }: BaseHeaderTableProps) => {
  return (
    <div className="flex h-8 bg-rose-700 text-white">
      <div
        className="relative flex flex-auto"
        style={{
          clipPath: "inset(-3px 0px 0px)",
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 top-0 pl-[0.75rem]">
          <div className="ml-[-0.25rem] flex flex-auto overflow-auto pl-1">
            <nav className="flex flex-none" aria-label="Tables">
              {base.tables.map((table) => (
                <div
                  key={table.id}
                  className="height-full flex flex-auto cursor-pointer items-center rounded-t bg-white p-1 px-3 font-medium text-black"
                >
                  {table.name}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

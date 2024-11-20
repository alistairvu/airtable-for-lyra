import { type Row, type Cell, type Table, type Base } from "@prisma/client";

export type CellWithTempId = Cell & {
  tempId?: string;
};

export type RowWithCells = Row & {
  cells: CellWithTempId[];
  tempId?: string;
};

export type BaseWithTables = Base & {
  tables: Table[];
};

export type IntFilter = {
  mode: "lt" | "gt";
  value: number | null;
};

import { type Row, type Cell, type Table, type Base } from "@prisma/client";

export type RowWithCells = Row & {
  cells: Cell[];
};

export type BaseWithTables = Base & {
  tables: Table[];
};

export type IntFilter = {
  mode: "lt" | "gt";
  value: number | null;
};

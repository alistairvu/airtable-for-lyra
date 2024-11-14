import { type PrismaClient } from "@prisma/client";

/**
 * Handles logic related to the table
 */
export class TableController {
  constructor(private db: PrismaClient) {}

  async countRows(tableId: string, userId: string) {
    const rows = await this.db.row.findMany({
      where: {
        tableId,
      },
      distinct: ["index"],
      select: {
        index: true,
      },
    });

    return {
      count: rows.length,
    };
  }

  async getColumns(tableId: string) {
    return this.db.column.findMany({
      where: {
        tableId,
      },
      orderBy: {
        index: "asc",
      },
    });
  }

  async getRows(tableId: string) {
    return this.db.row.findMany({
      where: {
        tableId,
      },
      include: {
        cells: true,
      },
      orderBy: {
        index: "asc",
      },
    });
  }

  async getInfiniteRows(tableId: string, cursor: number, limit: number) {
    const items = await this.db.row.findMany({
      take: limit,
      skip: cursor,
      where: {
        tableId,
      },
      include: {
        cells: true,
      },
      orderBy: {
        index: "asc",
      },
    });

    const nextCursor = cursor + items.length;

    return { items, nextCursor };
  }

  async editTextCell(cellId: string, value: string) {
    return this.db.cell.update({
      where: {
        id: cellId,
      },
      data: {
        textValue: value,
        intValue: null,
      },
    });
  }

  async editIntCell(cellId: string, value: number) {
    return this.db.cell.update({
      where: {
        id: cellId,
      },
      data: {
        textValue: String(value),
        intValue: value,
      },
    });
  }

  async addRow(tableId: string) {
    // Finds column data
    const columns = await this.db.column.findMany({
      where: {
        tableId,
      },
    });

    if (columns.length === 0) {
      return null;
    }

    const rowIndex = await this.db.row.aggregate({
      where: {
        tableId: tableId,
      },
      _max: {
        index: true,
      },
    });

    const maxIndex = rowIndex._max;

    if (maxIndex.index === null) {
      return null;
    }

    // Adds new row
    const newRow = await this.db.row.create({
      data: {
        index: maxIndex.index + 1,
        tableId,

        cells: {
          create: columns.map((column) => ({
            columnId: column.id,
          })),
        },
      },
    });

    return newRow;
  }
}

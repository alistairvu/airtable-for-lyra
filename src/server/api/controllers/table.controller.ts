import { type PrismaClient } from "@prisma/client";
import { type SortingState } from "@tanstack/react-table";
import { TRPCError } from "@trpc/server";

/**
 * Handles logic related to the table
 */
export class TableController {
  constructor(private db: PrismaClient) {}

  async findBase(tableId: string, userId: string) {
    const base = await this.db.base.findFirst({
      where: {
        userId,
        tables: {
          some: {
            id: tableId,
          },
        },
      },
    });

    if (base === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No table with ID ${tableId} found`,
      });
    }
  }

  async countRows(tableId: string, userId: string) {
    // Match the base
    await this.findBase(tableId, userId);

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

  async getColumns(tableId: string, userId: string) {
    await this.findBase(tableId, userId);

    return this.db.column.findMany({
      where: {
        tableId,
      },
      orderBy: {
        index: "asc",
      },
    });
  }

  async getRows(tableId: string, userId: string) {
    await this.findBase(tableId, userId);

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

  async getInfiniteRows(
    tableId: string,
    cursor: number,
    limit: number,
    userId: string,
    viewId?: string,
  ) {
    await this.findBase(tableId, userId);

    // Handling different viewId
    if (viewId) {
      const view = await this.db.view.findUnique({
        where: {
          id: viewId,
        },
      });

      // First thing
      if (view !== undefined) {
        // Has sorting state
        if (view?.sorting) {
          const parsedSorting = view.sorting as unknown as SortingState;

          // One column at a time
          const sortingObject = parsedSorting[0];

          console.log({ sortingObject });

          if (sortingObject !== undefined) {
            const { id, desc } = sortingObject;

            const column = await this.db.column.findUnique({
              where: {
                id,
              },
            });

            const isText = column?.type === "TEXT";

            const rowIds = await this.db.cell.findMany({
              take: limit,
              skip: cursor,
              where: {
                columnId: id,
              },
              select: {
                rowId: true,
              },
              orderBy: isText
                ? { textValue: desc ? "desc" : "asc" }
                : { intValue: desc ? "desc" : "asc" },
            });

            const extractedId = rowIds.map((x) => x.rowId);
            const idMap = new Map(extractedId.map((x, index) => [x, index]));

            const rawItems = await this.db.row.findMany({
              where: {
                id: {
                  in: extractedId,
                },
              },
              include: {
                cells: true,
              },
            });

            const items = rawItems.sort(
              (x, y) => (idMap.get(x.id) ?? -1) - (idMap.get(y.id) ?? -1),
            );

            console.log({ items });

            const nextCursor = cursor + items.length;

            return { items, nextCursor };
          }
        }
      }
    }

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

  async editTextCell(cellId: string, value: string, userId: string) {
    const table = await this.db.table.findFirst({
      where: {
        rows: {
          some: {
            cells: {
              some: {
                id: cellId,
              },
            },
          },
        },
      },
    });

    if (table === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No cell with ID ${cellId} found`,
      });
    }

    await this.findBase(table.id, userId);

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

  async editIntCell(cellId: string, value: number, userId: string) {
    const table = await this.db.table.findFirst({
      where: {
        rows: {
          some: {
            cells: {
              some: {
                id: cellId,
              },
            },
          },
        },
      },
    });

    if (table === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No cell with ID ${cellId} found`,
      });
    }

    await this.findBase(table.id, userId);

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

  /**
   * Adds a text column to the table.
   * TODO: Allows user to add arbitrary name
   *
   * @param tableId
   * @param userId
   */
  async addTextColumn(tableId: string, userId: string) {
    await this.findBase(tableId, userId);

    // Get column index
    const rowIndex = await this.db.row.aggregate({
      where: {
        tableId: tableId,
      },
      _max: {
        index: true,
      },
    });

    const maxIndex = rowIndex._max;

    // Create the actual column
    const column = await this.db.column.create({
      data: {
        tableId,
        index: (maxIndex.index ?? 0) + 1,
        name: "Label",
        type: "TEXT",
      },
    });

    // Appends that column to every row in the table
    const currentRows = await this.db.row.findMany({
      where: {
        tableId,
      },
    });

    const cellData = currentRows.map((row) => ({
      columnId: column.id,
      rowId: row.id,
      intValue: null,
      textValue: "",
    }));

    console.log({ cellData });

    await this.db.cell.createMany({
      data: cellData,
    });

    return column;
  }

  /**
   * Adds a row to the database.
   *
   * @param tableId The table to add to.
   * @param userId The user doing the adding.
   * @returns The newly created row.
   */
  async addRow(tableId: string, userId: string) {
    await this.findBase(tableId, userId);

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

    // Adds new row
    const newRow = await this.db.row.create({
      data: {
        index: (maxIndex.index ?? 0) + 1,
        tableId,

        cells: {
          create: columns.map((column) =>
            column.type === "NUMBER"
              ? {
                  columnId: column.id,
                  intValue: 0,
                  textValue: null,
                }
              : {
                  columnId: column.id,
                  intValue: null,
                  textValue: "",
                },
          ),
        },
      },
    });

    console.log({ newRow });

    return newRow;
  }
}

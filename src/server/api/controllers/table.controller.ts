import type { Column, PrismaClient, Table } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { IntFilter, ViewColumnFilter } from "~/@types";
import {
  columnFiltersSchema,
  sortingStateSchema,
} from "~/schemas/sorting.schema";

type AddDummyParams = {
  name: string;
  age: number;
};

type WhereFilterType =
  | {
      columnId?: string;
      textValue: { contains: string; mode: "insensitive" };
    }
  | {
      columnId: string;
      textValue: { equals: string } | { not: string };
    }
  | {
      columnId: string;
      intValue: {
        gt?: number;
        lt?: number;
      };
    };

type CellFilterType = {
  cells: {
    some: WhereFilterType;
  };
};

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

  /**
   * Retrieves all rows from a table with their associated cells, ordered by index.
   *
   * @param tableId - The ID of the table to fetch rows from
   * @param userId - The ID of the user requesting the rows
   * @returns A Promise that resolves to an array of rows with their included cells,
   *          sorted by their index in ascending order
   */
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

  generateWhereClause(
    filters: ViewColumnFilter[] | null,
    columns: Column[],
    query?: string | null,
  ) {
    if (filters === null) {
      return [];
    }

    if (filters.length === 0) {
      return [];
    }

    const whereFilters: CellFilterType[] = filters
      .map((f) => {
        const column = columns.find((c) => c.id === f.id);

        if (column === undefined) {
          return undefined;
        }

        if (column.type === "TEXT") {
          return {
            cells: {
              some: {
                columnId: f.id,
                textValue: f.value
                  ? {
                      equals: "",
                    }
                  : {
                      not: "",
                    },
              },
            },
          };
        }

        if (column.type === "NUMBER") {
          const intFilter = f.value as IntFilter;

          if (intFilter.mode === "gt") {
            return {
              cells: {
                some: {
                  columnId: f.id,
                  intValue: {
                    gt: intFilter.value ?? undefined,
                  },
                },
              },
            };
          }

          if (intFilter.mode === "lt") {
            return {
              cells: {
                some: {
                  columnId: f.id,
                  intValue: {
                    lt: intFilter.value ?? undefined,
                  },
                },
              },
            };
          }
        }

        return undefined;
      })
      .filter((x) => x !== undefined);

    if (query && query.length > 0) {
      whereFilters.push({
        cells: {
          some: {
            textValue: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      });
    }

    return whereFilters;
  }

  /**
   * Retrieves rows from a table with pagination and optional sorting based on a view.
   *
   * @param tableId - The ID of the table to fetch rows  from
   * @param cursor - The pagination cursor indicating where to start fetching rows
   * @param limit - The maximum number of rows to return
   * @param userId - The ID of the user requesting the rows
   * @param viewId - Optional view ID that may contain sorting preferences
   *
   * @returns An object containing:
   *  - items: Array of rows with their associated cells
   *  - nextCursor: The cursor position for the next page of results
   *
   * If a viewId is provided and contains sorting information, the rows will be sorted
   * according to the view's preferences. Otherwise, rows are sorted by their index
   * in ascending order.
   */
  async getInfiniteRows(params: {
    tableId: string;
    cursor: number;
    limit: number;
    userId: string;
    sorting: z.infer<typeof sortingStateSchema>;
    columnFilters: z.infer<typeof columnFiltersSchema>;
    query?: string | null;
  }) {
    const { tableId, cursor, limit, userId, sorting, columnFilters, query } =
      params;

    await this.findBase(tableId, userId);

    const columns = await this.getColumns(tableId, userId);

    const rowWhere = this.generateWhereClause(columnFilters, columns, query);

    // One column at a time
    const sortingObject = sorting[0];

    if (sortingObject !== undefined) {
      const { id, desc } = sortingObject;

      const column = await this.db.column.findUnique({
        where: {
          id,
        },
      });

      const isText = column?.type === "TEXT";

      // Getting the rows we can render
      let rowWhitelist = null;

      if (query && query.length > 0) {
        rowWhitelist = await this.db.row.findMany({
          where: {
            cells: {
              some: {
                textValue: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
          select: {
            id: true,
          },
        });
      }

      const rowWhitelistCondition =
        rowWhitelist === null
          ? []
          : [
              {
                rowId: {
                  in: rowWhitelist.map((x) => x.id),
                },
              },
            ];

      const rowIds = await this.db.cell.findMany({
        take: limit,
        skip: cursor,
        where: {
          AND: [
            {
              columnId: id,
            },
            ...rowWhere
              .filter((x) => x.cells.some.columnId === id)
              .map((x) => x.cells.some),

            ...rowWhitelistCondition,
          ],
        },
        select: {
          rowId: true,
        },
        orderBy: isText
          ? { textValue: desc ? "desc" : "asc" }
          : { intValue: desc ? "desc" : "asc" },
      });

      // Extracting their IDs
      const extractedId = rowIds.map((x) => x.rowId);
      const idMap = new Map(extractedId.map((x, index) => [x, index]));

      // Only getting the elements
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

      const nextCursor = cursor + items.length;

      return { items, nextCursor };
    }

    const items = await this.db.row.findMany({
      take: limit,
      skip: cursor,
      where: {
        AND: [
          {
            tableId,
          },
          ...rowWhere,
        ],
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

  /**
   * Updates the value of a text cell in the database.
   *
   * @param cellId - The ID of the cell to edit
   * @param value - The new text value to set
   * @param userId - The ID of the user performing the edit
   * @returns A Promise that resolves to the updated cell
   * @throws {TRPCError} If the cell is not found or user doesn't have access
   */
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
    const columnIndex = await this.db.column.aggregate({
      where: {
        tableId: tableId,
      },
      _max: {
        index: true,
      },
    });

    const maxIndex = columnIndex._max;

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

    return newRow;
  }

  /**
   * Add dummy rows to the database
   *
   * @param tableId
   * @param userId
   * @param dummyRows
   * @returns
   */
  async addDummyRows(
    tableId: string,
    userId: string,
    dummyRows: AddDummyParams[],
  ) {
    await this.findBase(tableId, userId);

    // Finds column data
    const columns = await this.db.column.findMany({
      where: {
        tableId,
      },
    });

    const nameColumn = columns.find((x) => x.name === "Name");
    const ageColumn = columns.find((x) => x.name === "Age");

    if (nameColumn === undefined || ageColumn === undefined) {
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

    const rowData = dummyRows.map((_values, index) => ({
      index: (maxIndex.index ?? 0) + index + 1,
      tableId,
    }));

    const rows = await this.db.row.createManyAndReturn({
      data: rowData,
    });

    const cellData = rows.flatMap((row, index) => {
      return columns.map((column) => {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const { name, age } = dummyRows[index]!;

        if (column.name === "Name") {
          return {
            rowId: row.id,
            columnId: column.id,
            intValue: null,
            textValue: name,
          };
        }

        if (column.name === "Age") {
          return {
            rowId: row.id,

            columnId: column.id,
            intValue: age,
            textValue: String(age),
          };
        }

        return column.type === "NUMBER"
          ? {
              rowId: row.id,

              columnId: column.id,
              intValue: 0,
              textValue: null,
            }
          : {
              rowId: row.id,
              columnId: column.id,
              intValue: null,
              textValue: "",
            };
      });
    });

    await this.db.cell.createMany({
      data: cellData,
    });
  }

  /**
   * Renames a table
   * @param {Object} params - The parameters for renaming the table
   * @param {string} params.tableId - The ID of the table to rename
   * @param {string} params.userId - The ID of the user performing the rename
   * @param {string} params.name - The new name for the table
   * @returns {Promise<Table>} The updated table record
   */
  async rename({
    tableId,
    userId,
    name,
  }: {
    tableId: string;
    userId: string;
    name: string;
  }): Promise<Table> {
    await this.findBase(tableId, userId);

    return this.db.table.update({
      where: {
        id: tableId,
      },
      data: {
        name,
      },
    });
  }
}

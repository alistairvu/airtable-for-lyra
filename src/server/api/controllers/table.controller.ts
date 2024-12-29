import type { Column, PrismaClient, Table } from "@prisma/client";
import type { SortingState } from "@tanstack/react-table";
import { TRPCError } from "@trpc/server";
import type { IntFilter, ViewColumnFilter } from "~/@types";

type AddDummyParams = {
  name: string;
  age: number;
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

  generateWhereClause(filters: ViewColumnFilter[] | null, columns: Column[]) {
    if (filters === null) {
      return undefined;
    }

    if (filters.length === 0) {
      return undefined;
    }

    const whereFilters = filters
      .map((f) => {
        const column = columns.find((c) => c.id === f.id);

        if (column === undefined) {
          return undefined;
        }

        if (column.type === "TEXT") {
          return {
            columnId: f.id,
            textValue: f.value
              ? {
                  equals: "",
                }
              : {
                  not: "",
                },
          };
        }

        if (column.type === "NUMBER") {
          const intFilter = f.value as IntFilter;

          if (intFilter.mode === "gt") {
            return {
              columnId: f.id,
              intValue: {
                gt: intFilter.value ?? undefined,
              },
            };
          }

          if (intFilter.mode === "lt") {
            return {
              columnId: f.id,
              intValue: {
                gt: intFilter.value ?? undefined,
              },
            };
          }
        }

        return undefined;
      })
      .filter((x) => x !== undefined);

    return whereFilters;
  }

  /**
   * Retrieves rows from a table with pagination and optional sorting based on a view.
   *
   * @param tableId - The ID of the table to fetch rows from
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
        if (
          view?.sorting &&
          (view.sorting as unknown as SortingState).length > 0
        ) {
          const parsedSorting = view.sorting as unknown as SortingState;

          // One column at a time
          const sortingObject = parsedSorting[0];

          if (sortingObject !== undefined) {
            const { id, desc } = sortingObject;

            const column = await this.db.column.findUnique({
              where: {
                id,
              },
            });

            const isText = column?.type === "TEXT";
            const columns = await this.getColumns(tableId, userId);

            const rowWhere = this.generateWhereClause(
              view.columnFilters as ViewColumnFilter[],
              columns,
            );

            // Getting the rows we can render
            const rowIds = await this.db.cell.findMany({
              take: limit,
              skip: cursor,
              where: {
                columnId: id,
                row: {
                  cells: {
                    some: {
                      AND: rowWhere,
                    },
                  },
                },
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
        } else if (view?.columnFilters) {
          const columns = await this.getColumns(tableId, userId);

          const rowWhere = this.generateWhereClause(
            view.columnFilters as ViewColumnFilter[],
            columns,
          );

          const items = await this.db.row.findMany({
            take: limit,
            skip: cursor,
            where: {
              cells: {
                some: {
                  AND: rowWhere,
                },
              },
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
      }
    }

    // No custom views.
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

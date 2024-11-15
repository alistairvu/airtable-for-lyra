import { type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

/**
 * Handles logic related to a base
 */
export class BaseController {
  constructor(private db: PrismaClient) {}

  /**
   * Creates a new base
   *
   * @param userId The user corresponding to the new base.
   */
  async create(userId: string) {
    // Count the number of bases a user already has
    const baseCount = await this.db.base.count({
      where: {
        userId,
      },
    });

    // Based on the count, get the new base name
    const name =
      baseCount > 0 ? `Untitled Base ${baseCount + 1}` : `Untitled Base`;

    // And creating a new base with that name
    const base = await this.db.base.create({
      data: {
        name,
        userId,

        // Creating the default table
        tables: {
          create: [
            {
              index: 0,
              name: "Table 1",

              // Creating the columns of the default table
              columns: {
                create: [
                  {
                    index: 0,
                    name: "Name",
                    type: "TEXT",
                  },
                  {
                    index: 1,
                    name: "Age",
                    type: "NUMBER",
                  },
                ],
              },
            },
          ],
        },
      },
    });

    // Returns the created base
    return base;
  }

  /**
   * Gets all bases related to a user.
   *
   * @param userId The ID of the user.
   */
  async getAll(userId: string) {
    return this.db.base.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Gets the base corresponding with the base ID and the user ID.
   *
   * @param baseId The ID of the base.
   * @param userId The ID of the user
   * @returns The base with the base + user combination.
   */
  async get(baseId: string, userId: string) {
    const base = await this.db.base.findFirst({
      where: {
        id: baseId,
        userId,
      },
      include: {
        tables: true,
      },
    });

    if (base === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Base with ID ${baseId} does not exist, or you cannot access it.`,
      });
    }

    return base;
  }

  /**
   * Returns the very first table associated with a base
   */
  async getFirstTable(baseId: string, userId: string) {
    const base = await this.db.base.findFirst({
      where: {
        id: baseId,
        userId,
      },
      include: {
        tables: {
          orderBy: {
            index: "asc",
          },
        },
      },
    });

    if (base === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Base with ID ${baseId} does not exist, or you cannot access it.`,
      });
    }

    return base.tables[0];
  }

  /**
   * Returns the very first table associated with a base
   */
  async createTable(baseId: string, userId: string) {
    const base = await this.db.base.findFirst({
      where: {
        id: baseId,
        userId,
      },
      include: {
        tables: {
          orderBy: {
            index: "asc",
          },
        },
      },
    });

    if (base === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Base with ID ${baseId} does not exist, or you cannot access it.`,
      });
    }

    const table = await this.db.table.create({
      data: {
        baseId,
        index: base.tables.length,
        name: `Table ${base.tables.length + 1}`,

        // Creating the columns of the default table
        columns: {
          create: [
            {
              index: 0,
              name: "Name",
              type: "TEXT",
            },
            {
              index: 1,
              name: "Age",
              type: "NUMBER",
            },
          ],
        },
      },
    });

    return table;
  }
}

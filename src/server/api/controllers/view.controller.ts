import type { Prisma, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

/**
 * Handles logic related to the table
 */
export class ViewController {
  constructor(private db: PrismaClient) {}

  async findBaseByView(viewId: string, userId: string) {
    const view = await this.db.view.findUnique({
      where: {
        id: viewId,
      },
    });

    if (view === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No view with ID ${viewId} found`,
      });
    }

    const base = await this.db.base.findFirst({
      where: {
        userId,
        tables: {
          some: {
            id: view.tableId,
          },
        },
      },
    });

    if (base === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No view with ID ${viewId} found`,
      });
    }
  }

  async findBaseByTable(tableId: string, userId: string) {
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

  /**
   *
   * @param tableId
   * @param userId
   * @returns
   */
  async create(tableId: string, userId: string) {
    await this.findBaseByTable(tableId, userId);

    const viewCount = await this.db.view.count({
      where: {
        tableId,
      },
    });

    console.log({ viewCount });

    return this.db.view.create({
      data: {
        tableId,
        name: `Grid ${viewCount + 1}`,
        sorting: [] as Prisma.JsonArray,
        columnFilters: [] as Prisma.JsonArray,
        lastSeen: new Date(),
      },
    });
  }

  /**
   *
   * @param tableId
   * @param userId
   * @returns
   */
  async getFirstView(tableId: string, userId: string) {
    console.log({ tableId, userId });

    await this.findBaseByTable(tableId, userId);

    const viewCount = await this.db.view.count({
      where: {
        tableId,
      },
    });

    if (viewCount === 0) {
      return this.create(tableId, userId);
    }

    const view = await this.db.view.findFirst({
      where: {
        tableId,
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    return view;
  }

  /**
   *
   * @param tableId
   * @param userId
   * @returns
   */
  async getViews(tableId: string, userId: string) {
    await this.findBaseByTable(tableId, userId);

    const views = await this.db.view.findMany({
      where: {
        tableId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return views;
  }

  async get(viewId: string, userId: string) {
    await this.findBaseByView(viewId, userId);

    return this.db.view.findUnique({
      where: {
        id: viewId,
      },
    });
  }

  /**
   * Set the sorting state of a given view.
   *
   * @param viewId
   * @param userId
   * @param sorting
   */
  async setSortState(
    viewId: string,
    userId: string,
    sorting: Prisma.JsonArray,
  ) {
    await this.findBaseByView(viewId, userId);

    await this.db.view.update({
      where: {
        id: viewId,
      },
      data: {
        sorting,
      },
    });
  }

  /**
   * Set column filters of a given view.
   *
   * @param viewId
   * @param userId
   * @param columnFilters
   */
  async setColumnFilters(
    viewId: string,
    userId: string,
    columnFilters: Prisma.JsonArray,
  ) {
    await this.findBaseByView(viewId, userId);

    await this.db.view.update({
      where: {
        id: viewId,
      },
      data: {
        columnFilters,
      },
    });
  }
}

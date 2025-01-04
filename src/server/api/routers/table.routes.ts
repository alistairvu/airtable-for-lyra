import { z } from "zod";
import {
  columnFiltersSchema,
  sortingStateSchema,
} from "~/schemas/sorting.schema";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TableController } from "../controllers/table.controller";

export const tableRouter = createTRPCRouter({
  countRows: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const controller = new TableController(ctx.db);
      return controller.countRows(input, ctx.session.user.id);
    }),

  getRows: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const controller = new TableController(ctx.db);
      const rows = await controller.getRows(input, ctx.session.user.id);
      return rows;
    }),

  rename: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        tableId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const controller = new TableController(ctx.db);
      const table = await controller.rename({
        name: input.name,
        tableId: input.tableId,
        userId: ctx.session.user.id,
      });
      return table;
    }),

  addRow: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const controller = new TableController(ctx.db);
      const row = await controller.addRow(input, ctx.session.user.id);
      return row;
    }),

  addDummyRows: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        dummyRows: z.array(
          z.object({
            name: z.string(),
            age: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const controller = new TableController(ctx.db);
      const rows = await controller.addDummyRows(
        input.tableId,
        ctx.session.user.id,
        input.dummyRows,
      );
      return rows;
    }),

  addTextColumn: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const controller = new TableController(ctx.db);
      const { tableId } = input;
      const row = await controller.addTextColumn(tableId, ctx.session.user.id);
      return row;
    }),

  getInfiniteRows: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        cursor: z.number().nullish(),
        limit: z.number().nullish(),

        sorting: sortingStateSchema,
        columnFilters: columnFiltersSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const controller = new TableController(ctx.db);

      const limit = input.limit ?? 1000;
      const cursor = input.cursor ?? 0;
      const { tableId, sorting, columnFilters } = input;

      return controller.getInfiniteRows({
        tableId,
        cursor,
        limit,
        userId: ctx.session.user.id,
        sorting,
        columnFilters,
      });
    }),

  getColumns: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const controller = new TableController(ctx.db);
      return controller.getColumns(input, ctx.session.user.id);
    }),

  editTextCell: protectedProcedure
    .input(
      z.object({
        cellId: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const controller = new TableController(ctx.db);
      const { cellId, value } = input;
      return controller.editTextCell(cellId, value, ctx.session.user.id);
    }),

  editIntCell: protectedProcedure
    .input(
      z.object({
        cellId: z.string(),
        value: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const controller = new TableController(ctx.db);
      const { cellId, value } = input;
      console.log({ input });
      return controller.editIntCell(cellId, value, ctx.session.user.id);
    }),
});

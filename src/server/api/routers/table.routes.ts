import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
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

  addRow: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const controller = new TableController(ctx.db);
      const row = await controller.addRow(input, ctx.session.user.id);
      return row;
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
      }),
    )
    .query(async ({ ctx, input }) => {
      const controller = new TableController(ctx.db);

      const limit = input.limit ?? 1000;
      const cursor = input.cursor ?? 0;

      return controller.getInfiniteRows(
        input.tableId,
        cursor,
        limit,
        ctx.session.user.id,
      );
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
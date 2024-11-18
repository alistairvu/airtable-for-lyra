import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { ViewController } from "../controllers/view.controller";

export const viewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const controller = new ViewController(ctx.db);
      return controller.create(input.tableId, ctx.session.user.id);
    }),

  getFirstView: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const controller = new ViewController(ctx.db);
      return controller.getFirstView(input.tableId, ctx.session.user.id);
    }),

  getViews: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const controller = new ViewController(ctx.db);
      return controller.getViews(input.tableId, ctx.session.user.id);
    }),
});

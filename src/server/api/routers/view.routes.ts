import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { ViewController } from "../controllers/view.controller";
import { type Prisma } from "@prisma/client";

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

  get: protectedProcedure
    .input(
      z.object({
        viewId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const controller = new ViewController(ctx.db);
      return controller.get(input.viewId, ctx.session.user.id);
    }),

  setSortState: protectedProcedure
    .input(
      z.object({
        viewId: z.string(),
        sorting: z.array(
          z.object({
            id: z.string(),
            desc: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const controller = new ViewController(ctx.db);
      return controller.setSortState(
        input.viewId,
        ctx.session.user.id,
        input.sorting as Prisma.JsonArray,
      );
    }),
});

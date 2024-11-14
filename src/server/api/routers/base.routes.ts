import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { BaseController } from "../controllers/base.controller";
import { z } from "zod";

export const baseRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const controller = new BaseController(ctx.db);

    const { user } = ctx.session;

    return controller.create(user.id);
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const controller = new BaseController(ctx.db);

    const { user } = ctx.session;

    return controller.getAll(user.id);
  }),

  get: protectedProcedure
    .input(
      z.object({
        baseId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const controller = new BaseController(ctx.db);

      const { baseId } = input;
      const { user } = ctx.session;

      return controller.get(baseId, user.id);
    }),
});

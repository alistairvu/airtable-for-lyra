import { z } from "zod";

export const columnSortSchema = z.object({
  desc: z.boolean(),
  id: z.string(),
});

export const sortingStateSchema = z.array(columnSortSchema);

export const intFilterSchema = z.object({
  mode: z.enum(["lt", "gt"]),
  value: z.number().nullable(),
});

export const columnFiltersSchema = z.array(
  z.object({
    id: z.string(),
    value: z.union([z.boolean(), intFilterSchema]),
  }),
);

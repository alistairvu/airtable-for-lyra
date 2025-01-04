import { parseAsJson, useQueryState } from "nuqs";
import { type z } from "zod";
import { columnFiltersSchema } from "~/schemas/sorting.schema";

export const useColumnFilters = (
  defaultFilters: z.infer<typeof columnFiltersSchema> = [],
) =>
  useQueryState(
    "filters",
    parseAsJson((value) => columnFiltersSchema.parse(value)).withDefault(
      defaultFilters,
    ),
  );

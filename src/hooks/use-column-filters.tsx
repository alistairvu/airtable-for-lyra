import { parseAsJson, useQueryState } from "nuqs";
import { z } from "zod";
import { columnFiltersSchema } from "~/schemas/sorting.schema";

export const useColumnFilters = (
  defaultFilters: z.infer<typeof columnFiltersSchema> = [],
) =>
  useQueryState(
    "filters",
    parseAsJson(columnFiltersSchema.parse).withDefault(defaultFilters),
  );

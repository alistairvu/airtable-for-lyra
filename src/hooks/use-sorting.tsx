import { type SortingState } from "@tanstack/react-table";
import { parseAsJson, useQueryState } from "nuqs";
import { sortingStateSchema } from "~/schemas/sorting.schema";

export const useSorting = (defaultState: SortingState = []) =>
  useQueryState<SortingState>(
    "sort",
    parseAsJson((value) => sortingStateSchema.parse(value)).withDefault(
      defaultState,
    ),
  );

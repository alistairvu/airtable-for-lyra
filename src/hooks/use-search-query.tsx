import { parseAsString, useQueryState } from "nuqs";

export const useSearchQuery = () =>
  useQueryState("search", parseAsString.withDefault(""));

import { CommandLoading } from "cmdk";

import { SearchResultSkeletonRows } from "./SearchResultSkeletonRows";

export const SearchResultsLoadingState = () => (
  <CommandLoading>
    <SearchResultSkeletonRows />
  </CommandLoading>
);

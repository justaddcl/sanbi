import { CommandLoading } from "cmdk";

import { CommandEmpty } from "@components/ui/command";

import { SearchResultSkeletonRows } from "./SearchResultSkeletonRows";

export const SearchResultsLoadingState = () => (
  <CommandLoading>
    <SearchResultSkeletonRows />
  </CommandLoading>
);

export const SearchResultsErrorState = () => (
  <CommandEmpty>
    Search is unavailable. Please try again in a moment.
  </CommandEmpty>
);

type SearchResultsEmptyStateProps = {
  message: string;
};

export const SearchResultsEmptyState = ({
  message,
}: SearchResultsEmptyStateProps) => <CommandEmpty>{message}</CommandEmpty>;

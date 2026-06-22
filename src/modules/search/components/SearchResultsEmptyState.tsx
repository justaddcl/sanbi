import { CommandEmpty } from "@components/ui/command";

type SearchResultsEmptyStateProps = {
  message: string;
};

export const SearchResultsEmptyState = ({
  message,
}: SearchResultsEmptyStateProps) => <CommandEmpty>{message}</CommandEmpty>;

import { Skeleton } from "@components/ui/skeleton";
import { HStack } from "@components/HStack";

export const SearchResultSkeletonRows = () => (
  <div className="grid gap-1 px-1" aria-label="Searching songs and tags">
    {Array.from({ length: 4 }).map((_, index) => (
      <HStack
        key={`search-result-skeleton-${index}`}
        className="items-start gap-3 rounded-md px-3 py-3"
      >
        <Skeleton className="mt-1 size-4 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <HStack className="items-center gap-2">
            <Skeleton className="h-4 w-44 max-w-[70%]" />
            <Skeleton className="h-5 w-6" />
          </HStack>
          <HStack className="items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </HStack>
        </div>
      </HStack>
    ))}
  </div>
);

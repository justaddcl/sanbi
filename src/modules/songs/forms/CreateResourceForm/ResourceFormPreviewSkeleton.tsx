import { Skeleton } from "@components/ui/skeleton";

export const ResourceFormPreviewSkeleton = () => (
  <div
    aria-label="Loading resource preview"
    className="grid grid-cols-[64px_1fr] gap-3 rounded-md border bg-slate-50 p-3"
    role="status"
  >
    <Skeleton className="size-16 rounded" />
    <div className="flex min-w-0 flex-col gap-2 py-1">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
    </div>
  </div>
);

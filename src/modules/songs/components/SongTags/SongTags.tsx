import { type RouterOutputs } from "@/trpc/react";
import { Badge } from "@components/Badge";
import { HStack } from "@components/HStack";
import { Skeleton } from "@components/ui/skeleton";

type SongTagsProps = {
  tags: RouterOutputs["song"]["get"]["tags"];
  isLoading?: boolean;
};

export const SongTags: React.FC<SongTagsProps> = ({ tags, isLoading }) => {
  return (
    <HStack as="dd" className="gap-2">
      {isLoading && (
        <>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
        </>
      )}
      {!isLoading &&
        tags?.map((tag) => <Badge key={tag.tagId} label={tag.tag.tag} />)}
    </HStack>
  );
};

"use client";

import { type RouterOutputs } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import { SongTagSelector } from "../SongTagSelector/SongTagSelector";

type SongTagsProps = {
  songTags: RouterOutputs["song"]["get"]["songTags"];
  organizationId: string;
  isLoading?: boolean;
};

export const SongTags: React.FC<SongTagsProps> = ({
  songTags,
  organizationId,
  isLoading,
}) => {
  return (
    <HStack as="dd" className="flex-wrap gap-2">
      {isLoading && (
        <>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
        </>
      )}
      {!isLoading &&
        songTags?.map((tag) => (
          // TODO: make these badges have a remove cue and onClick delete songTag mutation
          <Badge variant="secondary" key={tag.tagId}>
            {tag.tag.tag}
          </Badge>
        ))}
      <SongTagSelector songTags={songTags} organizationId={organizationId} />
    </HStack>
  );
};

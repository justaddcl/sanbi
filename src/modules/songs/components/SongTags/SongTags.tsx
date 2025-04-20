"use client";

import { type RouterOutputs } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import { SongTagSelector } from "../SongTagSelector/SongTagSelector";
import { useRouter } from "next/navigation";

type SongTagsProps = {
  songTags: RouterOutputs["song"]["get"]["songTags"];
  songId: RouterOutputs["song"]["get"]["id"];
  organizationId: string;
  isLoading?: boolean;
  refreshOnTagUpdate: boolean;
};

export const SongTags: React.FC<SongTagsProps> = ({
  songTags,
  songId,
  organizationId,
  isLoading,
  refreshOnTagUpdate,
}) => {
  const router = useRouter();
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
        // TODO: sort these tags alphabetically
        songTags?.map((tag) => (
          // TODO: make these badges have a remove cue and onClick delete songTag mutation
          <Badge variant="secondary" key={tag.tagId}>
            {tag.tag.tag}
          </Badge>
        ))}
      <SongTagSelector
        songId={songId}
        organizationId={organizationId}
        onTagUpdate={refreshOnTagUpdate ? () => router.refresh() : undefined}
      />
    </HStack>
  );
};

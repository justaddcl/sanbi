"use client";

import { api, type RouterOutputs } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import { SongTagSelector } from "../SongTagSelector/SongTagSelector";

type SongTagsProps = {
  songId: RouterOutputs["song"]["get"]["id"];
  organizationId: string;
};

export const SongTags: React.FC<SongTagsProps> = ({
  songId,
  organizationId,
}) => {
  const [tagIdPendingDeletion, setTagIdPendingDeletion] = useState<
    string | null
  >(null);

  const deleteSongTagMutation = api.songTag.delete.useMutation();
  const apiUtils = api.useUtils();

  const {
    data: songTags,
    isLoading: isSongTagsQueryLoading,
    error: songTagsQueryError,
  } = api.songTag.getBySongId.useQuery({
    songId,
    organizationId,
  });

  const deleteSongTag = (tagId: string) => {
    const toastId = toast.loading("Removing tag...");

    setTagIdPendingDeletion(tagId);

    deleteSongTagMutation.mutate(
      {
        organizationId,
        songId,
        tagId,
      },
      {
        async onSuccess() {
          toast.success("Tag removed", { id: toastId });

          await apiUtils.songTag.getBySongId.invalidate({
            songId,
            organizationId,
          });
          await apiUtils.song.get.invalidate({
            songId,
            organizationId,
          });
        },
        onError(deleteError) {
          toast.error(`Could not remove tag: ${deleteError.message}`, {
            id: toastId,
          });
        },
        onSettled() {
          setTagIdPendingDeletion(null);
        },
      },
    );
  };

  if (songTagsQueryError) {
    toast.error(
      `Could not the tags for this song: ${songTagsQueryError.message}`,
    );
    return null;
  }

  if (isSongTagsQueryLoading) {
    return <HStack className="gap-2"></HStack>;
  }

  return (
    <HStack as="dd" className="flex-wrap items-start gap-2">
      {isSongTagsQueryLoading && (
        <>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
        </>
      )}
      {!isSongTagsQueryLoading &&
        songTags?.map((tag) => (
          <Badge
            variant="secondary"
            key={tag.tagId}
            dismissable
            onClose={() => {
              deleteSongTag(tag.tagId);
            }}
            onClosePending={tagIdPendingDeletion === tag.tagId}
          >
            {tag.tag.tag}
          </Badge>
        ))}
      <SongTagSelector songId={songId} organizationId={organizationId} />
    </HStack>
  );
};

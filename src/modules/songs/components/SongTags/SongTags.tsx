"use client";

import { api, type RouterOutputs } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import { useEffect, useState } from "react";
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
  /**
   * TODO: after the POC is working and we're ready for the last 10% polish
   * perhaps we can think of changing this to a Set instead of just one string
   * to enable multiple simultaneous deletions
   */
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

  useEffect(() => {
    if (songTagsQueryError) {
      toast.error(
        `Could not get the tags for this song: ${songTagsQueryError.message}`,
      );
    }
  }, [songTagsQueryError]);

  if (songTagsQueryError) {
    return null;
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

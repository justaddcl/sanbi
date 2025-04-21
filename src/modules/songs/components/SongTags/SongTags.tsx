"use client";

import { api, type RouterOutputs } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import { SongTagSelector } from "../SongTagSelector/SongTagSelector";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCallback, useState } from "react";

type SongTag = RouterOutputs["song"]["get"]["songTags"][number];

const compareSongTags = (songTagA: SongTag, songTagB: SongTag): number =>
  songTagA.tag.tag.localeCompare(songTagB.tag.tag);

type SongTagsProps = {
  songTags: SongTag[];
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

  const sortedSongTags = songTags.toSorted(compareSongTags);

  const [tagIdPendingDeletion, setTagIdPendingDeletion] = useState<
    string | null
  >(null);

  const deleteSongTagMutation = api.songTag.delete.useMutation();
  const apiUtils = api.useUtils();

  const onTagUpdate = useCallback(() => {
    if (refreshOnTagUpdate) {
      router.refresh();
    }
  }, [refreshOnTagUpdate, router]);

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

          onTagUpdate?.();
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

  return (
    <HStack as="dd" className="flex-wrap items-start gap-2">
      {isLoading && (
        <>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
        </>
      )}
      {!isLoading &&
        sortedSongTags.map((tag: SongTag) => (
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
      <SongTagSelector
        songId={songId}
        organizationId={organizationId}
        onTagUpdate={onTagUpdate}
      />
    </HStack>
  );
};

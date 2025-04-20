"use client";

import { api, type RouterOutputs } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import { SongTagSelector } from "../SongTagSelector/SongTagSelector";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

  const deleteSongTagMutation = api.songTag.delete.useMutation();
  const apiUtils = api.useUtils();

  const onTagUpdate = refreshOnTagUpdate ? () => router.refresh() : undefined;

  const deleteSongTag = (tagId: string) => {
    const toastId = toast.loading("Removing tag...");

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
      },
    );
  };

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
          <Badge
            variant="secondary"
            key={tag.tagId}
            dismissable
            onClose={() => {
              deleteSongTag(tag.tagId);
            }}
            onClosePending={deleteSongTagMutation.isPending}
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

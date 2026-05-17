"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@components/ui/select";
import { SongKey } from "@components/SongKey";
import { type SongKey as SongKeyType, songKeys } from "@lib/constants";
import { formatSongKey } from "@lib/string/formatSongKey";
import { trpc } from "@lib/trpc";
import { type Song } from "@lib/types";
import { type UserData } from "@lib/types/api";

type SongKeySelectProps = {
  songId: string;
  preferredKey: Song["preferredKey"];
  userMembership: NonNullable<UserData>["memberships"][number];
};

export const SongKeySelect: React.FC<SongKeySelectProps> = ({
  songId,
  preferredKey,
  userMembership,
}) => {
  const updateSongPreferredKeyMutation =
    trpc.song.updatePreferredKey.useMutation();
  const router = useRouter();
  const [songKey, setSongKey] = useState<Song["preferredKey"]>(
    preferredKey ?? null,
  );

  const updateSongPreferredKey = (newKey: SongKeyType) => {
    if (!newKey) {
      toast.error("Please select a key to update the preferred key to");
      return;
    }
    const toastId = toast.loading("Updating preferred key");

    updateSongPreferredKeyMutation.mutate(
      {
        organizationId: userMembership.organizationId,
        songId,
        preferredKey: newKey,
      },
      {
        onSuccess() {
          toast.success("Preferred key updated", { id: toastId });
          router.refresh();
        },
        onError(updateError) {
          toast.error(
            `Could not update preferred key: ${updateError.message}`,
            { id: toastId },
          );
          setSongKey(preferredKey);
        },
      },
    );
  };

  const handleKeySelect = (newKey: SongKeyType) => {
    setSongKey(newKey);
    // TODO: possibly worth looking into if a debounced update might be worth adding here
    updateSongPreferredKey(newKey);
  };

  return (
    <Select onValueChange={handleKeySelect} defaultValue={songKey as string}>
      <SelectTrigger className="h-auto w-auto gap-2 border-none bg-transparent p-0 hover:bg-accent hover:text-accent-foreground">
        <SongKey songKey={songKey} size="large" />
      </SelectTrigger>
      <SelectContent>
        {songKeys.map((key) => {
          return (
            <SelectItem key={key} value={key}>
              {formatSongKey(key)}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

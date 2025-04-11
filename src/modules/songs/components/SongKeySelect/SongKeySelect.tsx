"use client";

import { api } from "@/trpc/react";
import { SongKey } from "@components/SongKey";
import { Button } from "@components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@components/ui/select";
import { type SongKey as SongKeyType, songKeys } from "@lib/constants";
import { formatSongKey } from "@lib/string/formatSongKey";
import { type Song } from "@lib/types";
import { type UserData } from "@lib/types/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
    api.song.updatePreferredKey.useMutation();
  const router = useRouter();
  const [songKey, setSongKey] = useState<Song["preferredKey"]>(preferredKey);

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
    updateSongPreferredKey(newKey);
  };

  return (
    <Select onValueChange={handleKeySelect} defaultValue={songKey as string}>
      <SelectTrigger className="w-auto gap-2 border-none p-0">
        <Button variant="ghost" className="p-0">
          <SongKey songKey={songKey} size="large" />
        </Button>
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

"use client";

import { CommandDialog } from "@components/ui/command";
import { useAuth } from "@clerk/nextjs";
import { Text } from "@components/Text";
import { useUserQuery } from "@modules/users/api/queries";
import { redirect } from "next/navigation";
import { useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@components/ui/dialog";
import {
  SongSearch,
  type SongSearchResult,
} from "@modules/songs/components/SongSearch";

type SongSearchDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSongSelect?: (selectedSong?: SongSearchResult) => void;
};

export const SongSearchDialog: React.FC<SongSearchDialogProps> = ({
  open,
  setOpen,
}) => {
  const { userId, isLoaded } = useAuth();

  const [selectedSong, setSelectedSong] = useState<SongSearchResult | null>(
    null,
  );

  if (!userId) {
    redirect("/");
  }

  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
  } = useUserQuery({ userId });
  const userMembership = userData?.memberships[0];

  if (!isLoaded) {
    return <Text>Loading auth...</Text>;
  }

  if (userQueryLoading) {
    return <Text>Getting user...</Text>;
  }

  const handleSongSelect = (song?: SongSearchResult) => {
    if (!!song) {
      setSelectedSong(song);
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
      shouldFilter={false}
      fixed
    >
      <SongSearch onSongSelect={handleSongSelect} />
    </CommandDialog>
  );
};

"use client";

import { CommandDialog } from "@components/ui/command";
import { useAuth } from "@clerk/nextjs";
import { Text } from "@components/Text";
import { redirect } from "next/navigation";
import { useState } from "react";
import {
  SongSearch,
  type SongSearchResult,
} from "@modules/songs/components/SongSearch";
import { type SetSectionWithSongs } from "@lib/types";
import { ConfigureSongForSet } from "../ConfigureSongForSet/ConfigureSongForSet";

export type SongSearchDialogSteps = "search" | "configure";

type SongSearchDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSongSelect?: (selectedSong?: SongSearchResult) => void;
  existingSetSections: SetSectionWithSongs[];
};

export const SongSearchDialog: React.FC<SongSearchDialogProps> = ({
  open,
  setOpen,
  existingSetSections,
}) => {
  const { userId, isLoaded } = useAuth();

  const [dialogStep, setDialogStep] = useState<SongSearchDialogSteps>("search");
  const [selectedSong, setSelectedSong] = useState<SongSearchResult | null>(
    null,
  );

  if (!userId) {
    redirect("/");
  }

  if (!isLoaded) {
    return <Text>Loading auth...</Text>;
  }

  const handleSongSelect = (song?: SongSearchResult) => {
    if (!!song) {
      setSelectedSong(song);
      setDialogStep("configure");
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);

        if (!open) {
          setSelectedSong(null);
        }

        setDialogStep("search");
      }}
      shouldFilter={false}
      fixed
      hasDialogContentComponentStyling={dialogStep === "configure"}
      animated={dialogStep !== "configure"}
    >
      {dialogStep === "search" && (
        <SongSearch onSongSelect={handleSongSelect} />
      )}
      {dialogStep === "configure" && !!selectedSong && (
        <ConfigureSongForSet
          existingSetSections={existingSetSections}
          selectedSong={selectedSong}
          setDialogStep={setDialogStep}
        />
      )}
    </CommandDialog>
  );
};

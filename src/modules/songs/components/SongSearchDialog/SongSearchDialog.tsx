"use client";

import { useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { CommandDialog } from "@components/ui/command";
import { Text } from "@components/Text";
import {
  SongSearch,
  type SongSearchResult,
} from "@modules/songs/components/SongSearch";
import { type SetSectionWithSongs } from "@lib/types";

import {
  ConfigureSongForSet,
  type ConfigureSongForSetProps,
} from "../ConfigureSongForSet/ConfigureSongForSet";

export type SongSearchDialogSteps = "search" | "configure";

type SongSearchDialogProps = {
  open: boolean;
  onSongSelect?: (selectedSong?: SongSearchResult) => void;
  // TODO: remove prop if unnecessary
  existingSetSections: SetSectionWithSongs[];
  setId: string;
  prePopulatedSetSectionId?: ConfigureSongForSetProps["prePopulatedSetSectionId"];
};

export const SongSearchDialog: React.FC<SongSearchDialogProps> = ({
  open,
  existingSetSections,
  setId,
  prePopulatedSetSectionId,
}) => {
  const searchParams = useSearchParams();
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

  const setOpen = (isOpen: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    if (isOpen) {
      params.set("addSongDialogOpen", "1");
    } else {
      if (params.has("addSongDialogOpen")) {
        params.delete("addSongDialogOpen");
      }

      if (params.has("setSectionId")) {
        params.delete("setSectionId");
      }
    }

    window.history.pushState(null, "", `?${params.toString()}`);
  };

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
      minimalPadding
    >
      {dialogStep === "search" && (
        <SongSearch onSongSelect={handleSongSelect} />
      )}
      {dialogStep === "configure" && !!selectedSong && (
        <ConfigureSongForSet
          existingSetSections={existingSetSections}
          selectedSong={selectedSong}
          setDialogStep={setDialogStep}
          onSubmit={() => {
            setOpen(false);
          }}
          setId={setId}
          prePopulatedSetSectionId={prePopulatedSetSectionId}
        />
      )}
    </CommandDialog>
  );
};

"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { CommandDialog } from "@components/ui/command";
import { Text } from "@components/Text";
import { useSongSearchResults } from "@modules/search/hooks/useSongSearchResults";
import {
  SongSearchContent,
  type SongSearchResult,
} from "@modules/songs/components/SongSearch";
import { trpc } from "@lib/trpc";
import { type SetSectionWithSongs } from "@lib/types";

import {
  ConfigureSongForSet,
  type ConfigureSongForSetProps,
} from "../ConfigureSongForSet/ConfigureSongForSet";

export type SongSearchDialogSteps = "search" | "configure";

type SongSearchDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onSongSelect?: (selectedSong?: SongSearchResult) => void;
  // TODO: remove prop if unnecessary
  existingSetSections: SetSectionWithSongs[];
  setId: string;
  prePopulatedSetSectionId?: ConfigureSongForSetProps["prePopulatedSetSectionId"];
  preSelectedSongId?: string | null;
};

export const SongSearchDialog: React.FC<SongSearchDialogProps> = ({
  open,
  onOpenChange,
  existingSetSections,
  setId,
  prePopulatedSetSectionId,
  preSelectedSongId,
}) => {
  const searchParams = useSearchParams();
  const params = useParams<{ organization?: string }>();
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [dialogStep, setDialogStep] = useState<SongSearchDialogSteps>("search");
  const [selectedSong, setSelectedSong] = useState<SongSearchResult | null>(
    null,
  );
  const [dismissedPreSelectedSongId, setDismissedPreSelectedSongId] = useState<
    string | null
  >(null);
  const songSearchState = useSongSearchResults({
    organizationId: params.organization,
  });
  const { data: preSelectedSong, isLoading: isPreSelectedSongLoading } =
    trpc.song.get.useQuery(
      {
        organizationId: params.organization ?? "",
        songId: preSelectedSongId ?? "",
      },
      {
        enabled: open && !!preSelectedSongId && !!params.organization,
      },
    );

  const preSelectedSongResult =
    preSelectedSong && dismissedPreSelectedSongId !== preSelectedSongId
      ? {
          songId: preSelectedSong.id,
          name: preSelectedSong.name,
          preferredKey: preSelectedSong.preferredKey,
          isArchived: preSelectedSong.isArchived,
          similarityScore: 0,
          tags: [],
          matchedTags: [],
          lastPlayedDate: null,
        }
      : null;
  const activeSelectedSong = selectedSong ?? preSelectedSongResult;
  const activeDialogStep = activeSelectedSong ? "configure" : dialogStep;

  if (!userId) {
    router.replace("/");
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

      if (params.has("songId")) {
        params.delete("songId");
      }
    }

    const queryString = params.toString();
    window.history.pushState(
      null,
      "",
      queryString ? `?${queryString}` : window.location.pathname,
    );
    onOpenChange?.(isOpen);
  };

  const resetDialogState = () => {
    setSelectedSong(null);
    setDismissedPreSelectedSongId(null);
    setDialogStep("search");
    songSearchState.resetSearchInput();
  };

  const closeDialog = () => {
    setOpen(false);
    resetDialogState();
  };

  const handleSongSelect = (song: SongSearchResult) => {
    setSelectedSong(song);
    setDialogStep("configure");
  };

  const handleDialogStepChange: Dispatch<
    SetStateAction<SongSearchDialogSteps>
  > = (nextStepValue) => {
    const nextStep =
      typeof nextStepValue === "function"
        ? nextStepValue(dialogStep)
        : nextStepValue;

    if (nextStep === "search") {
      setSelectedSong(null);
      setDismissedPreSelectedSongId(preSelectedSongId ?? null);
      songSearchState.resetSearchInput();
    }

    setDialogStep(nextStep);
  };

  return (
    <CommandDialog
      dialogTitle="Search songs"
      open={open}
      onOpenChange={(open) => {
        setOpen(open);

        if (!open) {
          resetDialogState();
        }
      }}
      shouldFilter={false}
      fixed
      hasDialogContentComponentStyling={activeDialogStep === "configure"}
      animated={activeDialogStep !== "configure"}
      minimalPadding
      autoFocusInput={open && activeDialogStep === "search"}
      onEscapeKeyDown={(event) => {
        if (activeDialogStep !== "search") {
          return;
        }

        songSearchState.handleSearchEscapeKeyDown(event);
      }}
    >
      {activeDialogStep === "search" && isPreSelectedSongLoading && (
        <Text>Loading song...</Text>
      )}
      {activeDialogStep === "search" && !isPreSelectedSongLoading && (
        <SongSearchContent
          searchState={songSearchState}
          onSongSelect={handleSongSelect}
        />
      )}
      {activeDialogStep === "configure" && !!activeSelectedSong && (
        <ConfigureSongForSet
          existingSetSections={existingSetSections}
          selectedSong={activeSelectedSong}
          setDialogStep={handleDialogStepChange}
          onSubmit={closeDialog}
          setId={setId}
          prePopulatedSetSectionId={prePopulatedSetSectionId}
        />
      )}
    </CommandDialog>
  );
};

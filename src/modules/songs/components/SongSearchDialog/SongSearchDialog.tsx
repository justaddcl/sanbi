"use client";

import {
  type Dispatch,
  type SetStateAction,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { CommandDialog } from "@components/ui/command";
import { Text } from "@components/Text";
import {
  SongSearch,
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
  organizationId: string;
  prePopulatedSetSectionId?: ConfigureSongForSetProps["prePopulatedSetSectionId"];
  prePopulatedSongId?: string;
};

export const SongSearchDialog: React.FC<SongSearchDialogProps> = ({
  open,
  onOpenChange,
  existingSetSections,
  setId,
  organizationId,
  prePopulatedSetSectionId,
  prePopulatedSongId,
}) => {
  const searchParams = useSearchParams();
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [dialogStep, setDialogStep] = useState<SongSearchDialogSteps>("search");
  const [selectedSong, setSelectedSong] = useState<SongSearchResult | null>(
    null,
  );
  const [ignoredPrePopulatedSongId, setIgnoredPrePopulatedSongId] = useState<
    string | null
  >(null);
  const {
    data: prePopulatedSong,
    isLoading: isPrePopulatedSongLoading,
    isError: isPrePopulatedSongError,
  } = trpc.song.get.useQuery(
    { organizationId, songId: prePopulatedSongId! },
    { enabled: open && !!prePopulatedSongId },
  );

  const prePopulatedSongSearchResult = useMemo<SongSearchResult>(() => {
    if (!prePopulatedSong) {
      return undefined;
    }

    return {
      songId: prePopulatedSong.id,
      name: prePopulatedSong.name,
      preferredKey: prePopulatedSong.preferredKey,
      isArchived: prePopulatedSong.isArchived,
      similarityScore: 1,
      lastPlayedDate: null,
      tags: [],
    };
  }, [prePopulatedSong]);

  const canUsePrePopulatedSong =
    open &&
    !!prePopulatedSongId &&
    ignoredPrePopulatedSongId !== prePopulatedSongId;
  const activeDialogStep =
    canUsePrePopulatedSong && prePopulatedSongSearchResult
      ? "configure"
      : dialogStep;
  const activeSelectedSong =
    canUsePrePopulatedSong && prePopulatedSongSearchResult
      ? prePopulatedSongSearchResult
      : selectedSong;
  const showPrePopulatedSongLoader =
    canUsePrePopulatedSong &&
    isPrePopulatedSongLoading &&
    !isPrePopulatedSongError;
  const showSongSearch =
    activeDialogStep === "search" &&
    (!canUsePrePopulatedSong ||
      isPrePopulatedSongError ||
      !isPrePopulatedSongLoading);

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

  const handleSongSelect = (song?: SongSearchResult) => {
    if (!!song) {
      setSelectedSong(song);
      setDialogStep("configure");
    }
  };

  const handleDialogStepChange: Dispatch<
    SetStateAction<SongSearchDialogSteps>
  > = (nextStep) => {
    const resolvedStep =
      typeof nextStep === "function" ? nextStep(dialogStep) : nextStep;

    if (resolvedStep === "search" && prePopulatedSongId) {
      setIgnoredPrePopulatedSongId(prePopulatedSongId);
    }

    setDialogStep(resolvedStep);
  };

  return (
    <CommandDialog
      dialogTitle="Search songs"
      open={open}
      onOpenChange={(open) => {
        setOpen(open);

        if (!open) {
          setSelectedSong(null);
          setIgnoredPrePopulatedSongId(null);
        }

        setDialogStep("search");
      }}
      shouldFilter={false}
      fixed
      hasDialogContentComponentStyling={activeDialogStep === "configure"}
      animated={activeDialogStep !== "configure"}
      minimalPadding
      autoFocusInput={open && activeDialogStep === "search"}
    >
      {activeDialogStep === "search" && (
        <>
          {showPrePopulatedSongLoader && (
            <div className="px-4 py-8 text-center">
              <Text>Getting song...</Text>
            </div>
          )}
          {showSongSearch && <SongSearch onSongSelect={handleSongSelect} />}
        </>
      )}
      {activeDialogStep === "configure" && !!activeSelectedSong && (
        <ConfigureSongForSet
          existingSetSections={existingSetSections}
          selectedSong={activeSelectedSong}
          setDialogStep={handleDialogStepChange}
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

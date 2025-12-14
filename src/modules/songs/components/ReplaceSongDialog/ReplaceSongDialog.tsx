"use client";

import { useState } from "react";
import { ArrowRight, CaretLeft } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@components/ui/button";
import {
  CommandDialog,
  CommandGroup,
  CommandList,
} from "@components/ui/command";
import { DialogDescription, DialogTitle } from "@components/ui/dialog";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import {
  SongSearch,
  type SongSearchResult,
} from "@modules/songs/components/SongSearch";
import { useUserQuery } from "@modules/users/api/queries";
import { type SetSectionSongWithSongData } from "@lib/types";
import { cn } from "@lib/utils";
import { api } from "@/trpc/react";

export type ReplaceSongDialogSteps = "search" | "confirm";

type ReplaceSongDialogProps = {
  /** is the dialog open? */
  open: boolean;

  /** callback to set the open state of the dialog */
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /** event callback when a song is selected during the search step */
  onSongSelect?: (selectedSong?: SongSearchResult) => void;

  /** set section song object */
  currentSong: SetSectionSongWithSongData;

  /** the ID of the set the set section song is attached to */
  setId: string;
};

export const ReplaceSongDialog: React.FC<ReplaceSongDialogProps> = ({
  open,
  setOpen,
  onSongSelect,
  currentSong,
  setId,
}) => {
  const apiUtils = api.useUtils();
  const {
    data: userData,
    isLoading: userQueryLoading,
    isAuthLoaded,
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  const [dialogStep, setDialogStep] =
    useState<ReplaceSongDialogSteps>("search");
  const [selectedSong, setSelectedSong] = useState<SongSearchResult | null>(
    null,
  );

  const replaceSongMutation =
    api.setSectionSong.replaceSong.useMutation<Error>();

  if (!userData || !userMembership) {
    return null;
  }

  if (!isAuthLoaded || userQueryLoading) {
    return (
      <CommandDialog open={open} onOpenChange={setOpen}>
        <HStack className="items-center justify-center p-4">
          <Text>Loading...</Text>
        </HStack>
      </CommandDialog>
    );
  }

  const handleSongSelect = (song?: SongSearchResult) => {
    if (song) {
      setSelectedSong(song);
      setDialogStep("confirm");
      onSongSelect?.(song);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedSong(null);
    setDialogStep("search");
  };

  const handleOnConfirm = () => {
    if (selectedSong) {
      if (selectedSong.songId === currentSong.songId) {
        toast.error("Cannot replace a song with itself");
        return;
      }

      toast.loading("Replacing song...");
      replaceSongMutation.mutate(
        {
          organizationId: userMembership.organizationId,
          setSectionSongId: currentSong.id,
          replacementSongId: selectedSong?.songId,
        },
        {
          async onSuccess() {
            toast.dismiss();
            toast.success("Song replaced");
            handleCloseDialog();
            await apiUtils.set.get.invalidate({ setId });
          },

          async onError() {
            toast.dismiss();
            toast.error("Song could not be replaced");
          },
        },
      );
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
      hasDialogContentComponentStyling={dialogStep === "confirm"}
      animated={dialogStep !== "confirm"}
      minimalPadding
      className={cn([dialogStep === "confirm" && "max-w-lg"])}
    >
      {dialogStep === "search" && (
        <SongSearch onSongSelect={handleSongSelect} />
      )}
      {dialogStep === "confirm" && !!selectedSong && (
        <CommandList className="max-h-[calc(100dvh_-_24px)] text-center md:max-h-[calc(100dvh_-_12dvh_-_5dvh)]">
          <CommandGroup>
            <div className="grid grid-cols-[40px_1fr_40px] items-center">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setDialogStep("search")}
              >
                <CaretLeft />
              </Button>
              <DialogTitle className="text-center">Replace song</DialogTitle>
            </div>
            <DialogDescription className="mt-2" asChild>
              <VStack className="gap-8 px-4">
                <Text className="text-slate-900">
                  Are you sure you want to replace the current song with the
                  selected one?
                </Text>
                <div className="grid grid-cols-[1fr_16px_1fr] gap-2">
                  <Text className="text-slate-500">Current song</Text>
                  <Text className="col-start-3 text-slate-900">New song</Text>
                  <div className="flex h-full items-center gap-4 rounded border border-slate-200 px-2 py-1 text-slate-500 md:px-4 md:py-2">
                    <Text asElement="span" className="font-medium">
                      {currentSong.song.name}
                    </Text>
                  </div>
                  <ArrowRight
                    className="self-center text-slate-900"
                    size={16}
                  />
                  <div className="flex h-full items-center gap-4 rounded border border-slate-400 px-2 py-1 text-slate-900 md:px-4 md:py-2">
                    <Text asElement="span" className="font-medium">
                      {selectedSong.name}
                    </Text>
                  </div>
                </div>
                <HStack className="justify-end gap-2">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleOnConfirm}>Replace song</Button>
                </HStack>
              </VStack>
            </DialogDescription>
          </CommandGroup>
        </CommandList>
      )}
    </CommandDialog>
  );
};

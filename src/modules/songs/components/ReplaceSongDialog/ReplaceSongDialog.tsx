"use client";

import {
  CommandDialog,
  CommandGroup,
  CommandList,
} from "@components/ui/command";
import { Text } from "@components/Text";
import { useState } from "react";
import {
  SongSearch,
  type SongSearchResult,
} from "@modules/songs/components/SongSearch";
import { type SetSectionSongWithSongData } from "@lib/types";
import { Button } from "@components/ui/button";
import { ArrowDown, ArrowRight, CaretLeft } from "@phosphor-icons/react";
import { DialogDescription, DialogTitle } from "@components/ui/dialog";
import { HStack } from "@components/HStack";
import { api } from "@/trpc/react";
import { useUserQuery } from "@modules/users/api/queries";
import { toast } from "sonner";
import { cn } from "@lib/utils";
import { VStack } from "@components/VStack";

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
}) => {
  const apiUtils = api.useUtils();
  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
    isAuthLoaded,
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  const [dialogStep, setDialogStep] =
    useState<ReplaceSongDialogSteps>("search");
  const [selectedSong, setSelectedSong] = useState<SongSearchResult | null>(
    null,
  );

  const replaceSongMutation = api.setSectionSong.replaceSong.useMutation();

  if (!userData || !userMembership) {
    return null;
  }

  if (!isAuthLoaded || userQueryLoading) {
    return <Text>Loading...</Text>;
  }

  const handleSongSelect = (song?: SongSearchResult) => {
    if (!!song) {
      setSelectedSong(song);
      setDialogStep("confirm");
      onSongSelect?.(song);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedSong(null);
  };

  const handleOnConfirm = () => {
    toast.loading("Replacing song...");
    if (selectedSong) {
      if (selectedSong.songId === currentSong.songId) {
        toast.dismiss();
      }

      replaceSongMutation.mutate(
        {
          organizationId: userMembership.organizationId,
          setSectionSongId: currentSong.id,
          replacementSong: selectedSong?.songId,
        },
        {
          async onSuccess() {
            toast.dismiss();
            toast.success("Song replaced");
            await apiUtils.set.get.invalidate({});
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
        <CommandList className="text-center">
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
            <DialogDescription className="mt-6 flex flex-col gap-6">
              <VStack className="gap-2 text-slate-900">
                <HStack className="items-center gap-4 rounded bg-red-100 px-4 py-1 text-slate-600">
                  <Text asElement="span">-</Text>
                  <Text asElement="span" className="font-medium">
                    {currentSong.song.name}
                  </Text>
                </HStack>
                <ArrowDown className="self-center" />
                <HStack className="gap-4 rounded bg-green-100 px-4 py-1">
                  <Text asElement="span">+</Text>
                  <Text asElement="span" className="font-medium">
                    {selectedSong.name}
                  </Text>
                </HStack>
              </VStack>
              <HStack className="justify-center gap-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleOnConfirm}>Replace song</Button>
              </HStack>
            </DialogDescription>
          </CommandGroup>
        </CommandList>
      )}
    </CommandDialog>
  );
};

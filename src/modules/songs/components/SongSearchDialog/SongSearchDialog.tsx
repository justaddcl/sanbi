"use client";

import { CommandDialog } from "@components/ui/command";
import { useAuth } from "@clerk/nextjs";
import { Text } from "@components/Text";
import { redirect } from "next/navigation";
import { useState } from "react";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import {
  SongSearch,
  type SongSearchResult,
} from "@modules/songs/components/SongSearch";
import { Button } from "@components/ui/button";
import {
  CaretLeft,
  ClockCounterClockwise,
  Heart,
} from "@phosphor-icons/react/dist/ssr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { songKeys } from "@lib/constants";
import { formatSongKey } from "@lib/string/formatSongKey";
import { SongListItem } from "../SongListItem";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";

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

  const [dialogStep, setDialogStep] = useState<"search" | "configure">(
    "search",
  );
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

  const goBackToSearch = () => setDialogStep("search");

  // TODO: temp mock variable - to be deleted
  const currentSetSections = [];

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
        <>
          <DialogHeader>
            {/* FIXME: the title should be aligned center in the center of the dialog */}
            <div className="flex w-1/2 items-center justify-between">
              <Button size="icon" variant="ghost" onClick={goBackToSearch}>
                <CaretLeft />
              </Button>
              <DialogTitle>Add song to set</DialogTitle>
            </div>
            <DialogDescription className="mt-6 flex flex-col gap-6">
              <div
                className="cursor-pointer rounded-lg border p-4 text-slate-900 transition-colors hover:bg-accent"
                onClick={goBackToSearch}
              >
                <SongListItem
                  song={{
                    id: selectedSong.songId,
                    name: selectedSong.name,
                    preferredKey: selectedSong.preferredKey,
                    isArchived: selectedSong.isArchived,
                  }}
                  lastPlayed={selectedSong?.lastPlayedDate}
                  tags={selectedSong?.tags}
                  hidePreferredKey
                />
              </div>
              <section className="flex flex-col gap-2">
                <Text style="header-small-semibold">Key</Text>
                <Select defaultValue={selectedSong.preferredKey as string}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select song key" />
                  </SelectTrigger>
                  <SelectContent>
                    {songKeys.map((key) => (
                      <SelectItem key={key} value={key}>
                        {formatSongKey(key)}{" "}
                        {key === selectedSong.preferredKey && "(preferred key)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <Heart />
                    <Text style="small">
                      Preferred key: {formatSongKey(selectedSong.preferredKey!)}
                      {/* used the non-null assertion since all songs should have a selected key */}
                    </Text>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockCounterClockwise />
                    {/* TODO: get the key the song was last played in - this is a new query */}
                    <Text style="small">Last played:</Text>
                  </div>
                </div>
              </section>
              <section className="flex flex-col items-center">
                <Text style="header-small-semibold" className="mb-4 self-start">
                  Which part of the set?
                </Text>
                {/* TODO: render list of current set sections */}
                {/* {currentSetSections.length > 0 && (
                )} */}
                {currentSetSections.length === 0 && (
                  <div className="mb-4 flex w-full flex-col items-center rounded border border-dashed border-slate-200 py-3">
                    <Text
                      style="header-small-semibold"
                      align="center"
                      className="text-slate-900"
                    >
                      No sections yet
                    </Text>
                    <Text align="center" className="">
                      Add one below to get started.
                    </Text>
                  </div>
                )}
              </section>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col gap-2">
            <div className="flex items-center gap-1 self-end md:self-center">
              <Switch id="start-with-last-set-toggle" />
              <Label
                htmlFor="start-with-last-set-toggle"
                className="text-slate-500"
              >
                Add another song
              </Label>
            </div>
            <Button>Add song</Button>
          </DialogFooter>
        </>
      )}
    </CommandDialog>
  );
};

"use client";

import { CommandDialog, CommandGroup } from "@components/ui/command";
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
  Plus,
  X,
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
import { SongListItem } from "@modules/songs/components/SongListItem";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import { Combobox, type ComboboxOption } from "@components/ui/combobox";
import { Input } from "@components/ui/input";
import { cn } from "@lib/utils";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { type SetSectionWithSongs } from "@lib/types";

type NewSetSectionListItem = {
  id: string;
  type: {
    section: string;
  };
  clearable: boolean;
};

type SetSectionListItem = SetSectionWithSongs | NewSetSectionListItem;

type SongSearchDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSongSelect?: (selectedSong?: SongSearchResult) => void;
  existingSetSections: SetSectionWithSongs[];
};

// type guard to type-safely determine what kind of SetSectionListItem the object is
const isClearable = (
  setSectionListItem: SetSectionListItem,
): setSectionListItem is NewSetSectionListItem =>
  (setSectionListItem as NewSetSectionListItem).clearable !== undefined;

export const SongSearchDialog: React.FC<SongSearchDialogProps> = ({
  open,
  setOpen,
  existingSetSections,
}) => {
  const { userId, isLoaded } = useAuth();

  const [dialogStep, setDialogStep] = useState<"search" | "configure">(
    "search",
  );
  const [selectedSong, setSelectedSong] = useState<SongSearchResult | null>(
    null,
  );

  // TODO: replace with DB set section types
  const setSectionTypes: ComboboxOption[] = [
    {
      value: "Full band",
      label: "Full band",
    },
    {
      value: "Offering",
      label: "Offering",
    },
    {
      value: "Prayer",
      label: "Prayer",
    },
    {
      value: "The Lord's Prayer",
      label: "The Lord's Prayer",
    },
  ];

  const [setSectionTypesOptions, setSetSectionTypesOptions] =
    useState<ComboboxOption[]>(setSectionTypes);

  const [setSectionsList, setSetSectionsList] =
    useState<SetSectionListItem[]>(existingSetSections);

  const [isAddingSection, setIsAddingSection] = useState<boolean>(false);

  const [setSectionTypeToAdd, setSetSectionTypeToAdd] = useState<string>("");

  const [isAddSectionComboboxOpen, setIsAddSectionComboboxOpen] =
    useState<boolean>(false);

  const [newSetSectionInputValue, setNewSetSectionInputValue] =
    useState<string>("");

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

  const handleAddSetSection = () => {
    const newSetSectionItem: NewSetSectionListItem = {
      id: setSectionTypeToAdd,
      type: {
        section: setSectionTypeToAdd,
      },
      clearable: true,
    };

    // TODO: add some UI indicator that this section already exists
    if (
      !setSectionsList.some(
        (setSection) => setSection.id === setSectionTypeToAdd,
      )
    ) {
      setSetSectionsList((currentSectionsList) => [
        ...currentSectionsList,
        newSetSectionItem,
      ]);
      setSetSectionTypeToAdd("");
    }
  };

  const handleRemoveTempSetSection = (setSectionIdToRemove: string) => {
    const modifiedSetSectionsList = setSectionsList.filter(
      (setSection) => setSection.id !== setSectionIdToRemove,
    );

    setSetSectionsList(modifiedSetSectionsList);
  };

  const handleNewSetSectionOptionCreate = () => {
    const trimmedInput = newSetSectionInputValue.trim();

    setSetSectionTypesOptions((currentOptions) => [
      ...currentOptions,
      {
        value: trimmedInput,
        label: trimmedInput,
      },
    ]);

    setSetSectionTypeToAdd(trimmedInput);
    setIsAddSectionComboboxOpen(false);
    setNewSetSectionInputValue("");
  };

  const goBackToSearch = () => setDialogStep("search");

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
            <DialogDescription className="text-700 mt-6 flex flex-col gap-6">
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
                <div className="flex gap-2 text-slate-500">
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
              <section className="flex flex-col text-slate-700">
                <Text style="header-small-semibold" className="mb-4 self-start">
                  Which part of the set?
                </Text>
                {/* TODO: render list of current set sections */}
                {setSectionsList.length > 0 && (
                  <RadioGroup className="mb-2">
                    {setSectionsList.map((setSection) => (
                      <div
                        key={setSection.id}
                        className="flex items-center gap-2 rounded border border-slate-200"
                      >
                        <Label
                          htmlFor={setSection.id}
                          className="flex w-full items-center gap-2 px-4 py-3"
                        >
                          <RadioGroupItem
                            value={setSection.id}
                            id={setSection.id}
                          />
                          <Text>{setSection.type.section}</Text>
                        </Label>
                        {isClearable(setSection) && setSection.clearable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mr-2"
                            onClick={() =>
                              handleRemoveTempSetSection(setSection.id)
                            }
                          >
                            <X />
                          </Button>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {setSectionsList.length === 0 && (
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
                {!isAddingSection && (
                  <Button
                    variant="ghost"
                    className="border border-dashed"
                    onClick={() => setIsAddingSection(true)}
                  >
                    <Plus />
                    <Text>Add another section</Text>
                  </Button>
                )}
                {isAddingSection && (
                  <>
                    <Combobox
                      placeholder="Add a set section"
                      options={setSectionTypesOptions}
                      value={setSectionTypeToAdd}
                      onChange={(selectedValue) => {
                        console.log(
                          "🤖 - SongSearchDialog - Combobox - onChange selectedValue",
                          selectedValue,
                        );
                        setSetSectionTypeToAdd(selectedValue);
                      }}
                      open={isAddSectionComboboxOpen}
                      setOpen={setIsAddSectionComboboxOpen}
                    >
                      <CommandGroup heading="Create new section type">
                        <div
                          className={cn(
                            "flex gap-2",
                            "relative cursor-default select-none items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                          )}
                        >
                          <Input
                            size="small"
                            className="flex-1"
                            value={newSetSectionInputValue}
                            onChange={(changeEvent) =>
                              setNewSetSectionInputValue(
                                changeEvent.target.value,
                              )
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-grow-0"
                            onClick={handleNewSetSectionOptionCreate}
                          >
                            <Plus />
                            Create
                          </Button>
                        </div>
                      </CommandGroup>
                    </Combobox>
                    <div className="mt-2 flex justify-end gap-2">
                      {setSectionsList.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsAddingSection(false);
                            setSetSectionTypeToAdd("");
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleAddSetSection}
                        disabled={setSectionTypeToAdd === ""}
                      >
                        Add
                      </Button>
                    </div>
                  </>
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

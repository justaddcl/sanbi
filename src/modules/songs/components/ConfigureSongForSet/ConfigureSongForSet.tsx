import { Combobox, type ComboboxOption } from "@components/ui/combobox";
import { Input } from "@components/ui/input";
import { songKeys } from "@lib/constants";
import { formatSongKey } from "@lib/string/formatSongKey";
import { cn } from "@lib/utils";
import {
  CaretLeft,
  ClockCounterClockwise,
  Heart,
  X,
  Plus,
  CircleNotch,
} from "@phosphor-icons/react/dist/ssr";
import { DialogTitle, DialogDescription } from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import { RadioGroupItem, RadioGroup } from "@components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { SongListItem } from "@modules/songs/components/SongListItem";
import { Button } from "@components/ui/button";
import { Text } from "@components/Text";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { type SetSectionWithSongs } from "@lib/types";
import { type SongSearchResult } from "@modules/songs/components/SongSearch";
import { type SongSearchDialogSteps } from "@modules/songs/components/SongSearchDialog";
import { useUserQuery } from "@modules/users/api/queries";
import { redirect } from "next/navigation";
import { api } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { CommandGroup, CommandList } from "@components/ui/command";
import { useForm } from "react-hook-form";
import { insertSetSectionSongSchema } from "@lib/types/zod";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";
import { toast } from "sonner";

// type guard to type-safely determine what kind of SetSectionListItem the object is
const isClearable = (
  setSectionListItem: SetSectionListItem,
): setSectionListItem is NewSetSectionListItem =>
  (setSectionListItem as NewSetSectionListItem).clearable !== undefined;

type NewSetSectionListItem = {
  id: string;
  type: {
    section: string;
  };
  clearable: boolean;
};

type SetSectionListItem = SetSectionWithSongs | NewSetSectionListItem;

const createSetSectionSongsSchema = insertSetSectionSongSchema
  .pick({
    songId: true,
    setSectionId: true,
    key: true,
  })
  .extend({
    addAnotherSong: z.boolean(),
  });

export type AddSongToSetFormFields = z.infer<
  typeof createSetSectionSongsSchema
>;

type ConfigureSongForSetProps = {
  existingSetSections: SetSectionWithSongs[];
  selectedSong: NonNullable<SongSearchResult>;
  setDialogStep: Dispatch<SetStateAction<SongSearchDialogSteps>>;
  onSubmit?: () => void;
  setId: string;
};

export const ConfigureSongForSet: React.FC<ConfigureSongForSetProps> = ({
  existingSetSections,
  selectedSong,
  setDialogStep,
  onSubmit,
  setId,
}) => {
  const [newSetSectionInputValue, setNewSetSectionInputValue] =
    useState<string>("");

  const [setSectionTypesOptions, setSetSectionTypesOptions] = useState<
    ComboboxOption[]
  >([]);

  const [setSectionsList, setSetSectionsList] =
    useState<SetSectionListItem[]>(existingSetSections);

  const [isAddingSection, setIsAddingSection] = useState<boolean>(
    existingSetSections.length === 0,
  );

  const [setSectionTypeToAdd, setSetSectionTypeToAdd] = useState<string>("");

  const [isAddSectionComboboxOpen, setIsAddSectionComboboxOpen] =
    useState<boolean>(false);

  const addSongToSetForm = useForm<AddSongToSetFormFields>({
    mode: "onBlur",
    resolver: zodResolver(createSetSectionSongsSchema),
    defaultValues: {
      songId: selectedSong.songId,
      setSectionId: undefined,
      key: selectedSong.preferredKey,
      addAnotherSong: false,
    },
  });

  const {
    formState: { isDirty, isSubmitting, isValid, errors },
    setValue,
    getValues,
    watch,
  } = addSongToSetForm;
  // console.log("🚀 ~ isDirty:", isDirty);
  // console.log("🚀 ~ isSubmitting:", isSubmitting);
  // console.log("🚀 ~ isValid:", isValid);
  const watchKey = watch();
  console.log("🚀 ~ watchFields:", watchKey);
  console.log("🚀 ~ errors:", errors);

  const shouldAddSongBeDisabled = !isDirty || !isValid || isSubmitting;

  const addSetSectionSongMutation = api.setSectionSong.create.useMutation();
  const apiUtils = api.useUtils();

  const {
    data: userData,
    isLoading: isUserQueryLoading,
    isAuthLoaded,
  } = useUserQuery();

  const userMembership = userData?.memberships[0];

  if (!userMembership) {
    redirect("/sign-in");
  }

  const {
    data: lastPlayInstance,
    isLoading: isLastPlayInstanceQueryLoading,
    error: lastPlayInstanceQueryError,
  } = api.song.getLastPlayInstance.useQuery({
    organizationId: userMembership.organizationId,
    songId: selectedSong.songId,
  });

  const {
    data: setSectionTypesData,
    error: setSectionTypesQueryError,
    isLoading: isSetSectionTypesQueryLoading,
  } = api.setSectionType.getTypes.useQuery(
    { organizationId: userMembership.organizationId },
    { enabled: !!userMembership },
  );

  useEffect(() => {
    if (
      !isSetSectionTypesQueryLoading &&
      !setSectionTypesQueryError &&
      setSectionTypesData
    ) {
      const setSectionTypes: ComboboxOption[] =
        setSectionTypesData?.map((setSection) => ({
          value: setSection.id,
          label: setSection.section,
        })) ?? [];

      setSetSectionTypesOptions(setSectionTypes);
    }
  }, [
    isSetSectionTypesQueryLoading,
    setSectionTypesData,
    setSectionTypesQueryError,
  ]);

  if (isUserQueryLoading || !isAuthLoaded) {
    return <Text>Loading user data...</Text>;
  }

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

      setValue("setSectionId", setSectionTypeToAdd, {
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: true,
      });

      setSetSectionTypeToAdd("");
    }
  };

  const handleRemoveTempSetSection = (setSectionIdToRemove: string) => {
    const modifiedSetSectionsList = setSectionsList.filter(
      (setSection) => setSection.id !== setSectionIdToRemove,
    );

    setSetSectionsList(modifiedSetSectionsList);

    if (getValues("setSectionId") === setSectionIdToRemove) {
      setValue("setSectionId", "", {
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
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

  const handleAddSongToSetSubmit = async (
    formValues: AddSongToSetFormFields,
  ) => {
    console.log(
      "🚀 ~ ConfigureSongForSet ~ handleAddSongToSetSubmit ~ formValues:",
      formValues,
    );
    const { songId, key, setSectionId, addAnotherSong } = formValues;

    const setSectionToAddTo = existingSetSections.find(
      (setSection) => setSection.id === setSectionId,
    );
    const setSectionSongPosition = setSectionToAddTo!.songs.length; // using non-null assertion since in the happiest path where we don't add any new set sections to the set, this set section already exists
    console.log("🚀 ~ setSectionSongPosition:", setSectionSongPosition);

    await addSetSectionSongMutation.mutateAsync(
      {
        organizationId: userMembership.organizationId,
        songId,
        setSectionId,
        key: key!,
        position: setSectionSongPosition,
      },
      {
        async onSuccess(data) {
          console.log(
            "🤖 [createSetSectionSongMutation/onSuccess] ~ data:",
            data,
          );

          await apiUtils.set.get.invalidate({
            setId,
          });

          toast.success("Song added to the set!");

          if (addAnotherSong) {
            setDialogStep("search");
          } else {
            onSubmit?.();
          }
        },
      },
    );
  };

  const goBackToSearch = () => setDialogStep("search");

  return (
    <CommandList className="max-h-[600px] lg:max-h-[900px]">
      <CommandGroup>
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
          <Form {...addSongToSetForm}>
            <form
              onSubmit={addSongToSetForm.handleSubmit(handleAddSongToSetSubmit)}
            >
              <section className="flex flex-col gap-2">
                <FormField
                  control={addSongToSetForm.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Song key</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value as string}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select song key" />
                          </SelectTrigger>
                          <SelectContent>
                            {songKeys.map((key) => {
                              const appendedText = [];
                              if (key === selectedSong.preferredKey) {
                                appendedText.push("preferred key");
                              }
                              if (key === lastPlayInstance?.song.key) {
                                appendedText.push("last played in");
                              }
                              return (
                                <SelectItem key={key} value={key}>
                                  {formatSongKey(key)}
                                  {appendedText.length > 0 &&
                                    ` (${appendedText.join(", ")})`}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
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
                    <HStack className="items-center">
                      <Text style="small">Last played:</Text>
                      {isLastPlayInstanceQueryLoading && (
                        <>
                          <CircleNotch
                            size={12}
                            className="mr-2 h-4 w-4 animate-spin"
                          />
                          <Text>
                            Looking up last time {selectedSong.name} was
                            played...{" "}
                          </Text>
                        </>
                      )}
                      {!isLastPlayInstanceQueryLoading &&
                        lastPlayInstance?.song.key && (
                          <Text style="small" className="ml-1">
                            {formatSongKey(lastPlayInstance.song.key)}
                          </Text>
                        )}
                    </HStack>
                  </div>
                </div>
              </section>
              <section className="flex flex-col text-slate-700">
                {setSectionsList.length > 0 && (
                  <FormField
                    control={addSongToSetForm.control}
                    name="setSectionId"
                    render={({ field }) => (
                      <FormItem className="mb-2">
                        <FormLabel>Which part of the set?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            {...field}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            {setSectionsList.map((setSection) => (
                              <FormItem
                                key={setSection.id}
                                className="flex items-center space-y-0 rounded border border-slate-200"
                              >
                                <div className="flex w-full items-center gap-2 py-2 pl-4">
                                  <FormControl>
                                    <RadioGroupItem value={setSection.id} />
                                  </FormControl>
                                  <FormLabel className="flex-1 cursor-pointer">
                                    <Text>{setSection.type.section}</Text>
                                  </FormLabel>
                                </div>
                                {isClearable(setSection) &&
                                  setSection.clearable && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className=""
                                      onClick={() =>
                                        handleRemoveTempSetSection(
                                          setSection.id,
                                        )
                                      }
                                    >
                                      <X />
                                    </Button>
                                  )}
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
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
                    {/* TODO: does the combobox value need to of combobox option or can the setValue be the work-around? */}
                    <Combobox
                      placeholder="Add a set section"
                      options={setSectionTypesOptions}
                      value={setSectionTypeToAdd}
                      onChange={(selectedValue) => {
                        setSetSectionTypeToAdd(selectedValue);
                      }}
                      open={isAddSectionComboboxOpen}
                      setOpen={setIsAddSectionComboboxOpen}
                      loading={isSetSectionTypesQueryLoading}
                      disabled={isSetSectionTypesQueryLoading}
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
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-end">
                <FormField
                  control={addSongToSetForm.control}
                  name="addAnotherSong"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-1 space-y-0 self-end md:self-center">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Add another song</FormLabel>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={shouldAddSongBeDisabled}
                  isLoading={isSubmitting}
                >
                  Add song
                </Button>
              </div>
            </form>
          </Form>
        </DialogDescription>
      </CommandGroup>
    </CommandList>
  );
};

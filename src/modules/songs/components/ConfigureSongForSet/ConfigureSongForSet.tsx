import { Combobox, type ComboboxOption } from "@components/ui/combobox";
import { Input } from "@components/ui/input";
import { DESKTOP_MEDIA_QUERY_STRING, songKeys } from "@lib/constants";
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
import { type SubmitHandler, useForm } from "react-hook-form";
import { insertSetSectionSongSchema } from "@lib/types/zod";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { toast } from "sonner";
import { DevTool } from "@hookform/devtools";
import { useMediaQuery } from "usehooks-ts";
import { Textarea } from "@components/ui/textarea";

const createSetSectionSongsSchema = insertSetSectionSongSchema
  .pick({
    songId: true,
    setSectionId: true,
    key: true,
    notes: true,
  })
  .extend({
    addAnotherSong: z.boolean(),
  });

export type AddSongToSetFormFields = Omit<
  z.infer<typeof createSetSectionSongsSchema>,
  "notes"
> & {
  notes: NonNullable<z.infer<typeof createSetSectionSongsSchema>["notes"]>;
};

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
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);
  const textSize = isDesktop ? "text-base" : "text-xs";

  const [newSetSectionInputValue, setNewSetSectionInputValue] =
    useState<string>("");

  const [setSectionTypesOptions, setSetSectionTypesOptions] = useState<
    ComboboxOption[]
  >([]);

  const [newSetSectionType, setNewSetSectionType] =
    useState<ComboboxOption | null>(null);

  const [isAddSectionComboboxOpen, setIsAddSectionComboboxOpen] =
    useState<boolean>(false);

  const addSongToSetForm = useForm<AddSongToSetFormFields>({
    // mode: "onBlur",
    resolver: zodResolver(createSetSectionSongsSchema),
    defaultValues: {
      songId: selectedSong.songId,
      setSectionId: undefined,
      key: selectedSong.preferredKey,
      addAnotherSong: false,
      notes: "",
    },
  });

  const {
    formState: { isDirty, isSubmitting, isValid },
    setValue,
    setError,
    clearErrors,
  } = addSongToSetForm;
  const shouldAddSongBeDisabled = !isDirty || !isValid || isSubmitting;

  const addSetSectionSongMutation = api.setSectionSong.create.useMutation();
  const createSetSectionTypeMutation = api.setSectionType.create.useMutation();
  const createSetSectionMutation = api.setSection.create.useMutation();
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

  const {
    data: sectionsForSetData,
    error: sectionsForSetQueryError,
    isLoading: isSectionsForSetQueryLoading,
  } = api.setSection.getSectionsForSet.useQuery(
    { organizationId: userMembership.organizationId, setId },
    { enabled: !!userMembership, placeholderData: existingSetSections },
  );

  const [isAddingSection, setIsAddingSection] = useState<boolean>(
    !isSectionsForSetQueryLoading &&
      !sectionsForSetQueryError &&
      !!sectionsForSetData &&
      sectionsForSetData.length === 0,
  );

  useEffect(() => {
    if (
      !isSetSectionTypesQueryLoading &&
      !setSectionTypesQueryError &&
      setSectionTypesData
    ) {
      const setSectionTypes: ComboboxOption[] =
        setSectionTypesData?.map((setSectionType) => ({
          id: setSectionType.id,
          label: setSectionType.name,
        })) ?? [];

      setSetSectionTypesOptions(setSectionTypes);
    }
  }, [
    isSetSectionTypesQueryLoading,
    setSectionTypesData,
    setSectionTypesQueryError,
  ]);

  if (
    isSectionsForSetQueryLoading ||
    !!sectionsForSetQueryError ||
    sectionsForSetData === undefined
  ) {
    // TODO: handle this case?
    return;
  }

  if (isUserQueryLoading || !isAuthLoaded) {
    return <Text>Loading user data...</Text>;
  }

  const handleAddSetSection = async (
    clickEvent: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    // console.log("🚀 ~ handleAddSetSection ~ clickEvent:", clickEvent);

    clickEvent.preventDefault();

    if (!newSetSectionType) {
      // TODO: this case shouldn't happen, but how would we properly handle it just in case?
      return;
    }

    const setAlreadyHasSelectedSection = sectionsForSetData.some(
      (setSection) => setSection.sectionTypeId === newSetSectionType.id,
    );

    if (!setAlreadyHasSelectedSection) {
      const positionForNewSetSection = sectionsForSetData.length;
      console.log(
        "🚀 ~ handleAddSetSection ~ positionForNewSetSection:",
        positionForNewSetSection,
      );

      await createSetSectionMutation.mutateAsync(
        {
          setId,
          organizationId: userMembership.organizationId,
          sectionTypeId: newSetSectionType.id,
          position: positionForNewSetSection,
        },
        {
          async onSuccess(createSetSectionMutationResult) {
            const [newSetSection] = createSetSectionMutationResult;

            console.log(
              "🤖 - [createSetSectionMutation/onSuccess] ~ mutation result: ",
              createSetSectionMutationResult,
            );

            if (newSetSection) {
              setValue("setSectionId", newSetSection.id, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });

              setNewSetSectionType(null);

              toast.success(`Section added to set`);

              await apiUtils.setSection.getSectionsForSet.refetch({
                organizationId: userMembership.organizationId,
                setId,
              });

              await apiUtils.set.get.invalidate({
                setId,
                organizationId: userMembership.organizationId,
              });
            }
          },
        },
      );
    } else {
      setError("setSectionId", {
        type: "custom",
        message: "Section already exists on set",
      });
    }
  };

  // FIXME: this would need to be updated to delete setSection from DB - should this be done here?
  // const handleRemoveTempSetSection = (setSectionIdToRemove: string) => {
  //   const modifiedSetSectionsList = setSectionsList.filter(
  //     (setSection) => setSection.id !== setSectionIdToRemove,
  //   );

  //   if (getValues("setSectionId") === setSectionIdToRemove) {
  //     setValue("setSectionId", "", {
  //       shouldValidate: false,
  //       shouldDirty: true,
  //       shouldTouch: true,
  //     });
  //   }
  // };

  const handleCreateNewSetSectionType = async () => {
    const trimmedInput = newSetSectionInputValue.trim();

    await createSetSectionTypeMutation.mutateAsync(
      { name: trimmedInput, organizationId: userMembership.organizationId },
      {
        async onSuccess(createSetSectionTypeMutationResult) {
          const [newSetSectionType] = createSetSectionTypeMutationResult;

          if (newSetSectionType) {
            toast.success(`${newSetSectionType.name} set section type created`);

            console.log(
              "🤖 [createSetSectionTypeMutation/onSuccess] ~ mutation result:",
              createSetSectionTypeMutationResult,
            );

            setNewSetSectionType({
              id: newSetSectionType.id,
              label: newSetSectionType.name,
            });

            await apiUtils.setSectionType.getTypes.invalidate({
              organizationId: userMembership.organizationId,
            });
          }
        },
      },
    );

    setIsAddSectionComboboxOpen(false);
    setNewSetSectionInputValue("");
  };

  const handleAddSongToSetSubmit: SubmitHandler<
    AddSongToSetFormFields
  > = async (formValues: AddSongToSetFormFields) => {
    const { songId, key, setSectionId, addAnotherSong, notes } = formValues;

    const setSectionToAddTo = sectionsForSetData.find(
      (setSection) => setSection.id === setSectionId,
    );
    const setSectionSongPosition = setSectionToAddTo!.songs.length; // using non-null assertion since in the happiest path where we don't add any new set sections to the set, this set section already exists

    await addSetSectionSongMutation.mutateAsync(
      {
        organizationId: userMembership.organizationId,
        songId,
        setSectionId,
        key: key!,
        position: setSectionSongPosition,
        notes: notes || null,
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

          setDialogStep("search");

          if (!addAnotherSong) {
            // close the dialog
            onSubmit?.();
          }
        },
      },
    );
  };

  const goBackToSearch = () => setDialogStep("search");

  return (
    <CommandList className="max-h-[90dvh] lg:max-h-[900px]">
      <CommandGroup>
        <div className="grid grid-cols-[40px_1fr_40px] items-center">
          <Button size="icon" variant="ghost" onClick={goBackToSearch}>
            <CaretLeft />
          </Button>
          <DialogTitle className="text-center">Add song to set</DialogTitle>
        </div>
        <DialogDescription className="mt-6 flex flex-col gap-6">
          <div
            className="cursor-pointer rounded-lg border px-3 py-2 text-slate-900 transition-colors hover:bg-accent"
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
              size={isDesktop ? "md" : "sm"}
            />
          </div>
          <Form {...addSongToSetForm}>
            <form
              onSubmit={addSongToSetForm.handleSubmit(handleAddSongToSetSubmit)}
              className="flex flex-col gap-6"
            >
              <section className="flex flex-col gap-2 text-slate-700">
                <FormField
                  control={addSongToSetForm.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className={cn("font-normal text-slate-900", textSize)}
                      >
                        Song key
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value as string}
                        >
                          <SelectTrigger className={cn(textSize)}>
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
                                <SelectItem
                                  key={key}
                                  value={key}
                                  className={cn(textSize)}
                                >
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
                    <HStack className="items-center">
                      <Text style={isDesktop ? "body-small" : "small"}>
                        Last played:
                      </Text>
                      {isLastPlayInstanceQueryLoading && (
                        <>
                          <CircleNotch
                            size={12}
                            className="mr-2 h-4 w-4 animate-spin"
                          />
                          <Text>
                            Looking up last time {selectedSong.name} was
                            played...
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
                {sectionsForSetData.length > 0 && (
                  <FormField
                    control={addSongToSetForm.control}
                    name="setSectionId"
                    render={({ field }) => (
                      <FormItem className="mb-2">
                        <FormLabel
                          className={cn("font-normal text-slate-900", textSize)}
                        >
                          Which part of the set?
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            {sectionsForSetData.map((setSection) => (
                              <FormItem
                                key={setSection.id}
                                className="flex items-center space-y-0 rounded border border-slate-200"
                              >
                                <div className="flex w-full items-center gap-2 py-2 pl-4">
                                  <FormControl>
                                    <RadioGroupItem
                                      value={setSection.id}
                                      className="size-3"
                                    />
                                  </FormControl>
                                  <FormLabel className="flex-1 cursor-pointer ">
                                    <Text className={cn(textSize)}>
                                      {setSection.type.name}
                                    </Text>
                                  </FormLabel>
                                </div>
                                {/* {isClearable(setSection) &&
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
                                  )} */}
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {sectionsForSetData.length === 0 && (
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
                    size="sm"
                    variant="ghost"
                    className={cn("border border-dashed", [
                      !isDesktop && "h-8",
                    ])}
                    onClick={() => setIsAddingSection(true)}
                  >
                    <Plus />
                    <Text className={cn(textSize)}>Add another section</Text>
                  </Button>
                )}
                {isAddingSection && (
                  <>
                    <Combobox
                      placeholder="Add a set section"
                      options={setSectionTypesOptions}
                      value={newSetSectionType}
                      onChange={(selectedValue) => {
                        setNewSetSectionType(selectedValue);
                      }}
                      open={isAddSectionComboboxOpen}
                      setOpen={setIsAddSectionComboboxOpen}
                      loading={isSetSectionTypesQueryLoading}
                      disabled={isSetSectionTypesQueryLoading}
                      textStyles={cn("text-slate-700", textSize)}
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
                            onClick={handleCreateNewSetSectionType}
                            isLoading={createSetSectionTypeMutation.isPending}
                            disabled={
                              newSetSectionInputValue === "" ||
                              createSetSectionTypeMutation.isPending
                            }
                          >
                            <Plus />
                            Create
                          </Button>
                        </div>
                      </CommandGroup>
                    </Combobox>
                    <div className="mt-2 flex justify-end gap-2">
                      {sectionsForSetData.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsAddingSection(false);
                            clearErrors("setSectionId");
                            setNewSetSectionType(null);
                          }}
                          className={cn(textSize)}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(clickEvent) =>
                          handleAddSetSection(clickEvent)
                        }
                        disabled={
                          !newSetSectionType ||
                          newSetSectionType.id === "" ||
                          createSetSectionMutation.isPending
                        }
                        isLoading={createSetSectionMutation.isPending}
                        className={cn(textSize)}
                      >
                        Add
                      </Button>
                    </div>
                  </>
                )}
              </section>
              <section>
                <FormField
                  control={addSongToSetForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel
                        className={cn("font-normal text-slate-900", textSize)}
                      >
                        Song notes
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </section>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
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
                      <FormLabel className={cn(textSize)}>
                        Add another song
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Button
                  size="sm"
                  type="submit"
                  disabled={shouldAddSongBeDisabled}
                  isLoading={isSubmitting}
                >
                  Add song
                </Button>
              </div>
              <DevTool control={addSongToSetForm.control} />
            </form>
          </Form>
        </DialogDescription>
      </CommandGroup>
    </CommandList>
  );
};

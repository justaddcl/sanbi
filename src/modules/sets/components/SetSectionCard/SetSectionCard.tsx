import { api } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { type ComboboxOption } from "@components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";
import { VStack } from "@components/VStack";
import { zodResolver } from "@hookform/resolvers/zod";
import { DESKTOP_MEDIA_QUERY_STRING } from "@lib/constants";
import { pluralize } from "@lib/string";
import { type SetSectionWithSongs } from "@lib/types";
import { insertSetSectionSchema } from "@lib/types/zod";
import { cn } from "@lib/utils";
import { SongItem } from "@modules/SetListCard";
import { SetSectionActionMenu } from "@modules/SetListCard/components/SetSectionActionMenu";
import { SetSectionTypeCombobox } from "@modules/sets/components/SetSectionTypeCombobox";
import { useSectionTypesOptions } from "@modules/sets/hooks/useSetSectionTypes";
import { useUserQuery } from "@modules/users/api/queries";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { redirect, useSearchParams } from "next/navigation";
import { useState, type FC } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { type z } from "zod";

const updateSetSectionSchema = insertSetSectionSchema.pick({
  sectionTypeId: true,
});

export type UpdateSetSectionFormFields = z.infer<typeof updateSetSectionSchema>;

export type SetSectionCardProps = {
  /** The section data including songs, type, and position */
  section: SetSectionWithSongs;

  /** how many set sections are in the set this section is attached to */
  setSectionsLength: number;

  /** The 1-based index where this section's songs start in the overall set */
  sectionStartIndex: number;

  /** Whether this is the first section in the set */
  // isFirstSection: boolean;

  /** Whether this is the last section in the set */
  // isLastSection: boolean;

  /** should the SetSection card have the action menu? */
  withActionsMenu?: boolean;
};

export const SetSectionCard: FC<SetSectionCardProps> = ({
  section,
  setSectionsLength,
  sectionStartIndex,
  withActionsMenu,
}) => {
  const { id, type, songs, setId, position, sectionTypeId } = section;
  const searchParams = useSearchParams();

  const isFirstSection = position === 0;
  const isLastSection = position === setSectionsLength - 1;

  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);
  const textSize = isDesktop ? "text-base" : "text-xs";

  const [isSectionExpanded, setIsSectionExpanded] = useState<boolean>(true);
  const [isEditingSectionType, setIsEditingSectionType] =
    useState<boolean>(false);

  const updateSetSectionForm = useForm<UpdateSetSectionFormFields>({
    resolver: zodResolver(updateSetSectionSchema),
    defaultValues: {
      sectionTypeId,
    },
  });

  const {
    formState: { isDirty, isSubmitting, isValid },
    reset: resetForm,
  } = updateSetSectionForm;

  const changeSetSectionTypeMutation = api.setSection.changeType.useMutation();
  const apiUtils = api.useUtils();

  const { data: userData } = useUserQuery();

  const userMembership = userData?.memberships[0];

  if (!userMembership) {
    redirect("/sign-in");
  }

  const { options: setSectionTypesOptions } = useSectionTypesOptions(
    userMembership.organizationId,
  );

  const handleUpdateSetSection: SubmitHandler<
    UpdateSetSectionFormFields
  > = async (formValues: UpdateSetSectionFormFields) => {
    toast.loading("Updating section...");

    changeSetSectionTypeMutation.mutate(
      {
        id: section.id,
        sectionTypeId: formValues.sectionTypeId,
        organizationId: userMembership.organizationId,
      },
      {
        async onSuccess() {
          toast.dismiss();
          toast.success("Updated section");
          await apiUtils.set.get.invalidate({
            setId: section.setId,
            organizationId: userMembership.organizationId,
          });
          setIsEditingSectionType(false);
        },

        async onError(updateError) {
          toast.dismiss();
          toast.error(`Could not update section: ${updateError.message}`);
        },
      },
    );
  };

  const openAddSongDialogWithPrePopulatedSection = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("addSongDialogOpen", "1");
    params.set("setSectionId", section.id);
    window.history.pushState(null, "", `?${params.toString()}`);
  };

  const shouldUpdateSectionButtonBeDisabled =
    !isDirty || !isValid || isSubmitting;

  return (
    <VStack key={id} className="gap-4 rounded-lg border p-4 lg:gap-4 lg:p-6">
      <VStack as="header" className="gap-4">
        <Form {...updateSetSectionForm}>
          <form
            onSubmit={updateSetSectionForm.handleSubmit(handleUpdateSetSection)}
          >
            {!isEditingSectionType && (
              <HStack className="flex-wrap items-baseline justify-between gap-4 pr-4 lg:gap-16">
                <HStack className="gap-4">
                  <Text
                    asElement="h3"
                    style="header-medium-semibold"
                    className="flex-wrap text-xl"
                  >
                    {type.name}
                  </Text>
                  {!isSectionExpanded ? (
                    <Badge variant="secondary">
                      {`${section.songs.length} ${pluralize(section.songs.length, { singular: "song", plural: "songs" })}`}
                    </Badge>
                  ) : null}
                </HStack>
                <HStack className="flex items-start gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(clickEvent) => {
                      clickEvent.preventDefault();
                      setIsSectionExpanded((isExpanded) => !isExpanded);
                    }}
                  >
                    {isSectionExpanded ? <CaretUp /> : <CaretDown />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(clickEvent) => {
                      clickEvent.preventDefault();
                      openAddSongDialogWithPrePopulatedSection();
                    }}
                  >
                    <Plus className="text-slate-900" size={16} />
                    <span className="hidden sm:inline">Add song</span>
                  </Button>
                  {withActionsMenu && (
                    <SetSectionActionMenu
                      setSection={section}
                      setSectionsLength={setSectionsLength}
                      isInFirstSection={isFirstSection}
                      isInLastSection={isLastSection}
                      setIsEditingSectionType={setIsEditingSectionType}
                    />
                  )}
                </HStack>
              </HStack>
            )}
            {isEditingSectionType && (
              <VStack className="gap-4">
                <FormField
                  control={updateSetSectionForm.control}
                  name="sectionTypeId"
                  render={({ field }) => {
                    const matchingSetSectionType = setSectionTypesOptions.find(
                      (setSectionType) => setSectionType.id === field.value,
                    );

                    const value: ComboboxOption = {
                      id: matchingSetSectionType?.id ?? "",
                      label: matchingSetSectionType?.label ?? "",
                    };

                    return (
                      <FormItem>
                        <VStack className="gap-2">
                          <FormLabel>
                            <Text
                              asElement="h3"
                              style="header-medium-semibold"
                              className="flex-wrap"
                            >
                              Section type
                            </Text>
                          </FormLabel>
                          <FormControl>
                            <SetSectionTypeCombobox
                              value={value}
                              onChange={(selectedValue) => {
                                field.onChange(selectedValue?.id);
                              }}
                              textStyles={cn("text-slate-700", textSize)}
                              organizationId={userMembership.organizationId}
                              onCreateSuccess={(newSectionType) =>
                                field.onChange(newSectionType.id)
                              }
                            />
                          </FormControl>
                        </VStack>
                      </FormItem>
                    );
                  }}
                />
                <HStack className="flex items-start gap-2 self-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resetForm({
                        sectionTypeId,
                      });
                      setIsEditingSectionType(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    disabled={shouldUpdateSectionButtonBeDisabled}
                    isLoading={isSubmitting}
                  >
                    Update section
                  </Button>
                </HStack>
              </VStack>
            )}
          </form>
        </Form>
      </VStack>
      {isSectionExpanded && (
        <VStack>
          <hr className="mb-4 bg-slate-100" />
          {songs &&
            songs.length > 0 &&
            section.songs.map((setSectionSong) => (
              <SongItem
                key={setSectionSong.id}
                setSectionSong={setSectionSong}
                index={sectionStartIndex + setSectionSong.position}
                setId={setId}
                setSectionType={type.name}
                isInFirstSection={isFirstSection}
                isInLastSection={isLastSection}
                isFirstSong={setSectionSong.position === 0}
                isLastSong={
                  setSectionSong.position === section.songs.length - 1
                }
                withActionsMenu
              />
            ))}
        </VStack>
      )}
    </VStack>
  );
};

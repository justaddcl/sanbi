import { api } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
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
import { type SetSectionWithSongs } from "@lib/types";
import { insertSetSectionSchema } from "@lib/types/zod";
import { cn } from "@lib/utils";
import { SongItem } from "@modules/SetListCard";
import { SetSectionActionMenu } from "@modules/SetListCard/components/SetSectionActionMenu";
import { SetSectionTypeCombobox } from "@modules/sets/components/SetSectionTypeCombobox";
import { useSectionTypesOptions } from "@modules/sets/hooks/useSetSectionTypes";
import { useUserQuery } from "@modules/users/api/queries";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
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

  const isFirstSection = position === 0;
  const isLastSection = position === setSectionsLength - 1;

  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);
  const textSize = isDesktop ? "text-base" : "text-xs";

  const [isEditingSectionType, setIsEditingSectionType] =
    useState<boolean>(false);
  const [isAddSectionComboboxOpen, setIsAddSectionComboboxOpen] =
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

  const { data: userData, isLoading: isUserQueryLoading } = useUserQuery();

  const userMembership = userData?.memberships[0];

  if (!userMembership) {
    redirect("/sign-in");
  }

  const {
    options: setSectionTypesOptions,
    isLoading: isSetSectionTypesQueryLoading,
  } = useSectionTypesOptions(userMembership.organizationId);

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

  const shouldUpdateSectionButtonBeDisabled =
    !isDirty || !isValid || isSubmitting;
  const isSetSectionTypesListLoading =
    isUserQueryLoading || isSetSectionTypesQueryLoading;

  return (
    <VStack
      key={id}
      className="gap-4 rounded-lg border p-4 shadow lg:gap-8 lg:p-8"
    >
      <VStack as="header" className="gap-4 lg:gap-6">
        <Form {...updateSetSectionForm}>
          <form
            onSubmit={updateSetSectionForm.handleSubmit(handleUpdateSetSection)}
          >
            <HStack className="items-baseline justify-between gap-4 lg:gap-16">
              {!isEditingSectionType && (
                <Text
                  asElement="h3"
                  style="header-medium-semibold"
                  className="flex-wrap text-xl"
                >
                  {type.name}
                </Text>
              )}
              {isEditingSectionType && (
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
                              options={setSectionTypesOptions}
                              value={value}
                              onChange={(selectedValue) => {
                                field.onChange(selectedValue?.id);
                              }}
                              open={isAddSectionComboboxOpen}
                              setOpen={setIsAddSectionComboboxOpen}
                              loading={isSetSectionTypesListLoading}
                              disabled={isSetSectionTypesQueryLoading}
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
              )}
              <HStack className="flex items-start gap-2">
                {!isEditingSectionType && (
                  <>
                    <Button size="sm" variant="outline">
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
                  </>
                )}
                {isEditingSectionType && (
                  <>
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
                  </>
                )}
              </HStack>
            </HStack>
          </form>
        </Form>
        <hr className="bg-slate-100" />
      </VStack>
      <VStack className="gap-y-4">
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
              isLastSong={setSectionSong.position === section.songs.length - 1}
              withActionsMenu
            />
          ))}
      </VStack>
    </VStack>
  );
};

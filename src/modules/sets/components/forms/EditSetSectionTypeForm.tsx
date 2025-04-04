import { useResponsive } from "@/hooks/useResponsive";
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
import { pluralize } from "@lib/string";
import { insertSetSectionSchema } from "@lib/types/zod";
import { cn } from "@lib/utils";
import { SetSectionActionMenu } from "@modules/SetListCard/components/SetSectionActionMenu";
import { SetSectionTypeCombobox } from "@modules/sets/components/SetSectionTypeCombobox";
import { useSectionTypesOptions } from "@modules/sets/hooks/useSetSectionTypes";
import { useUserQuery } from "@modules/users/api/queries";
import { CaretDown, CaretUp, Plus } from "@phosphor-icons/react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import React, { useState, type Dispatch, type SetStateAction } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";
import { type SetSectionCardProps } from "../SetSectionCard";

const updateSetSectionSchema = insertSetSectionSchema.pick({
  sectionTypeId: true,
});

export type UpdateSetSectionFormFields = z.infer<typeof updateSetSectionSchema>;

type EditSetSectionTypeFormProps = Pick<
  SetSectionCardProps,
  "section" | "setSectionsLength" | "withActionsMenu"
> & {
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
  isFirstSection: boolean;
  isLastSection: boolean;
};

export const EditSetSectionTypeForm: React.FC<EditSetSectionTypeFormProps> = ({
  section,
  setSectionsLength,
  isExpanded,
  setIsExpanded,
  withActionsMenu,
  isFirstSection,
  isLastSection,
}) => {
  const { textSize } = useResponsive();

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const changeSetSectionTypeMutation = api.setSection.changeType.useMutation();
  const apiUtils = api.useUtils();

  const updateSetSectionForm = useForm<UpdateSetSectionFormFields>({
    resolver: zodResolver(updateSetSectionSchema),
    defaultValues: {
      sectionTypeId: section.sectionTypeId,
    },
  });

  const {
    formState: { isDirty, isSubmitting, isValid },
    reset: resetForm,
  } = updateSetSectionForm;

  const { data: userData } = useUserQuery();

  const userMembership = userData?.memberships[0];

  if (!userMembership) {
    redirect("/sign-in");
  }

  const { options: setSectionTypesOptions } = useSectionTypesOptions(
    userMembership.organizationId,
  );

  const openAddSongDialogWithPrePopulatedSection = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("addSongDialogOpen", "1");
    params.set("setSectionId", section.id);

    router.push(`?${params.toString()}`);
  };

  const shouldUpdateSectionButtonBeDisabled =
    !isDirty || !isValid || isSubmitting;

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
          setIsEditing(false);
        },

        async onError(updateError) {
          toast.dismiss();
          toast.error(`Could not update section: ${updateError.message}`);
        },
      },
    );
  };

  return (
    <Form {...updateSetSectionForm}>
      <form
        onSubmit={updateSetSectionForm.handleSubmit(handleUpdateSetSection)}
      >
        {!isEditing && (
          <HStack className="flex-wrap items-baseline justify-between gap-4 lg:gap-16 lg:pr-4">
            <HStack className="gap-2 lg:gap-4">
              <Text
                asElement="h3"
                style="header-medium-semibold"
                className="text-l flex-wrap md:text-xl"
              >
                {section.type.name}
              </Text>
              {!isExpanded ? (
                <Badge variant="secondary">
                  <span>{section.songs.length}</span>
                  <span className="hidden md:ml-1 md:inline-block">
                    {pluralize(section.songs.length, {
                      singular: "song",
                      plural: "songs",
                    })}
                  </span>
                </Badge>
              ) : null}
            </HStack>
            <HStack className="flex items-start gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(clickEvent) => {
                  clickEvent.preventDefault();
                  setIsExpanded((isExpanded) => !isExpanded);
                }}
              >
                {isExpanded ? <CaretUp /> : <CaretDown />}
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
                  setIsEditingSectionType={setIsEditing}
                />
              )}
            </HStack>
          </HStack>
        )}
        {isEditing && (
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
                    sectionTypeId: section.sectionTypeId,
                  });
                  setIsEditing(false);
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
  );
};

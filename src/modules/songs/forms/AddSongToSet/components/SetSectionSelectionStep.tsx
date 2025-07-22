import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@components/ui/button";
import { type ComboboxOption } from "@components/ui/combobox";
import { Card } from "@components/Card/Card";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";
import { SongContent } from "@modules/SetListCard/components/SongContent";
import { SetSectionTypeCombobox } from "@modules/sets/components/SetSectionTypeCombobox";
import { SelectedSetCard } from "@modules/songs/forms/AddSongToSet/components";
import { type SelectedSet } from "@modules/songs/forms/AddSongToSet/components/AddSongToSetDialog";
import { useUserQuery } from "@modules/users/api/queries";
import { cn } from "@lib/utils";
import { useResponsive } from "@/hooks/useResponsive";
import { api } from "@/trpc/react";

type SetSectionSelectionStepProps = {
  selectedSet: SelectedSet | null;
  onSelectSetSection: (
    setSectionId: string,
    setSectionSongCount: number,
  ) => void;
};

export const SetSectionSelectionStep: React.FC<
  SetSectionSelectionStepProps
> = ({ selectedSet, onSelectSetSection }) => {
  const [isAddingSection, setIsAddingSection] = useState<boolean>(false);
  const [newSetSectionType, setNewSetSectionType] =
    useState<ComboboxOption | null>(null);

  const { textSize, isDesktop } = useResponsive();
  const { userMembership } = useUserQuery();

  if (!selectedSet || !userMembership) {
    return null;
  }

  const createSetSectionMutation = api.setSection.create.useMutation();
  const apiUtils = api.useUtils();

  const { data: setData } = api.set.get.useQuery({
    setId: selectedSet.id,
    organizationId: userMembership.organizationId,
  });

  if (!setData) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Unable to load set details. Please go back a step and try re-selecting
        the set.
      </div>
    );
  }

  const handleAddSetSection = async (
    clickEvent: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    clickEvent.preventDefault();

    if (!newSetSectionType) {
      // TODO: this case shouldn't happen, but how would we properly handle it just in case?
      return;
    }

    const setAlreadyHasSelectedSection = setData?.sections.some(
      (setSection) => setSection.sectionTypeId === newSetSectionType.id,
    );

    const toastId = toast.loading("Adding section to set...");

    if (!setAlreadyHasSelectedSection) {
      const positionForNewSetSection = setData.sections.length;

      await createSetSectionMutation.mutateAsync(
        {
          setId: setData.id,
          organizationId: userMembership.organizationId,
          sectionTypeId: newSetSectionType.id,
          position: positionForNewSetSection,
        },
        {
          async onSuccess(createSetSectionMutationResult) {
            const [newSetSection] = createSetSectionMutationResult;

            if (newSetSection) {
              setNewSetSectionType(null);

              toast.success(`Section added to set`, { id: toastId });

              await apiUtils.setSection.getSectionsForSet.refetch({
                organizationId: userMembership.organizationId,
                setId: setData.id,
              });

              await apiUtils.set.get.invalidate({
                setId: setData.id,
                organizationId: userMembership.organizationId,
              });

              onSelectSetSection(newSetSection.id, 0);
            }
          },

          onError(createSetSectionError) {
            toast.error(
              `Could not add section to set: ${createSetSectionError.message}`,
              { id: toastId },
            );
          },
        },
      );
    } else {
      toast.error("Section already exists on set", { id: toastId });
    }
  };

  const setHasSections = setData.sections.length > 0;

  return (
    <VStack className="gap-4 p-4 pt-2">
      <VStack className="gap-1">
        <Text className="font-medium text-slate-700">Selected set</Text>
        <SelectedSetCard set={setData} />
      </VStack>
      <VStack className="gap-2">
        <Text className="text-lg font-medium text-slate-900">
          {setHasSections ? "Select" : "Add"} a section
        </Text>
        <VStack className="gap-4">
          {setData.sections.map((section) => (
            <Card
              key={section.id}
              title={section.type.name}
              headerClassName="p-0"
              titleClassName="md:text-lg"
              button={
                <Button
                  size="sm"
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                    onSelectSetSection(section.id, section.songs.length);
                  }}
                >
                  <span className="md:hidden">Select</span>
                  <span className="hidden md:inline">Select section</span>
                </Button>
              }
              collapsible
              initialIsExpanded={false}
            >
              <VStack className="gap-3 md:gap-4">
                {section.songs &&
                  section.songs.length > 0 &&
                  section.songs.map((setSectionSong, songPosition) => (
                    <SongContent
                      key={setSectionSong.id}
                      songKey={setSectionSong.key}
                      name={setSectionSong.song.name}
                      notes={setSectionSong.notes}
                      index={songPosition + 1}
                    />
                  ))}
              </VStack>
            </Card>
          ))}
          {!isAddingSection && (
            <Button
              size="sm"
              variant={setHasSections ? "ghost" : "default"}
              className={cn("mt-4", {
                "border border-dashed": setHasSections,
                "h-8": !isDesktop,
              })}
              onClick={() => setIsAddingSection(true)}
            >
              <Plus />
              <Text className={cn(textSize)}>
                Add {setHasSections ? "another" : ""} section
              </Text>
            </Button>
          )}
          {isAddingSection && (
            <VStack className="gap-4">
              <Text>What kind of section do you want to add?</Text>
              <SetSectionTypeCombobox
                placeholder="Select section type"
                value={newSetSectionType}
                onChange={(selectedSetSectionType) => {
                  setNewSetSectionType(selectedSetSectionType);
                }}
                textStyles={cn("text-slate-700", textSize)}
                organizationId={userMembership.organizationId}
              />
              <HStack className="mt-2 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingSection(false);
                    setNewSetSectionType(null);
                  }}
                  className={cn(textSize)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={(clickEvent) => handleAddSetSection(clickEvent)}
                  disabled={
                    !newSetSectionType ||
                    newSetSectionType.id === "" ||
                    createSetSectionMutation.isPending
                  }
                  isLoading={createSetSectionMutation.isPending}
                  className={cn(textSize)}
                >
                  Add section to set
                </Button>
              </HStack>
            </VStack>
          )}
        </VStack>
      </VStack>
    </VStack>
  );
};

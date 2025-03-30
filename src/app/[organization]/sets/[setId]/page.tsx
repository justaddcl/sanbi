"use client";
import { api } from "@/trpc/react";
import { useAuth } from "@clerk/nextjs";
import { HStack } from "@components/HStack";
import { PageContentContainer } from "@components/PageContentContainer";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@components/ResponsiveDialog";
import { Text } from "@components/Text";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { type ComboboxOption } from "@components/ui/combobox";
import { VStack } from "@components/VStack";
import { DESKTOP_MEDIA_QUERY_STRING } from "@lib/constants";
import { type SetSectionWithSongs } from "@lib/types";
import { cn } from "@lib/utils";
import { useSetQuery } from "@modules/sets/api";
import { SetActionsMenu } from "@modules/sets/components/SetActionsMenu";
import { SetDetails } from "@modules/sets/components/SetDetails";
import { SetEmptyState } from "@modules/sets/components/SetEmptyState";
import { SetPageErrorState } from "@modules/sets/components/SetErrorState";
import { SetPageLoadingState } from "@modules/sets/components/SetLoadingState";
import { SetNotes } from "@modules/sets/components/SetNotes";
import { SetSectionCard } from "@modules/sets/components/SetSectionCard";
import { SetSectionTypeCombobox } from "@modules/sets/components/SetSectionTypeCombobox";
import { type ConfigureSongForSetProps } from "@modules/songs/components/ConfigureSongForSet/ConfigureSongForSet";
import { SongSearchDialog } from "@modules/songs/components/SongSearchDialog";
import { Archive, Plus } from "@phosphor-icons/react/dist/ssr";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { redirect, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { validate as uuidValidate } from "uuid";

type SetListPageProps = {
  params: { organization: string; setId: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default function SetListPage({ params }: SetListPageProps) {
  const searchParams = useSearchParams();

  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);
  const textSize = isDesktop ? "text-base" : "text-xs";

  const [isEditingSetDetails, setIsEditingSetDetails] =
    useState<boolean>(false);
  const [prePopulatedSetSectionId, setPrePopulatedSetSectionId] =
    useState<ConfigureSongForSetProps["prePopulatedSetSectionId"]>(undefined);
  const [isSongSearchDialogOpen, setIsSongSearchDialogOpen] =
    useState<boolean>(false);
  const [newSetSectionType, setNewSetSectionType] =
    useState<ComboboxOption | null>(null);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] =
    useState<boolean>(false);

  const createSetSectionMutation = api.setSection.create.useMutation();
  const unarchiveSetMutation = api.set.unarchive.useMutation();
  const apiUtils = api.useUtils();

  useEffect(() => {
    const addSongDialogOpen = searchParams.get("addSongDialogOpen");
    const setSectionIdFromUrl = searchParams.get("setSectionId");

    const isSongSearchDialogOpenFromUrl = [null, undefined, "false", "0"].every(
      (falsyValue) => addSongDialogOpen !== falsyValue,
    );

    setIsSongSearchDialogOpen(isSongSearchDialogOpenFromUrl);
    setPrePopulatedSetSectionId(setSectionIdFromUrl);
  }, [searchParams]);

  const validateParams = useCallback(() => {
    const isOrganizationIdValidUuid = uuidValidate(params.organization);
    const isSetIdValidUuid = uuidValidate(params.setId);
    if (!isOrganizationIdValidUuid) {
      console.error(
        `🤖 - ${params.organization} is an invalid organization ID`,
      );
    }

    if (!isSetIdValidUuid) {
      console.error(`🤖 - ${params.setId} is invalid set ID`);
    }

    if (!isOrganizationIdValidUuid || !isSetIdValidUuid) {
      console.error(`🤖 - Invalid params`);
      // notFound();
    }
  }, [params.organization, params.setId]);

  // auth
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  if (isAuthLoaded && !userId) {
    redirect("/");
  }

  // data queries
  const {
    data: setData,
    isLoading: isSetQueryLoading,
    error: setQueryError,
  } = useSetQuery({
    setId: params.setId,
    organizationId: params.organization,
    userId: userId!, // we use a non-null assertion here since the redirect would have already fired if userId is falsy
  });

  const {
    data: userData,
    isLoading: isUserQueryLoading,
    error: userQueryError,
  } = api.user.getUser.useQuery({ userId: userId! }, { enabled: !!userId }); // we use a non-null assertion here since the query will be disabled if userId is falsy
  const userMembership = userData?.memberships[0];

  validateParams();

  const isPageLoading =
    !isAuthLoaded || isSetQueryLoading || isUserQueryLoading;
  if (isPageLoading) {
    return <SetPageLoadingState />;
  }

  const queryError = !!setQueryError || !!userQueryError;
  if (!!queryError) {
    return <SetPageErrorState />;
  }

  if (!userMembership || !setData) {
    redirect(`/`);
  }

  const openAddSongDialog = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("addSongDialogOpen", "1");
    const queryString = params.toString();
    window.history.pushState(null, "", `?${queryString}`);
  };

  const unarchiveSet = () => {
    const toastId = toast.loading("Unarchiving set...");

    unarchiveSetMutation.mutate(
      { organizationId: setData.organizationId, setId: setData.id },
      {
        async onSuccess() {
          toast.success("Set has been unarchived", { id: toastId });
          await apiUtils.set.get.invalidate({
            organizationId: setData.organizationId,
            setId: setData.id,
          });
        },
        onError(error) {
          toast.error(`Set could not be unarchived: ${error.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  const handleAddSetSection = () => {
    const toastId = toast.loading("Adding section to set...");

    if (!newSetSectionType) {
      toast.error("Please select a section type", { id: toastId });
      return;
    }

    const setAlreadyHasSelectedSection = setData.sections.some(
      (setSection) => setSection.sectionTypeId === newSetSectionType.id,
    );

    if (setAlreadyHasSelectedSection) {
      toast.error("Section type already exists on this set", { id: toastId });
      return;
    }

    const positionForNewSetSection = setData.sections.length;

    createSetSectionMutation.mutate(
      {
        setId: setData.id,
        organizationId: userMembership.organizationId,
        sectionTypeId: newSetSectionType.id,
        position: positionForNewSetSection,
      },
      {
        async onSuccess() {
          toast.success(`Section added to set!`, { id: toastId });

          setNewSetSectionType(null);

          await apiUtils.setSection.getSectionsForSet.refetch({
            organizationId: userMembership.organizationId,
            setId: setData.id,
          });

          await apiUtils.set.get.invalidate({
            setId: setData.id,
            organizationId: userMembership.organizationId,
          });
        },
      },
    );
  };

  return (
    <PageContentContainer className="gap-8 lg:mb-16">
      <VStack className="gap-6">
        <HStack className="items-start justify-between">
          <SetDetails
            set={setData}
            isEditing={isEditingSetDetails}
            setIsEditing={setIsEditingSetDetails}
          />
          <HStack className="gap-2">
            {setData?.sections && setData.sections.length > 0 && (
              <Button onClick={openAddSongDialog} className="hidden md:flex">
                <Plus /> Add a song
              </Button>
            )}
            <SetActionsMenu
              setId={params.setId}
              organizationId={userMembership.organizationId}
              archived={setData.isArchived ?? false}
              setIsAddSectionDialogOpen={setIsAddSectionDialogOpen}
              setIsEditingSetDetails={setIsEditingSetDetails}
              align="end"
            />
          </HStack>
        </HStack>
        {setData.isArchived && (
          <Alert className="border-amber-200 bg-amber-50 ">
            <Archive color="#78350f" />
            <AlertTitle className="text-amber-900">Set is archived</AlertTitle>
            <AlertDescription>
              <VStack className="justify-start gap-3">
                <VStack className="gap-1">
                  <Text className="text-amber-700">
                    This means this set won&apos;t show up on the sets list page
                    or in searches by default. However, all set history and data
                    are preserved and you can find it in the archived section.
                  </Text>
                </VStack>
                <Button
                  variant="link"
                  size="sm"
                  className="self-start p-0 text-amber-900"
                  onClick={unarchiveSet}
                >
                  Unarchive this set
                </Button>
              </VStack>
            </AlertDescription>
          </Alert>
        )}
        <SetNotes
          setId={params.setId}
          value={setData.notes}
          organizationId={userMembership.organizationId}
        />
        {setData?.sections && setData.sections.length > 0 && (
          <Button onClick={openAddSongDialog} className="md:hidden">
            <Plus /> Add a song
          </Button>
        )}
      </VStack>
      {(!setData?.sections || setData.sections.length === 0) && (
        <SetEmptyState
          onActionClick={() => {
            openAddSongDialog();
          }}
        />
      )}
      {setData?.sections && setData.sections.length > 0 && (
        <VStack className="gap-8">
          <>
            {setData.sections.map((section) => {
              let sectionStartIndex = 1;
              for (
                let sectionPosition = 0;
                sectionPosition < section.position;
                sectionPosition++
              ) {
                sectionStartIndex +=
                  setData.sections[sectionPosition]!.songs.length;
              }
              return (
                <SetSectionCard
                  key={section.id}
                  section={section as SetSectionWithSongs}
                  setSectionsLength={setData.sections.length}
                  sectionStartIndex={sectionStartIndex}
                  withActionsMenu
                />
              );
            })}
          </>
          <Button
            variant="outline"
            onClick={() => setIsAddSectionDialogOpen(true)}
          >
            <Plus /> Add another section
          </Button>
        </VStack>
      )}
      {/* TODO: extract to separate AddSectionDialog? */}
      <ResponsiveDialog
        open={isAddSectionDialogOpen}
        onOpenChange={(isOpen) => {
          setIsAddSectionDialogOpen(isOpen);
          if (!isOpen) {
            setNewSetSectionType(null);
          }
        }}
      >
        <ResponsiveDialogContent className="p-6 lg:p-8">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle asChild>
              <VisuallyHidden.Root>Add section to set</VisuallyHidden.Root>
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription asChild>
              <VisuallyHidden.Root>
                Dialog to add section to set
              </VisuallyHidden.Root>
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <Text
              asElement="h3"
              style="header-medium-semibold"
              className="flex-wrap text-xl"
            >
              Add section to set
            </Text>
          </ResponsiveDialogTitle>
          <VStack className="mt-4 gap-4 lg:mt-0 lg:gap-8">
            <SetSectionTypeCombobox
              placeholder="Select a section type to add"
              value={newSetSectionType}
              onChange={setNewSetSectionType}
              textStyles={cn("text-slate-700", textSize)}
              organizationId={userMembership.organizationId}
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(textSize)}
                onClick={() => setIsAddSectionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsAddSectionDialogOpen(false);
                  handleAddSetSection();
                }}
                disabled={
                  !newSetSectionType?.id || createSetSectionMutation.isPending
                }
                isLoading={createSetSectionMutation.isPending}
                className={cn(textSize)}
              >
                Add section to set
              </Button>
            </div>
          </VStack>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <SongSearchDialog
        open={isSongSearchDialogOpen}
        existingSetSections={setData.sections}
        setId={setData.id}
        prePopulatedSetSectionId={prePopulatedSetSectionId}
      />
    </PageContentContainer>
  );
}

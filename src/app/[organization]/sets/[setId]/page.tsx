"use client";
import { pluralize } from "@lib/string";
import { PageTitle } from "@components/PageTitle";
import { Text } from "@components/Text";
import { Archive, Plus } from "@phosphor-icons/react/dist/ssr";
import { redirect, useSearchParams } from "next/navigation";
import { SetActionsMenu } from "@modules/sets/components/SetActionsMenu";
import { SetEmptyState } from "@modules/sets/components/SetEmptyState";
import { Button } from "@components/ui/button";
import { formatDate } from "@lib/date";
import { SongSearchDialog } from "@modules/songs/components/SongSearchDialog";
import { useState, useCallback, useEffect } from "react";
import { api } from "@/trpc/react";
import { validate as uuidValidate } from "uuid";
import { useAuth } from "@clerk/nextjs";
import { SetSectionCard } from "@modules/sets/components/SetSectionCard";
import { type SetSectionWithSongs } from "@lib/types";
import { useSetQuery } from "@modules/sets/api";
import { SetPageLoadingState } from "@modules/sets/components/SetLoadingState";
import { SetPageErrorState } from "@modules/sets/components/SetErrorState";
import { HStack } from "@components/HStack";
import { VStack } from "@components/VStack";
import { PageContentContainer } from "@components/PageContentContainer";
import { type ConfigureSongForSetProps } from "@modules/songs/components/ConfigureSongForSet/ConfigureSongForSet";
import { cn } from "@lib/utils";
import { SetSectionTypeCombobox } from "@modules/sets/components/SetSectionTypeCombobox";
import { useMediaQuery } from "usehooks-ts";
import { DESKTOP_MEDIA_QUERY_STRING } from "@lib/constants";
import { type ComboboxOption } from "@components/ui/combobox";
import { toast } from "sonner";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@components/ResponsiveDialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { SetNotes } from "@modules/sets/components/SetNotes";

type SetListPageProps = {
  params: { organization: string; setId: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default function SetListPage({ params }: SetListPageProps) {
  const searchParams = useSearchParams();

  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);
  const textSize = isDesktop ? "text-base" : "text-xs";

  const [prePopulatedSetSectionId, setPrePopulatedSetSectionId] =
    useState<ConfigureSongForSetProps["prePopulatedSetSectionId"]>(undefined);
  const [isSongSearchDialogOpen, setIsSongSearchDialogOpen] =
    useState<boolean>(false);
  const [newSetSectionType, setNewSetSectionType] =
    useState<ComboboxOption | null>(null);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] =
    useState<boolean>(false);

  const createSetSectionMutation = api.setSection.create.useMutation();
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

  const songCount =
    setData?.sections.reduce(
      (total, section) => total + section.songs.length,
      0,
    ) ?? 0;

  return (
    <PageContentContainer className="gap-8 lg:mb-16">
      <VStack className="gap-6">
        <HStack className="items-start justify-between">
          <PageTitle
            title={formatDate(setData.date, { month: "long" })}
            subtitle={setData.eventType.name}
            details={`${songCount} ${pluralize(songCount, { singular: "song", plural: "songs" })}`}
          />
          <HStack className="gap-2">
            <SetActionsMenu
              setId={params.setId}
              organizationId={userMembership.organizationId}
              archived={setData.isArchived ?? false}
              setIsAddSectionDialogOpen={setIsAddSectionDialogOpen}
              align="end"
            />
            {setData?.sections && setData.sections.length > 0 && (
              <Button onClick={openAddSongDialog} className="hidden md:flex">
                <Plus /> Add a song
              </Button>
            )}
          </HStack>
        </HStack>
        {setData.isArchived && (
          <HStack className="flex items-center gap-1 uppercase text-slate-500">
            <Archive />
            <Text>Set is archived</Text>
          </HStack>
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
        <VStack className="gap-8 lg:gap-12">
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

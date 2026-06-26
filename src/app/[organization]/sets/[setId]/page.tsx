"use client";
import { use, useCallback, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { validate as uuidValidate } from "uuid";

import { Button } from "@components/ui/button";
import { HStack } from "@components/HStack";
import { PageContentContainer } from "@components/PageContentContainer";
import { VStack } from "@components/VStack";
import { useSetQuery } from "@modules/sets/api";
import { SetActionsMenu } from "@modules/sets/components/SetActionsMenu";
import { SetDetails } from "@modules/sets/components/SetDetails";
import { SetEmptyState } from "@modules/sets/components/SetEmptyState";
import { SetPageErrorState } from "@modules/sets/components/SetErrorState";
import { SetPageLoadingState } from "@modules/sets/components/SetLoadingState";
import { SetNotes } from "@modules/sets/components/SetNotes";
import { SetSectionCard } from "@modules/sets/components/SetSectionCard";
import { SetSectionCreationDialog } from "@modules/sets/components/SetSectionCreationDialog";
import { getSetSongNumbering } from "@modules/sets/utils/getSetSongNumbering";
import { ArchivedBanner } from "@modules/shared/components";
import { type ConfigureSongForSetProps } from "@modules/songs/components/ConfigureSongForSet/ConfigureSongForSet";
import { SongSearchDialog } from "@modules/songs/components/SongSearchDialog";
import { logger } from "@lib/loggers/logger";
import { trpc } from "@lib/trpc";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

type SetListPageProps = {
  params: Promise<{ organization: string; setId: string }>;
  searchParams: Promise<SearchParamsRecord>;
};

const getSearchParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const createURLSearchParams = (searchParams: SearchParamsRecord) => {
  const urlSearchParams = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => urlSearchParams.append(key, item));
      return;
    }

    if (value) {
      urlSearchParams.set(key, value);
    }
  });

  return urlSearchParams;
};

export default function SetListPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: SetListPageProps) {
  const params = use(paramsPromise);
  const searchParams = use(searchParamsPromise);

  const [isEditingSetDetails, setIsEditingSetDetails] =
    useState<boolean>(false);
  const [prePopulatedSetSectionId, setPrePopulatedSetSectionId] =
    useState<ConfigureSongForSetProps["prePopulatedSetSectionId"]>(undefined);
  const [preSelectedSongId, setPreSelectedSongId] = useState<string | null>(
    null,
  );
  const [isSongSearchDialogOpen, setIsSongSearchDialogOpen] =
    useState<boolean>(false);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] =
    useState<boolean>(false);

  useEffect(() => {
    const addSongDialogOpen = getSearchParamValue(
      searchParams.addSongDialogOpen,
    );
    const setSectionIdFromUrl = getSearchParamValue(searchParams.setSectionId);
    const songIdFromUrl = getSearchParamValue(searchParams.songId);

    const isSongSearchDialogOpenFromUrl = [null, undefined, "false", "0"].every(
      (falsyValue) => addSongDialogOpen !== falsyValue,
    );

    setIsSongSearchDialogOpen(isSongSearchDialogOpenFromUrl);
    setPrePopulatedSetSectionId(setSectionIdFromUrl);
    setPreSelectedSongId(songIdFromUrl ?? null);
  }, [searchParams]);

  const validateParams = useCallback(() => {
    const isOrganizationIdValidUuid = uuidValidate(params.organization);
    const isSetIdValidUuid = uuidValidate(params.setId);
    if (!isOrganizationIdValidUuid) {
      logger.error(`🤖 - ${params.organization} is an invalid organization ID`);
    }

    if (!isSetIdValidUuid) {
      logger.error(`🤖 - ${params.setId} is invalid set ID`);
    }

    if (!isOrganizationIdValidUuid || !isSetIdValidUuid) {
      logger.error(`🤖 - Invalid params`);
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
  } = trpc.user.getUser.useQuery({ userId: userId! }, { enabled: !!userId }); // we use a non-null assertion here since the query will be disabled if userId is falsy
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

  const openAddSongDialog = (
    setSectionId?: ConfigureSongForSetProps["prePopulatedSetSectionId"],
  ) => {
    const params = createURLSearchParams(searchParams);
    params.set("addSongDialogOpen", "1");
    if (setSectionId) {
      params.set("setSectionId", setSectionId);
    } else {
      params.delete("setSectionId");
    }
    const queryString = params.toString();
    window.history.pushState(null, "", `?${queryString}`);
    setPrePopulatedSetSectionId(setSectionId);
    setIsSongSearchDialogOpen(true);
  };

  return (
    <PageContentContainer className="gap-8 lg:mb-16">
      <VStack className="gap-4">
        <HStack className="items-start justify-between">
          <SetDetails
            set={setData}
            isEditing={isEditingSetDetails}
            setIsEditing={setIsEditingSetDetails}
          />
          <HStack className="gap-2">
            {setData?.sections && setData.sections.length > 0 && (
              <Button
                onClick={() => openAddSongDialog()}
                className="hidden md:flex"
              >
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
          <ArchivedBanner itemType="set" setId={setData.id} />
        )}
        <SetNotes
          setId={params.setId}
          value={setData.notes}
          organizationId={userMembership.organizationId}
        />
        {setData?.sections && setData.sections.length > 0 && (
          <Button onClick={() => openAddSongDialog()} className="md:hidden">
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
        <VStack className="gap-6">
          <>
            {getSetSongNumbering(setData.sections).map((numberedSection) => (
              <SetSectionCard
                key={numberedSection.section.id}
                numberedSection={numberedSection}
                setSectionsLength={setData.sections.length}
                withActionsMenu
                onAddSongClick={() =>
                  openAddSongDialog(numberedSection.section.id)
                }
              />
            ))}
          </>
          <Button
            variant="outline"
            onClick={() => setIsAddSectionDialogOpen(true)}
          >
            <Plus /> Add another section
          </Button>
        </VStack>
      )}
      <SetSectionCreationDialog
        open={isAddSectionDialogOpen}
        onOpenChange={setIsAddSectionDialogOpen}
        setId={setData.id}
        organizationId={userMembership.organizationId}
        existingSetSections={setData.sections}
      />

      <SongSearchDialog
        open={isSongSearchDialogOpen}
        onOpenChange={setIsSongSearchDialogOpen}
        existingSetSections={setData.sections}
        setId={setData.id}
        prePopulatedSetSectionId={prePopulatedSetSectionId}
        preSelectedSongId={preSelectedSongId}
      />
    </PageContentContainer>
  );
}

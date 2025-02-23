"use client";
import { pluralize } from "@lib/string";
import { PageTitle } from "@components/PageTitle";
import { Text } from "@components/Text";
import { Archive, Note, Plus } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { SetActionsMenu } from "@modules/sets/components/SetActionsMenu";
import { SetEmptyState } from "@modules/sets/components/SetEmptyState";
import { Button } from "@components/ui/button";
import { formatDate } from "@lib/date";
import { SongSearchDialog } from "@modules/songs/components/SongSearchDialog";
import { useState, useCallback } from "react";
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

type SetListPageProps = { params: { organization: string; setId: string } };

export default function SetListPage({ params }: SetListPageProps) {
  const [isSongSearchDialogOpen, setIsSongSearchDialogOpen] =
    useState<boolean>(false);

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

  const songCount =
    setData?.sections.reduce(
      (total, section) => total + section.songs.length,
      0,
    ) ?? 0;

  return (
    <PageContentContainer className="gap-8">
      <VStack className="gap6">
        <PageTitle
          title={formatDate(setData.date, { month: "long" })}
          subtitle={setData.eventType.name}
          details={`${songCount} ${pluralize(songCount, { singular: "song", plural: "songs" })}`}
        />
        {setData.isArchived && (
          <HStack className="flex items-center gap-1 uppercase text-slate-500">
            <Archive />
            <Text>Set is archived</Text>
          </HStack>
        )}
        <VStack className="gap-6">
          {setData.notes && (
            <VStack className="gap-2">
              <Text style="header-small-semibold" className="text-slate-500">
                Set notes
              </Text>
              <Text>{setData.notes}</Text>
            </VStack>
          )}
          <HStack className="flex gap-2">
            <Button variant="outline" size="sm">
              <Note />
              {setData.notes ? "Edit notes" : "Add set notes"}
            </Button>
            <SetActionsMenu
              setId={params.setId}
              organizationId={userMembership.organizationId}
              archived={setData.isArchived ?? false}
            />
          </HStack>
        </VStack>
      </VStack>
      {(!setData?.sections || setData.sections.length === 0) && (
        <SetEmptyState
          onActionClick={() => {
            setIsSongSearchDialogOpen(true);
          }}
        />
      )}
      {setData?.sections && setData.sections.length > 0 && (
        <VStack className="gap-8 lg:gap-12">
          <>
            <Button
              variant="secondary"
              onClick={() => setIsSongSearchDialogOpen(true)}
            >
              <Plus /> Add a song
            </Button>
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
                  sectionStartIndex={sectionStartIndex}
                  isFirstSection={section.position === 0}
                  isLastSection={
                    section.position === setData.sections.length - 1
                  }
                  withActionsMenu
                />
              );
            })}
          </>
          <Button variant="outline">
            <Plus /> Add another section
          </Button>
        </VStack>
      )}

      <SongSearchDialog
        open={isSongSearchDialogOpen}
        setOpen={setIsSongSearchDialogOpen}
        existingSetSections={setData.sections}
        setId={setData.id}
      />
    </PageContentContainer>
  );
}

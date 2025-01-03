"use client";
import { pluralize } from "@lib/string";
import { CardList } from "@modules/SetListCard";
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
  if (!!setQueryError || !!userQueryError) {
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
    <div className="flex h-full min-w-full max-w-xs flex-1 flex-col gap-6">
      {!isPageLoading && !queryError && (
        <>
          <PageTitle
            title={formatDate(setData.date, { month: "long" })}
            subtitle={setData.eventType.event}
            details={`${songCount} ${pluralize(songCount, { singular: "song", plural: "songs" })}`}
          />
          {setData.isArchived && (
            <div className="flex items-center gap-1 uppercase text-slate-500">
              <Archive />
              <Text>Set is archived</Text>
            </div>
          )}
          <section className="flex gap-2">
            <Button variant="outline" size="sm">
              <Note />
              Add set notes
            </Button>
            <SetActionsMenu
              setId={params.setId}
              organizationId={userMembership.organizationId}
              archived={setData.isArchived ?? false}
            />
          </section>
          {(!setData?.sections || setData.sections.length === 0) && (
            <SetEmptyState
              onActionClick={() => {
                setIsSongSearchDialogOpen(true);
              }}
            />
          )}
          {setData?.sections && setData.sections.length > 0 && (
            <>
              <Button
                variant="secondary"
                onClick={() => setIsSongSearchDialogOpen(true)}
              >
                <Plus /> Add to this set
              </Button>
              <CardList gap="gap-6">
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
                    />
                  );
                })}
              </CardList>
            </>
          )}
          <SongSearchDialog
            open={isSongSearchDialogOpen}
            setOpen={setIsSongSearchDialogOpen}
            existingSetSections={setData.sections}
          />
        </>
      )}
    </div>
  );
}

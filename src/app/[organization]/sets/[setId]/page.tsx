"use client";
import { pluralize } from "@lib/string";
import { CardList, SetListCardBody, SongItem } from "@modules/SetListCard";
import { PageTitle } from "@components/PageTitle";
import { Text } from "@components/Text";
import { Archive, DotsThree, Note } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SetActionsMenu } from "@modules/sets/components/SetActionsMenu";
import { SetEmptyState } from "@modules/sets/components/SetEmptyState";
import { Button } from "@components/ui/button";
import { formatDate } from "@lib/date";
import { SongSearchDialog } from "@modules/songs/components/SongSearchDialog";
import React from "react";
import { api } from "@/trpc/react";
import { validate as uuidValidate } from "uuid";
import { useAuth } from "@clerk/nextjs";

export default function SetListPage({
  params,
}: {
  params: { organization: string; setId: string };
}) {
  const isOrganizationIdValidUuid = uuidValidate(params.organization);
  const isSetIdValidUuid = uuidValidate(params.setId);

  if (!isOrganizationIdValidUuid) {
    console.error(`🤖 - ${params.organization} is an invalid organization ID`);
  }

  if (!isSetIdValidUuid) {
    console.error(`🤖 - ${params.setId} is invalid set ID`);
  }

  if (!isOrganizationIdValidUuid || !isSetIdValidUuid) {
    console.error(`🤖 - Invalid params`);
    // notFound();
  }

  const {
    data: setData,
    isLoading: isSetQueryLoading,
    error: setQueryError,
  } = api.set.get.useQuery({
    organizationId: params.organization,
    setId: params.setId,
  });

  // Auth
  const { userId, isLoaded: isAuthLoaded } = useAuth();

  if (isAuthLoaded && !userId) {
    redirect("/");
  }

  const [isSongSearchDialogOpen, setIsSongSearchDialogOpen] =
    React.useState<boolean>(false);

  // FIXME: redirect to dashboard if no sets are found
  if (!userId) {
    redirect(`/`);
  }

  // const userData = await api.user.getUser({ userId });
  const {
    data: userData,
    isLoading: isUserQueryLoading,
    error: userQueryError,
  } = api.user.getUser.useQuery({ userId });
  const userMembership = userData?.memberships[0];

  const isPageLoading = isSetQueryLoading || isUserQueryLoading;
  const queryError = !!setQueryError || !!userQueryError;

  if (!isPageLoading && !queryError) {
    // if (!userMembership) {
    if (!userData?.memberships[0] || !setData) {
      redirect(`/`);
    }

    if (!setData) {
      redirect("/");
    }
  }

  const songCount =
    setData?.sections.reduce(
      (total, section) => total + section.songs.length,
      0,
    ) ?? 0;

  return (
    <div className="flex h-full min-w-full max-w-xs flex-1 flex-col gap-6">
      {isPageLoading && <Text>Loading...</Text>}
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
            <CardList gap="gap-6">
              {setData.sections.map((section) => (
                // FIXME: refactor into reusable component
                <div
                  key={section.id}
                  className="flex flex-col gap-4 rounded border border-slate-200 p-4 shadow"
                >
                  <header className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <Text asElement="h3" style="header-medium-semibold">
                        {section.type.section}
                      </Text>
                      <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
                        <DotsThree className="text-slate-900" size={12} />
                      </button>
                    </div>
                    <hr className="bg-slate-100" />
                  </header>
                  <SetListCardBody>
                    {section.songs && section.songs.length > 0 && (
                      <div className="flex flex-col gap-3">
                        {section.songs.map((setSectionSong) => {
                          let indexStart = 1;

                          for (
                            let sectionPosition = 0;
                            sectionPosition < section.position;
                            sectionPosition++
                          ) {
                            indexStart +=
                              setData.sections[sectionPosition]!.songs.length;
                          }

                          return (
                            <Link
                              key={setSectionSong.songId}
                              href={`../songs/${setSectionSong.songId}`}
                            >
                              <SongItem
                                index={indexStart + setSectionSong.position}
                                songKey={setSectionSong.key}
                                name={setSectionSong.song.name}
                                {...(setSectionSong.notes && {
                                  notes: setSectionSong.notes,
                                })}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </SetListCardBody>
                </div>
              ))}
            </CardList>
          )}
          <SongSearchDialog
            open={isSongSearchDialogOpen}
            setOpen={setIsSongSearchDialogOpen}
          />
        </>
      )}
    </div>
  );
}

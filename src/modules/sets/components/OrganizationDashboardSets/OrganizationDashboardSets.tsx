"use client";

import Link from "next/link";

import { Skeleton } from "@components/ui/skeleton";
import { PageContentContainer } from "@components/PageContentContainer";
import { VStack } from "@components/VStack";
import {
  SetListCardHeader,
  SetListCardSection,
  SongItem,
} from "@modules/SetListCard";
import { SetPageErrorState } from "@modules/sets/components/SetErrorState";
import { pluralize } from "@lib/string";
import { trpc } from "@lib/trpc";
import { PageTitle } from "@/components";

type OrganizationDashboardSetsProps = {
  organizationId: string;
};

export const OrganizationDashboardSets = ({
  organizationId,
}: OrganizationDashboardSetsProps) => {
  const {
    data: organizationSets,
    isLoading,
    error,
  } = trpc.set.getOrganizationSets.useQuery({
    organizationId,
  });

  const setsCount = organizationSets?.length ?? 0;

  return (
    <PageContentContainer>
      <PageTitle
        title="Upcoming sets"
        details={
          isLoading
            ? undefined
            : `${setsCount} ${pluralize(setsCount, { singular: "set", plural: "sets" })}`
        }
      />
      <section className="flex justify-between py-2">
        <select aria-label="Filter sets by date range">
          <option value="This week">This week</option>
        </select>
        <a className="text-xs text-slate-900">See all</a>
      </section>
      {error ? (
        <SetPageErrorState />
      ) : isLoading ? (
        <VStack className="gap-8">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </VStack>
      ) : (
        // FIXME: update set list styling
        <VStack className="gap-8">
          {organizationSets?.map((orgSet) => (
            <div key={orgSet.id} className="relative">
              <Link
                href={`/${organizationId}/sets/${orgSet.id}`}
                className="absolute inset-0 rounded-lg"
                aria-label={`Open ${orgSet.eventType.name} set`}
              />
              <VStack className="h-full max-w-xs min-w-full flex-1 gap-6 rounded-lg border p-4 shadow-sm lg:p-6">
                <SetListCardHeader
                  date={orgSet.date}
                  type={orgSet.eventType.name}
                  numberOfSongs={orgSet.sections.reduce(
                    (total, section) => total + section.songs.length,
                    0,
                  )}
                />
                <VStack className="gap-6">
                  {orgSet.sections.map((section) => (
                    <SetListCardSection
                      key={section.id}
                      title={section.type.name}
                    >
                      {section.songs.map((setSectionSong) => {
                        let indexStart = 1;

                        for (
                          let sectionPosition = 0;
                          sectionPosition < section.position;
                          sectionPosition++
                        ) {
                          indexStart +=
                            orgSet.sections[sectionPosition]!.songs.length;
                        }

                        return (
                          <Link
                            key={setSectionSong.songId}
                            href={`/${organizationId}/songs/${setSectionSong.songId}`}
                            className="relative z-10"
                          >
                            <SongItem
                              index={indexStart + setSectionSong.position}
                              setSectionSong={setSectionSong}
                              setSectionType={section.type.name}
                              setId={orgSet.id}
                            />
                          </Link>
                        );
                      })}
                    </SetListCardSection>
                  ))}
                </VStack>
              </VStack>
            </div>
          ))}
        </VStack>
      )}
    </PageContentContainer>
  );
};

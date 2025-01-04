"use client";

import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { api } from "@/trpc/react";
import { useAuth } from "@clerk/nextjs";
import { Text } from "@components/Text";
import { useUserQuery } from "@modules/users/api/queries";
import { CommandLoading } from "cmdk";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import {
  SongListItem,
  type SongListItemProps,
} from "@modules/songs/components/SongListItem";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { type Tag, type Song } from "@lib/types";

export type SongSearchResult =
  | (Pick<Song, "name" | "preferredKey" | "isArchived"> & {
      songId: Song["id"];
      similarityScore: number;
      lastPlayedDate: SongListItemProps["lastPlayed"];
      tags?: Tag["tag"][];
    })
  | undefined;

type SongSearchProps = {
  onSongSelect?: (selectedSong?: SongSearchResult) => void;
};

const SEARCH_DEBOUNCE_DELAY = 350;

export const SongSearch: React.FC<SongSearchProps> = ({ onSongSelect }) => {
  const defaultSearchQuery = "";
  const [searchInput, setSearchInput] = useState<string>(defaultSearchQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounceValue(
    searchInput,
    SEARCH_DEBOUNCE_DELAY,
  );

  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
    isAuthLoaded,
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  const {
    data: songSearchData,
    error: songSearchError,
    isLoading: songSearchLoading,
  } = api.song.search.useQuery(
    {
      organizationId: userMembership!.organizationId, // we use a type assertion here since if this isn't true, the query will be disabled
      searchInput: debouncedSearchQuery,
    },
    {
      enabled:
        !!userMembership?.organizationId &&
        !!debouncedSearchQuery &&
        debouncedSearchQuery.length > 2,
    },
  );

  if (!userData?.id) {
    redirect("/");
  }

  if (!isAuthLoaded) {
    return <Text>Loading auth...</Text>;
  }

  if (userQueryLoading) {
    return <Text>Getting user...</Text>;
  }

  if (!songSearchData || songSearchError) {
    // TODO: handle the error
  }

  const handleSearchInputChange = (newValue: string) => {
    setSearchInput(newValue);
    setDebouncedSearchQuery(newValue);
  };

  const handleSongSelect = (selectedSongId: string) => {
    const selectedSong = songSearchData?.find(
      (songData) => songData.songId === selectedSongId,
    );
    onSongSelect?.(selectedSong);
  };

  return (
    <>
      <CommandInput
        placeholder="Search for a song..."
        value={searchInput}
        onValueChange={(newValue) => handleSearchInputChange(newValue)}
      />
      <CommandList>
        {songSearchLoading && (
          <CommandLoading>Searching songs...</CommandLoading>
        )}
        {!songSearchLoading &&
          debouncedSearchQuery &&
          debouncedSearchQuery.length > 0 && (
            <CommandEmpty>
              No songs found for &quot;{debouncedSearchQuery}&quot;.
            </CommandEmpty>
          )}
        <CommandGroup heading="Songs">
          <div className="flex flex-col gap-2">
            {songSearchData?.map((searchResult) => {
              const { lastPlayedDate, tags, ...songData } = searchResult;
              return (
                <CommandItem
                  key={searchResult.songId}
                  value={searchResult.songId}
                  className="flex items-center justify-between"
                  onSelect={handleSongSelect}
                >
                  <SongListItem
                    song={{ id: songData.songId, ...songData }}
                    lastPlayed={lastPlayedDate}
                    tags={tags}
                  />
                  <CaretRight size="12px" className="text-slate-500" />
                </CommandItem>
              );
            })}
          </div>
        </CommandGroup>
      </CommandList>
    </>
  );
};

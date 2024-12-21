"use client";

import {
  CommandDialog,
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
import { SongListItem } from "../SongListItem";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

type SongSearchDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SEARCH_DEBOUNCE_DELAY = 350;

export const SongSearchDialog: React.FC<SongSearchDialogProps> = ({
  open,
  setOpen,
}) => {
  const { userId, isLoaded } = useAuth();

  const defaultSearchQuery = "";
  const [searchInput, setSearchInput] = useState<string>(defaultSearchQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounceValue(
    searchInput,
    SEARCH_DEBOUNCE_DELAY,
  );

  if (!userId) {
    redirect("/");
  }

  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
  } = useUserQuery({ userId });
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

  if (!isLoaded) {
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

  return (
    <CommandDialog
      open={open}
      onOpenChange={(open) => {
        setSearchInput("");
        setOpen(open);
      }}
      shouldFilter={false}
      fixed
    >
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
                  value={searchResult.name}
                  className="flex items-center justify-between"
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
    </CommandDialog>
  );
};

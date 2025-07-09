"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DotsSixVertical } from "@phosphor-icons/react";

import { HStack } from "@components/HStack";
import { VStack } from "@components/VStack";
import { SongContent } from "@modules/SetListCard/components/SongContent";
import { DraggableSongItem } from "@modules/shared/components/DraggableSongItem/DraggableSongItem";
import { type DraggableSongListItem } from "@modules/songs/forms/AddSongToSet/components/SetSongPositionStep";
import { type SetSectionSong, type Song } from "@lib/types";
import { cn } from "@lib/utils";

import { DraggableSongListContext } from "../DraggableSongListContext/DraggableSongListContext";

type ActiveDraggableSongItem = Pick<Song, "id" | "name"> & {
  songKey?: Song["preferredKey"];
  index: SetSectionSong["position"];
};

export type DraggableSongListProps = {
  songs: DraggableSongListItem[];
  onDragEnd: (songItems: DraggableSongListItem[]) => void;
  className?: string;
};

export const DraggableSongList: React.FC<DraggableSongListProps> = ({
  songs,
  onDragEnd,
  className,
}) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeSongItem, setActiveSongItem] =
    useState<ActiveDraggableSongItem | null>(null);
  const [songItems, setSongItems] = useState<DraggableSongListItem[]>([]);

  useEffect(() => {
    setSongItems(songs);
  }, [songs]);

  const handleDragStart = (dragStartEvent: DragStartEvent) => {
    const { active } = dragStartEvent;

    setActiveId(active.id);

    const songBeingDraggedIndex = songItems.findIndex(
      (songItem) => songItem.id === active.id,
    );

    const songBeingDragged = songItems[songBeingDraggedIndex];

    if (songBeingDragged) {
      setActiveSongItem({
        ...songBeingDragged,
        index: songBeingDraggedIndex + 1,
      });
    }
  };

  const handleDragOver = (dragOverEvent: DragOverEvent) => {
    const { active, over } = dragOverEvent;

    if (over?.id && active.id !== over.id) {
      setSongItems((songItems) => {
        const oldIndex = songItems.findIndex(
          (songItem) => songItem.id === active.id,
        );
        const newIndex = songItems.findIndex(
          (songItem) => songItem.id === over?.id,
        );

        const updatedSongItems = arrayMove(songItems, oldIndex, newIndex);

        const updatedActiveSongItem = updatedSongItems[newIndex];

        if (updatedActiveSongItem) {
          setActiveSongItem({
            ...updatedActiveSongItem,
            index: newIndex + 1,
          });
        }

        return updatedSongItems;
      });
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
    setActiveSongItem(null);

    onDragEnd(songItems);
  };

  return (
    <DraggableSongListContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={songItems.map((songItem) => songItem.id)}
        strategy={verticalListSortingStrategy}
      >
        <VStack className={cn("gap-2", className)}>
          {songItems.map((song, index) => (
            <DraggableSongItem
              id={song.id}
              disabled={song.type === "existing"}
              active={song.id === activeId}
              key={song.id}
              song={{
                id: song.id,
                songKey: song.songKey,
                name: song.name,
                index: index + 1,
              }}
            />
          ))}
        </VStack>
      </SortableContext>
      {createPortal(
        <DragOverlay>
          {activeId && activeSongItem ? (
            <HStack
              className={cn(
                "max-w-fit gap-1 rounded-lg border bg-white p-3 hover:cursor-grab",
              )}
              id={`${activeId}a`}
            >
              <DotsSixVertical />
              <SongContent
                songKey={activeSongItem.songKey}
                name={activeSongItem.name}
                index={activeSongItem.index}
              />
            </HStack>
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DraggableSongListContext>
  );
};

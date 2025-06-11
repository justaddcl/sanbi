"use client";

import React, { useEffect, useState } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { VStack } from "@components/VStack";
import { type SongContentProps } from "@modules/SetListCard/components/SongContent";

import {
  DraggableSongItem,
  DraggableSongItemProps,
  isDraggableSongItem,
} from "@modules/shared/components/DraggableSongItem/DraggableSongItem";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { flushSync } from "react-dom";
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge";
import { triggerPostMoveFlash } from "@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash";

export type DraggableSongListProps = {
  songs: Omit<DraggableSongItemProps["song"], "index">[];
};

export const DraggableSongList: React.FC<DraggableSongListProps> = ({
  songs,
}) => {
  const [songItems, setSongItems] =
    useState<DraggableSongListProps["songs"]>(songs);

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => isDraggableSongItem(source.data),
      onDrop({ location, source }) {
        const [target] = location.current.dropTargets;
        if (!target) {
          return;
        }

        const sourceData = source.data;
        const targetData = target.data;

        console.log("🚀 ~ DraggableSongList.tsx:32 ~ onDrop:", {
          sourceData,
          targetData,
        });

        if (
          !isDraggableSongItem(sourceData) ||
          !isDraggableSongItem(targetData)
        ) {
          return;
        }

        const indexOfSource = songItems.findIndex(
          (song) => song.id === sourceData.id,
        );
        const indexOfTarget = songItems.findIndex(
          (song) => song.id === targetData.id,
        );

        console.log(
          "🚀 ~ DraggableSongList.tsx:56 ~ onDrop ~ index Of Source and target:",
          { indexOfSource, indexOfTarget },
        );

        if (indexOfTarget < 0 || indexOfSource < 0) {
          return;
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData);

        console.log(
          "🚀 ~ DraggableSongList.tsx:57 ~ onDrop ~ closestEdgeOfTarget:",
          closestEdgeOfTarget,
        );

        flushSync(() => {
          setSongItems(
            reorderWithEdge({
              list: songItems,
              startIndex: indexOfSource,
              indexOfTarget,
              closestEdgeOfTarget,
              axis: "vertical",
            }),
          );
        });

        const element = document.querySelector(
          `[data-song-id="${sourceData.id}"]`,
        );
        if (element instanceof HTMLElement) {
          triggerPostMoveFlash(element);
        }
      },
    });
  }, [songItems]);

  return (
    <VStack className="gap-2 rounded-lg border p-2">
      {songItems.map((song, index) => (
        <DraggableSongItem
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
  );
};

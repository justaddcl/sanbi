"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVertical } from "@phosphor-icons/react";
import type React from "react";

import { HStack } from "@components/HStack";
import { cn } from "@lib/utils";
import {
  SongContent,
  type SongContentProps,
} from "@modules/SetListCard/components/SongContent";

export type DraggableSongItem = {
  id: string;
  songKey?: SongContentProps["songKey"];
  name: SongContentProps["name"];
  index: SongContentProps["index"];
};

export type DraggableSongItemProps = {
  /** id that matches the song.id */
  id: string;
  disabled: boolean;
  active: boolean;
  song: DraggableSongItem;
};

export const DraggableSongItem: React.FC<DraggableSongItemProps> = ({
  id,
  disabled,
  active,
  song,
}) => {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <HStack
      ref={setNodeRef}
      style={style}
      className={cn("gap-1 rounded-lg border p-3", "touch-none", {
        "opacity-40": active,
        "hover:cursor-grab": !disabled,
        "cursor-not-allowed bg-slate-100 pl-8": disabled,
      })}
      {...listeners}
      {...attributes}
    >
      {!disabled && <DotsSixVertical />}
      <SongContent
        songKey={song.songKey}
        name={song.name}
        index={song.index}
        disabled={disabled}
      />
    </HStack>
  );
};

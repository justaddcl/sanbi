"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";

import { HStack } from "@components/HStack";
import {
  SongContent,
  type SongContentProps,
} from "@modules/SetListCard/components/SongContent";
import { cn } from "@lib/utils";
import { DotsSixVertical } from "@phosphor-icons/react";
import { createPortal } from "react-dom";

type DraggableSongItemState =
  | { type: "idle" }
  | { type: "preview"; container: HTMLElement }
  | { type: "is-dragging" }
  | {
      type: "is-dragging-over";
      closestEdge: Edge | null;
    };

const idle: DraggableSongItemState = { type: "idle" };

const privateDraggableSongItemKey = Symbol("DraggableSongItem");

export const isDraggableSongItem = (
  data: Record<string | symbol, unknown>,
): data is DraggableSongItem => {
  return Boolean(data[privateDraggableSongItemKey]);
};

const getDraggableSongItemData = (
  data: Omit<DraggableSongItem, typeof privateDraggableSongItemKey>,
) => {
  return {
    [privateDraggableSongItemKey]: true,
    ...data,
  };
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

type DraggableSongItem = {
  [privateDraggableSongItemKey]: true;
  id: string;
  songKey: SongContentProps["songKey"];
  name: SongContentProps["name"];
  index: SongContentProps["index"];
};

export type DraggableSongItemProps = {
  song: Omit<DraggableSongItem, typeof privateDraggableSongItemKey>;
};

export const DraggableSongItem: React.FC<DraggableSongItemProps> = ({
  song,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<DraggableSongItemState>(idle);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return noop;
    }

    return combine(
      draggable({
        element,
        getInitialData: () => getDraggableSongItemData(song),
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({
              x: "16px",
              y: "8px",
            }),
            render({ container }) {
              setState({ type: "preview", container });
            },
          });
        },
        onDragStart: () => {
          setState({ type: "is-dragging" });
        },
        onDrop: () => {
          setState(idle);
        },
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => {
          if (source.element === element) {
            return false;
          }

          return isDraggableSongItem(source.data);
        },
        getData({ input }) {
          const data = getDraggableSongItemData(song);

          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          });
        },
        getIsSticky: () => true,
        onDragEnter: ({ self }) => {
          const closestEdge = extractClosestEdge(self.data);
          setState({ type: "is-dragging-over", closestEdge });
        },
        onDrag: ({ self }) => {
          const closestEdge = extractClosestEdge(self.data);

          // Only need to update react state if nothing has changed
          // Prevents re-rendering
          setState((current) => {
            if (
              current.type === "is-dragging-over" &&
              current.closestEdge === closestEdge
            ) {
              return current;
            }
            return { type: "is-dragging-over", closestEdge };
          });
        },
        onDragLeave: () => {
          setState(idle);
        },
        onDrop: () => {
          setState(idle);
        },
      }),
    );
  }, [song]);

  return (
    <>
      <HStack
        data-song-id={song.id}
        ref={ref}
        className={cn("gap-1 rounded-lg border p-3 hover:cursor-grab", {
          "opacity-40": state.type === "is-dragging",
        })}
      >
        <DotsSixVertical />
        <SongContent
          songKey={song.songKey}
          name={song.name}
          index={song.index}
        />
        {/* {state.type === 'is-dragging-over' && state.closestEdge ? (
          <DropIndicator edge={state.closestEdge} gap={'8px'} />
        ) : null} */}
      </HStack>
      {state.type === "preview"
        ? createPortal(
            <DraggableSongItemDragPreview song={song} />,
            state.container,
          )
        : null}
    </>
  );
};

const DraggableSongItemDragPreview: React.FC<DraggableSongItemProps> = ({
  song,
}) => {
  return <div className="rounded border-solid bg-white p-2">{song.name}</div>;
};

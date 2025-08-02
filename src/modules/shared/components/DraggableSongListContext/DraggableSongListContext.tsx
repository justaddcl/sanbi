"use client";

import React from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

type DraggableSongListContextProps = React.PropsWithChildren & {
  onDragStart: (dragStartEvent: DragStartEvent) => void;
  onDragOver?: (dragOverEvent: DragOverEvent) => void;
  onDragEnd: (dragEndEvent: DragEndEvent) => void;
};

export const DraggableSongListContext: React.FC<
  DraggableSongListContextProps
> = ({ onDragStart, onDragOver, onDragEnd, children }) => {
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={(dragStartEvent) => {
        onDragStart(dragStartEvent);
      }}
      onDragOver={(dragOverEvent) => {
        onDragOver?.(dragOverEvent);
      }}
      onDragEnd={(dragEndEvent) => {
        onDragEnd(dragEndEvent);
      }}
    >
      {children}
    </DndContext>
  );
};

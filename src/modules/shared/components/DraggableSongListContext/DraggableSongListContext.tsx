"use client";

import React from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type SensorDescriptor,
} from "@dnd-kit/core";

type DraggableSongListContextProps = React.PropsWithChildren & {
  sensors?: SensorDescriptor<any>[] | undefined;
  onDragStart: (dragStartEvent: DragStartEvent) => void;
  onDragOver?: (dragOverEvent: DragOverEvent) => void;
  onDragEnd: (dragEndEvent: DragEndEvent) => void;
};

export const DraggableSongListContext: React.FC<
  DraggableSongListContextProps
> = ({ sensors, onDragStart, onDragOver, onDragEnd, children }) => {
  return (
    <DndContext
      sensors={sensors}
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

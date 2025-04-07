"use client";

import { useResponsive } from "@/hooks/useResponsive";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { cn } from "@lib/utils";
import {
  ClockCounterClockwise,
  MusicNoteSimple,
  NotePencil,
  Tag,
} from "@phosphor-icons/react";

const iconMap = {
  ClockCounterClockwise,
  MusicNoteSimple,
  NotePencil,
  Tag,
} as const;

export type SongDetailsLabelProps = {
  icon: keyof typeof iconMap;
  label: string;
};
export const SongDetailsLabel: React.FC<SongDetailsLabelProps> = ({
  icon,
  label,
}) => {
  const Icon = iconMap[icon];
  const { textSize, isDesktop } = useResponsive();

  return (
    <HStack as="dt" className="items-center gap-2  text-slate-500">
      <Icon className="text-slate-400" size={isDesktop ? 16 : 12} />
      <Text className={cn(textSize)}>{label}</Text>
    </HStack>
  );
};

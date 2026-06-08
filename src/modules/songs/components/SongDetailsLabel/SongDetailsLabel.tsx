import {
  ClockCounterClockwise,
  MusicNoteSimple,
  NotePencil,
  Tag,
} from "@phosphor-icons/react/dist/ssr";

import { HStack } from "@components/HStack";
import { Text } from "@components/Text";

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

  return (
    <HStack as="dt" className="items-center gap-2 text-slate-500">
      <Icon aria-hidden className="text-slate-400" size={16} />
      <Text className="text-sm font-medium">{label}</Text>
    </HStack>
  );
};

import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { cn } from "@lib/utils";
import {
  ClockCounterClockwise,
  MusicNoteSimple,
  NotePencil,
  Tag,
} from "@phosphor-icons/react/dist/ssr";

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
    <HStack as="dt" className="items-center gap-2  text-slate-500">
      <Icon className="text-slate-400" size={16} />
      <Text className={cn("text-base")}>{label}</Text>
    </HStack>
  );
};

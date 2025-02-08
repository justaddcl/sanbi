import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import React from "react";
import {
  ArrowDown,
  ArrowLineDown,
  ArrowLineUp,
  ArrowUp,
  Pencil,
  Swap,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { DropdownMenuItem } from "@components/ui/dropdown-menu";
import { cn } from "@lib/utils";

const iconMap = {
  ArrowDown,
  ArrowLineDown,
  ArrowLineUp,
  ArrowUp,
  Pencil,
  Swap,
  Trash,
} as const;

type SongActionMenuItemProps = React.PropsWithChildren<{
  icon: keyof typeof iconMap;
  destructive?: boolean;
}>;

export const SongActionMenuItem: React.FC<SongActionMenuItemProps> = ({
  icon,
  destructive = false,
  children,
}) => {
  const Icon = iconMap[icon];

  return (
    <DropdownMenuItem asChild>
      <HStack className="gap-2">
        <Icon
          className={cn("text-slate-500", [destructive && "text-slate-300"])}
        />
        <Text className={cn("text-sm", [destructive && "text-slate-400"])}>
          {children}
        </Text>
      </HStack>
    </DropdownMenuItem>
  );
};

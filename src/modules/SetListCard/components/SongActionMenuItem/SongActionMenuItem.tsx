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

type SongActionMenuItemProps = {
  label: string;
  icon: keyof typeof iconMap;
  destructive?: boolean;
  disabled?: boolean;
};

export const SongActionMenuItem: React.FC<SongActionMenuItemProps> = ({
  label,
  icon,
  destructive = false,
  disabled = false,
}) => {
  const Icon = iconMap[icon];

  return (
    <DropdownMenuItem asChild disabled={disabled}>
      <HStack className="gap-2" aria-label={`${label} action`}>
        <Icon
          size={16}
          className={cn(
            "text-slate-500",
            [destructive && "text-red-500"],
            [disabled && "text-slate-400"],
          )}
        />
        <Text
          className={cn(
            "text-sm",
            [destructive && "text-red-500"],
            [disabled && "text-slate-400"],
          )}
        >
          {label}
        </Text>
      </HStack>
    </DropdownMenuItem>
  );
};

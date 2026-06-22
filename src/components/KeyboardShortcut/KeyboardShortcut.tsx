import type React from "react";

import { HStack } from "@components/HStack";
import { Keycap } from "@components/Keycap";

type KeyboardShortcutProps = {
  primaryKey: React.ReactNode;
  secondaryKey?: React.ReactNode;
  label?: string;
};

export const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({
  primaryKey,
  secondaryKey,
  label,
}) => {
  return (
    <HStack className="flex items-center gap-2">
      <HStack className="gap-1">
        <Keycap>{primaryKey}</Keycap>
        {secondaryKey && <Keycap>{secondaryKey}</Keycap>}
      </HStack>
      {label && <span>{label}</span>}
    </HStack>
  );
};

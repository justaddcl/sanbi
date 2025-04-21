import { HStack } from "@components/HStack";
import type React from "react";

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
        <kbd className="rounded-lg bg-slate-200 p-1 text-slate-900">
          {primaryKey}
        </kbd>
        {secondaryKey && (
          <kbd className="rounded-lg bg-slate-200 p-1 text-slate-900">
            {secondaryKey}
          </kbd>
        )}
      </HStack>
      {label && <span>{label}</span>}
    </HStack>
  );
};

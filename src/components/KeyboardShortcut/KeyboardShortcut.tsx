import { HStack } from "@components/HStack";

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
        <span className="rounded-lg bg-slate-200 p-1 text-slate-900">
          {primaryKey}
        </span>
        {secondaryKey && (
          <span className="rounded-lg bg-slate-200 p-1 text-slate-900">
            {secondaryKey}
          </span>
        )}
      </HStack>
      {label && <span>{label}</span>}
    </HStack>
  );
};

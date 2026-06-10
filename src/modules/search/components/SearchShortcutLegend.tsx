import {
  ArrowDown,
  ArrowElbowDownLeftIcon,
  ArrowUp,
} from "@phosphor-icons/react/dist/ssr";

import { HStack } from "@components/HStack";
import { Keycap } from "@components/Keycap";

const SearchShortcutHint = ({
  keys,
  label,
}: {
  keys: { content: React.ReactNode; label?: string }[];
  label: string;
}) => (
  <HStack className="items-center gap-1 text-[11px] leading-none text-slate-500">
    <HStack className="items-center gap-0.5">
      {keys.map((key, index) => (
        <Keycap key={`${label}-${index}`} label={key.label} variant="plain">
          {key.content}
        </Keycap>
      ))}
    </HStack>
    <span>{label}</span>
  </HStack>
);

export const SearchShortcutLegend = ({
  escapeShortcutLabel,
}: {
  escapeShortcutLabel: string;
}) => (
  <HStack className="hidden items-center justify-between gap-4 border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500 sm:flex">
    <HStack className="items-center gap-4">
      <SearchShortcutHint
        keys={[
          {
            content: <ArrowUp aria-hidden size={12} />,
            label: "Arrow up",
          },
          {
            content: <ArrowDown aria-hidden size={12} />,
            label: "Arrow down",
          },
        ]}
        label="Navigate"
      />
      <SearchShortcutHint
        keys={[
          {
            content: <ArrowElbowDownLeftIcon aria-hidden size={13} />,
            label: "Enter",
          },
        ]}
        label="Open"
      />
    </HStack>
    <SearchShortcutHint
      keys={[{ content: "Esc", label: "Escape" }]}
      label={escapeShortcutLabel}
    />
  </HStack>
);

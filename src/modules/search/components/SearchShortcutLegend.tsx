import {
  ArrowDownIcon,
  ArrowElbowDownLeftIcon,
  ArrowUpIcon,
} from "@phosphor-icons/react/dist/ssr";

import { HStack } from "@components/HStack";
import { Keycap } from "@components/Keycap";

const SHORTCUT_ARROW_ICON_SIZE = 12;
const SHORTCUT_ENTER_ICON_SIZE = 13;

type SearchShortcutHintKey = {
  content: React.ReactNode;
  label?: string;
};

type SearchShortcutHintProps = {
  keys: SearchShortcutHintKey[];
  label: string;
};

const SearchShortcutHint = ({ keys, label }: SearchShortcutHintProps) => (
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

type SearchShortcutLegendProps = {
  enterShortcutLabel?: string;
  escapeShortcutLabel: string;
  showActionsShortcut?: boolean;
};

export const SearchShortcutLegend = ({
  enterShortcutLabel = "Open",
  escapeShortcutLabel,
  showActionsShortcut = true,
}: SearchShortcutLegendProps) => (
  <HStack className="hidden items-center justify-between gap-4 border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500 sm:flex">
    <HStack className="items-center gap-4">
      <SearchShortcutHint
        keys={[
          {
            content: (
              <ArrowUpIcon aria-hidden size={SHORTCUT_ARROW_ICON_SIZE} />
            ),
            label: "Arrow up",
          },
          {
            content: (
              <ArrowDownIcon aria-hidden size={SHORTCUT_ARROW_ICON_SIZE} />
            ),
            label: "Arrow down",
          },
        ]}
        label="Navigate"
      />
      <SearchShortcutHint
        keys={[
          {
            content: (
              <ArrowElbowDownLeftIcon
                aria-hidden
                size={SHORTCUT_ENTER_ICON_SIZE}
              />
            ),
            label: "Enter",
          },
        ]}
        label={enterShortcutLabel}
      />
      {showActionsShortcut && (
        <SearchShortcutHint
          keys={[
            { content: "Shift", label: "Shift" },
            {
              content: (
                <ArrowElbowDownLeftIcon
                  aria-hidden
                  size={SHORTCUT_ENTER_ICON_SIZE}
                />
              ),
              label: "Enter",
            },
          ]}
          label="Actions"
        />
      )}
    </HStack>
    <SearchShortcutHint
      keys={[{ content: "Esc", label: "Escape" }]}
      label={escapeShortcutLabel}
    />
  </HStack>
);

import type { Dispatch, SetStateAction } from "react";
import Link from "next/link";

import { DropdownMenuSeparator } from "@components/ui/dropdown-menu";
import { ActionMenu, ActionMenuItem } from "@components/ActionMenu";
import { Text } from "@components/Text";
import { getDisplayUrl } from "@modules/songs/utils/getDisplayUrl";
import { getResourceDisplayTitle } from "@modules/songs/utils/getResourceDisplayTitle";
import { type Resource } from "@lib/types";

import { ResourceCardImage } from "../ResourceCardImage";

export type ResourceCardDisplayProps = {
  resource: Resource;
  isActionMenuOpen: boolean;
  setIsActionMenuOpen: Dispatch<SetStateAction<boolean>>;
  isRefreshPending?: boolean;
  onEdit: () => void;
  onRefreshPreview: () => void;
  onUnlink: () => void;
  onDisplayUrlParseError?: (error: unknown) => void;
};

export const ResourceCardDisplay: React.FC<ResourceCardDisplayProps> = ({
  resource,
  isActionMenuOpen,
  setIsActionMenuOpen,
  isRefreshPending = false,
  onEdit,
  onRefreshPreview,
  onUnlink,
  onDisplayUrlParseError,
}) => {
  const { url } = resource;
  const displayTitle = getResourceDisplayTitle(resource);

  return (
    <li className="relative">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-visible:ring-ring grid h-full grid-cols-[48px_1fr] items-center gap-2 rounded bg-slate-50 px-3 py-2 pr-14 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
      >
        <ResourceCardImage resource={resource} />
        <div className="flex min-w-0 flex-col gap-1 px-2 py-1">
          <Text className="truncate text-base leading-4 font-semibold text-slate-900">
            {displayTitle}
          </Text>
          <Text className="truncate text-xs text-slate-400">
            {getDisplayUrl(url, {
              onParseError: onDisplayUrlParseError,
            })}
          </Text>
        </div>
      </Link>
      <div className="absolute top-1/2 right-2 z-10 -translate-y-1/2">
        <ActionMenu
          isOpen={isActionMenuOpen}
          setIsOpen={setIsActionMenuOpen}
          buttonVariant="ghost"
          triggerLabel={`Open actions for ${displayTitle}`}
        >
          <ActionMenuItem
            icon="Pencil"
            label="Edit resource"
            onClick={onEdit}
          />
          <ActionMenuItem
            icon="ArrowClockwise"
            label="Refresh preview"
            disabled={isRefreshPending}
            onClick={onRefreshPreview}
          />
          <DropdownMenuSeparator />
          <ActionMenuItem
            icon="LinkBreak"
            label="Unlink resource"
            destructive
            onClick={onUnlink}
          />
        </ActionMenu>
      </div>
    </li>
  );
};

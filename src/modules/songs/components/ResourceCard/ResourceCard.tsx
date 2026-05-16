"use client";

import { useState } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

import { ActionMenu, ActionMenuItem } from "@components/ActionMenu";
import { Text } from "@components/Text";
import { getDisplayUrl } from "@modules/songs/utils/getDisplayUrl";
import { type Resource } from "@lib/types";

import { ResourceCardImage } from "../ResourceCardImage";

export type ResourceCardProps = {
  resource: Resource;
  onEdit: (resource: Resource) => void;
};

const sanitizeUrlForTelemetry = (rawUrl: string) => {
  try {
    const parsedUrl = new URL(rawUrl);

    return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
  } catch {
    return "[invalid-url]";
  }
};

const getErrorNameForTelemetry = (error: unknown) => {
  if (error instanceof Error) {
    return error.name;
  }

  if (typeof error === "object" && error !== null && "name" in error) {
    const { name } = error;

    if (typeof name === "string") {
      return name;
    }
  }

  return "Unknown";
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onEdit,
}) => {
  const { title, url } = resource;
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const handleEditResource = () => {
    setIsActionMenuOpen(false);
    onEdit(resource);
  };

  return (
    <li className="relative">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="grid h-full grid-cols-[48px_1fr] items-center gap-2 rounded bg-slate-50 px-3 py-2 pr-14 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ResourceCardImage resource={resource} />
        <div className="flex min-w-0 flex-col gap-1 px-2 py-1">
          <Text className="truncate text-base font-semibold leading-4 text-slate-900">
            {title}
          </Text>
          <Text className="truncate text-xs text-slate-400">
            {getDisplayUrl(url, {
              onParseError: (error) => {
                Sentry.captureMessage("Failed to parse resource URL", {
                  level: "warning",
                  extra: {
                    url: sanitizeUrlForTelemetry(url),
                    error: getErrorNameForTelemetry(error),
                  },
                });
              },
            })}
          </Text>
        </div>
      </Link>
      <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
        <ActionMenu
          isOpen={isActionMenuOpen}
          setIsOpen={setIsActionMenuOpen}
          buttonVariant="ghost"
          triggerLabel={`Open actions for ${title}`}
        >
          <ActionMenuItem
            icon="Pencil"
            label="Edit resource"
            onClick={handleEditResource}
          />
        </ActionMenu>
      </div>
    </li>
  );
};

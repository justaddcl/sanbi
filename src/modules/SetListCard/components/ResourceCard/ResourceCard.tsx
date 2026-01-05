import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

import { Text } from "@components/Text";
import { type Resource } from "@lib/types";

import { ResourceCardImage } from "../ResourceCardImage";

export type ResourceCardProps = {
  resource: Resource;
};

const getDisplayUrl = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch (error) {
    Sentry.captureMessage("Failed to parse resource URL", {
      level: "warning",
      extra: { url, error },
    });
    return url;
  }
};

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const { title, url } = resource;

  return (
    <li>
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded bg-slate-50 px-3 py-2"
      >
        <ResourceCardImage resource={resource} />
        <div className="px-2 py-1">
          <Text className="text-base font-semibold text-slate-900">
            {title}
          </Text>
          <Text className="text-xs text-slate-400">{getDisplayUrl(url)}</Text>
        </div>
      </Link>
    </li>
  );
};

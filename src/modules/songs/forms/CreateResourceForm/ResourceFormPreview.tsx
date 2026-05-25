import type * as z from "zod";

import { Text } from "@components/Text";
import { getDisplayUrl } from "@modules/songs/utils/getDisplayUrl";
import { getFirstNonBlankValue } from "@lib/string/getFirstNonBlankValue";
import type { Resource } from "@lib/types";
import type { resourcePreviewMetadataSchema } from "@lib/types/zod";
import { getHostnameFromUrl } from "@lib/urls/resourcePreviewUrl";

import { ResourceFormPreviewSkeleton } from "./ResourceFormPreviewSkeleton";
import { ResourceFormPreviewThumbnail } from "./ResourceFormPreviewThumbnail";

type ResourcePreviewMetadata = z.infer<typeof resourcePreviewMetadataSchema>;

type ResourceFormPreviewProps = {
  resource?: Resource;
  title: string | null | undefined;
  url: string;
  previewMetadata?: ResourcePreviewMetadata;
  isLoading: boolean;
};

export const ResourceFormPreview = ({
  resource,
  title,
  url,
  previewMetadata,
  isLoading,
}: ResourceFormPreviewProps) => {
  const displayUrl = getFirstNonBlankValue(url, resource?.url) ?? "";
  const displayTitle =
    getFirstNonBlankValue(title, previewMetadata?.title, resource?.metaTitle) ??
    getHostnameFromUrl(displayUrl);
  const description =
    previewMetadata?.description ?? resource?.metaDescription ?? null;
  const imageUrl = previewMetadata?.imageUrl ?? resource?.imageUrl;
  const faviconUrl = previewMetadata?.faviconUrl ?? resource?.faviconUrl;
  const previewImageUrl = imageUrl ?? faviconUrl;

  if (isLoading) {
    return <ResourceFormPreviewSkeleton />;
  }

  return (
    <div className="grid grid-cols-[64px_1fr] gap-3 rounded-md border bg-slate-50 p-3">
      <ResourceFormPreviewThumbnail imageUrl={previewImageUrl} />
      <div className="min-w-0 py-0.5">
        <Text className="truncate text-sm font-semibold text-slate-900">
          {displayTitle}
        </Text>
        {!!displayUrl && (
          <Text className="truncate text-xs text-slate-400">
            {getDisplayUrl(displayUrl)}
          </Text>
        )}
        {!!description && (
          <Text className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500">
            {description}
          </Text>
        )}
      </div>
    </div>
  );
};

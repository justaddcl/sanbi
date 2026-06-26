import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { useDebounceValue } from "usehooks-ts";

import { type RouterOutputs, trpc } from "@lib/trpc";
import { isPreviewableResourceUrl } from "@lib/urls/resourcePreviewUrl";

const RESOURCE_URL_PREVIEW_DEBOUNCE_MS = 400;

type PreviewMetadata = RouterOutputs["resource"]["previewMetadata"];

type UseResourceFormPreviewMetadataProps = {
  organizationId: string | undefined;
  url: string | null | undefined;
};

export const useResourceFormPreviewMetadata = ({
  organizationId,
  url,
}: UseResourceFormPreviewMetadataProps) => {
  const [debouncedUrl] = useDebounceValue(
    url ?? "",
    RESOURCE_URL_PREVIEW_DEBOUNCE_MS,
  );
  const trimmedUrl = (url ?? "").trim();
  const trimmedDebouncedUrl = debouncedUrl.trim();
  const canPreviewUrl = isPreviewableResourceUrl(trimmedUrl);
  const isWaitingForPreviewDebounce =
    canPreviewUrl && trimmedUrl !== trimmedDebouncedUrl;
  const [previewMetadataResult, setPreviewMetadataResult] = useState<{
    data: PreviewMetadata;
    url: string;
  } | null>(null);
  const {
    isPending: isPreviewMetadataPending,
    mutateAsync: previewResourceMetadata,
  } = trpc.resource.previewMetadata.useMutation();

  useEffect(() => {
    if (!organizationId || !canPreviewUrl || isWaitingForPreviewDebounce) {
      return;
    }

    let isCurrentPreview = true;
    const previewUrl = trimmedDebouncedUrl;

    void previewResourceMetadata({
      organizationId,
      url: previewUrl,
    })
      .then((data) => {
        if (!isCurrentPreview) {
          return;
        }

        setPreviewMetadataResult({ data, url: previewUrl });
      })
      .catch((error) => {
        Sentry.captureException(error);

        if (isCurrentPreview) {
          setPreviewMetadataResult(null);
        }
      });

    return () => {
      isCurrentPreview = false;
    };
  }, [
    canPreviewUrl,
    isWaitingForPreviewDebounce,
    organizationId,
    previewResourceMetadata,
    trimmedDebouncedUrl,
  ]);

  const previewMetadata =
    canPreviewUrl &&
    trimmedUrl === trimmedDebouncedUrl &&
    previewMetadataResult?.url === trimmedDebouncedUrl
      ? previewMetadataResult.data
      : undefined;

  return {
    debouncedUrl: trimmedDebouncedUrl,
    isLoading: isWaitingForPreviewDebounce || isPreviewMetadataPending,
    isWaitingForPreviewDebounce,
    previewMetadata,
    suggestedTitle: previewMetadata?.title?.trim() ?? null,
    trimmedUrl,
  };
};

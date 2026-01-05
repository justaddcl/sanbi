"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import { Link } from "@phosphor-icons/react/dist/ssr";
import * as Sentry from "@sentry/nextjs";

import { type Resource } from "@lib/types";

const RESOURCE_IMAGE_MAX_SIZE = 40;

type ResourceCardImageProps = {
  resource: Resource;
};

export const ResourceCardImage: React.FC<ResourceCardImageProps> = ({
  resource,
}) => {
  const { title, imageUrl, faviconUrl } = resource;

  const [hasImageError, setHasImageError] = useState(false);

  const imageSrc = imageUrl ?? faviconUrl;

  if (imageSrc && !hasImageError) {
    return (
      <Image
        src={imageSrc}
        alt={`Image for ${title}`}
        className="size-10 rounded"
        width={RESOURCE_IMAGE_MAX_SIZE}
        height={RESOURCE_IMAGE_MAX_SIZE}
        unoptimized
        loading="lazy"
        onError={() => {
          Sentry.captureMessage("Failed to load resource image", {
            level: "warning",
            extra: { imageSrc },
          });

          setHasImageError(true);
        }}
      />
    );
  }

  return (
    <div className="flex items-center justify-center rounded bg-slate-200 p-2">
      <Link className="text-slate-400" size={24} />
    </div>
  );
};

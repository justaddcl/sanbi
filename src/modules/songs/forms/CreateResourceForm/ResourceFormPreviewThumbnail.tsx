import Image from "next/image";
import { LinkSimple } from "@phosphor-icons/react";

type ResourceFormPreviewThumbnailProps = {
  imageUrl: string | null | undefined;
};

export const ResourceFormPreviewThumbnail = ({
  imageUrl,
}: ResourceFormPreviewThumbnailProps) => {
  if (!imageUrl) {
    return (
      <div
        aria-hidden
        className="flex size-16 items-center justify-center rounded bg-slate-200"
      >
        <LinkSimple className="text-slate-400" size={28} />
      </div>
    );
  }

  return (
    <div className="relative size-16 overflow-hidden rounded bg-slate-100">
      <Image
        alt=""
        aria-hidden
        className="object-contain"
        fill
        sizes="64px"
        src={imageUrl}
        unoptimized
      />
    </div>
  );
};

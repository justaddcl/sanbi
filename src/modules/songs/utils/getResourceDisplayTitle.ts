import { type Resource } from "@lib/types";
import { getHostnameFromUrl } from "@lib/urls/resourcePreviewUrl";

export const getResourceDisplayTitle = (
  resource: Pick<Resource, "title" | "metaTitle" | "url">,
) => {
  const title = resource.title?.trim();

  if (title) {
    return title;
  }

  const metaTitle = resource.metaTitle?.trim();

  if (metaTitle) {
    return metaTitle;
  }

  return getHostnameFromUrl(resource.url);
};

const isIpLiteralHostname = (hostname: string) =>
  /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":");

export const isPreviewableResourceUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    return (
      parsedUrl.protocol === "https:" &&
      hostname.includes(".") &&
      !isIpLiteralHostname(hostname)
    );
  } catch {
    return false;
  }
};

export const getHostnameFromUrl = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.trim();
  }
};

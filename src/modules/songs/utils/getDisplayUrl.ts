type GetDisplayUrlOptions = {
  onParseError?: (error: unknown) => void;
};

export const getDisplayUrl = (
  url: string,
  options: GetDisplayUrlOptions = {},
) => {
  try {
    return new URL(url).hostname;
  } catch (error) {
    options.onParseError?.(error);
    return url;
  }
};

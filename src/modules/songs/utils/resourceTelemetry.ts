export const sanitizeResourceUrlForTelemetry = (rawUrl: string) => {
  try {
    const parsedUrl = new URL(rawUrl);

    return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
  } catch {
    return "[invalid-url]";
  }
};

export const getErrorNameForTelemetry = (error: unknown) => {
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

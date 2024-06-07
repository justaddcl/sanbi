const shortDateFormatOptions: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "2-digit",
};

const longDateFormatOptions: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "2-digit",
  year: "numeric",
};

type DateFormatOptions = Partial<Intl.DateTimeFormatOptions> & {
  /**
   * Shorthand to get pre-defined short or long date format
   * Default: "short"
   */
  format?: "short" | "long";

  /**
   * BCP 47 language tag for formatter locale
   * Default: "en-US"
   */
  locale?: string;
};

export const formatDate = (
  date: string,
  options: DateFormatOptions = { format: "short", locale: "en-US" },
): string => {
  const { format, locale, ...formatOverrides } = options;

  const formatOptions =
    format === "long" ? longDateFormatOptions : shortDateFormatOptions;

  return new Intl.DateTimeFormat(locale, {
    ...formatOptions,
    ...formatOverrides,
  }).format(new Date(date));
};

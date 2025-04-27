export type FormatNumberOptions = {
  locale?: Intl.LocalesArgument;
  options?: Intl.NumberFormatOptions;
};

const defaultLocale: Intl.LocalesArgument = "en-US";
const defaultOptions: Intl.NumberFormatOptions = {
  style: "decimal",
};

export const formatNumber = (
  numberToFormat: number,
  {
    locale = defaultLocale,
    options = defaultOptions,
  }: FormatNumberOptions = {},
) => {
  return new Intl.NumberFormat(locale, options).format(numberToFormat);
};

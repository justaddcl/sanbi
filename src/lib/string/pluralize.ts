export const pluralize = (
  count: number,
  {
    singular,
    plural,
    locale = "en-US",
  }: { singular: string; plural: string; locale?: string },
) => {
  const pluralRules = new Intl.PluralRules(locale);
  const pluralForm = pluralRules.select(count);

  return pluralForm === "one" ? singular : plural;
};

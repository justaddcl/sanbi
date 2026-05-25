export const getFirstNonBlankValue = (
  ...values: Array<string | null | undefined>
) =>
  values
    .find(
      (value): value is string =>
        value !== undefined && value !== null && value.trim().length > 0,
    )
    ?.trim();

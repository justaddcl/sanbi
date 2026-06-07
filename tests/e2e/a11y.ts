import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const expectNoA11yViolations = async (
  page: Page,
  options?: {
    include?: string;
    exclude?: string[];
  },
) => {
  let builder = new AxeBuilder({ page });

  if (options?.include) {
    builder = builder.include(options.include);
  }

  for (const excludedSelector of options?.exclude ?? []) {
    builder = builder.exclude(excludedSelector);
  }

  const scanResults = await builder.analyze();

  expect(scanResults.violations).toEqual([]);
};

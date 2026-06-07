import { expect, test } from "@playwright/test";
import { e2eData, e2eIds } from "@testUtils/e2e/fixtures";

import { expectNoA11yViolations } from "../a11y";

test("organization home renders seeded upcoming sets", async ({ page }) => {
  await page.goto(`/${e2eIds.organizationId}`);

  await expect(
    page.getByRole("heading", { name: "Upcoming sets" }),
  ).toBeVisible();
  await expect(page.getByText(e2eData.eventType.name)).toBeVisible();
  await expect(page.getByText(e2eData.songs.first.name)).toBeVisible();

  await expectNoA11yViolations(page, {
    include: "main",
    exclude: ["[data-nextjs-toast]", "nextjs-portal"],
  });
});

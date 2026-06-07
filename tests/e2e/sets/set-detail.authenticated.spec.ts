import { expect, test } from "@playwright/test";
import { e2eData, e2eIds } from "@testUtils/e2e/fixtures";

import { expectNoA11yViolations } from "../a11y";

test("set detail renders seeded sections, songs, and notes", async ({
  page,
}) => {
  await page.goto(`/${e2eIds.organizationId}/sets/${e2eIds.setId}`);

  await expect(page.getByRole("heading", { name: "June 06" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: e2eData.eventType.name }),
  ).toBeVisible();
  await expect(page.getByText(e2eData.set.notes)).toBeVisible();
  await expect(page.getByText(e2eData.sectionTypes.fullBand)).toBeVisible();
  await expect(page.getByText(e2eData.sectionTypes.prayer)).toBeVisible();
  await expect(page.getByText(e2eData.songs.first.name)).toBeVisible();
  await expect(page.getByText(e2eData.songs.first.setNotes)).toBeVisible();
  await expect(page.getByText(e2eData.songs.second.name)).toBeVisible();

  await expectNoA11yViolations(page, {
    include: "main",
    exclude: ["[data-nextjs-toast]", "nextjs-portal"],
  });
});

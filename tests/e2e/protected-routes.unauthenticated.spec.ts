import { expect, test } from "@playwright/test";
import { e2eData, e2eIds } from "@testUtils/e2e/fixtures";

test("unauthenticated users cannot view a protected set route", async ({
  page,
}) => {
  await page.goto(`/${e2eIds.organizationId}/sets/${e2eIds.setId}`);

  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByText(e2eData.songs.first.name)).toHaveCount(0);
});

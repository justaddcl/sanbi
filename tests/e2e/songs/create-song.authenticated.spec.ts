import { expect, type Page, test } from "@playwright/test";
import { e2eIds } from "@testUtils/e2e/fixtures";

import { expectNoA11yViolations } from "../a11y";

const openNewItemDialog = async (page: Page) => {
  const newButton = page.getByRole("button", { name: "New" });

  try {
    await newButton.waitFor({ state: "visible", timeout: 3_000 });
  } catch {
    await page.getByRole("button", { name: "Open mobile navigation" }).click();
    await newButton.waitFor({ state: "visible" });
  }

  await newButton.click();
};

test("create-song workflow creates a song and opens its detail page", async ({
  page,
}) => {
  const songName = `E2E Created Song ${Date.now()}`;

  await page.goto(`/${e2eIds.organizationId}`);
  await openNewItemDialog(page);
  await page.getByRole("tab", { name: "New song" }).click();
  await page.getByLabel("Song name *").fill(songName);
  await page.getByLabel("Preferred key *").click();
  await page.getByRole("option", { name: "D", exact: true }).click();
  await page
    .getByLabel("Song notes")
    .fill("Created by the Playwright smoke test.");

  const dialog = page.getByRole("dialog");
  await expectNoA11yViolations(page, {
    include: "[role='dialog']",
    exclude: ["[data-nextjs-toast]", "nextjs-portal"],
  });
  await dialog.getByRole("button", { name: "Create song" }).click();

  await expect
    .poll(() => page.url())
    .toContain(`/${e2eIds.organizationId}/songs/`);
  await expect(page.getByRole("heading", { name: songName })).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Created by the Playwright smoke test.",
    }),
  ).toBeVisible();
});

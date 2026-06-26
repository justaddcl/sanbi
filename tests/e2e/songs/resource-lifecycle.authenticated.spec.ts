import {
  expect,
  type Locator,
  type Page,
  test,
  type TestInfo,
} from "@playwright/test";
import { e2eData, e2eIds } from "@testUtils/e2e/fixtures";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "@server/db";
import { resources, userPreferences } from "@server/db/schema";

const sharedResourceLifecycle = {
  host: "resource-lifecycle.invalid",
  legacyUrl: "https://resource-lifecycle.invalid/create",
} as const;

const getResourceLifecycleFixture = (projectName: TestInfo["project"]["name"]) =>
  projectName.includes("mobile")
    ? {
        createTitle: "E2E Mobile Lifecycle Chart",
        updatedTitle: "E2E Mobile Lifecycle Chart Updated",
        url: "https://resource-lifecycle.invalid/mobile",
        host: sharedResourceLifecycle.host,
      }
    : {
        createTitle: "E2E Desktop Lifecycle Chart",
        updatedTitle: "E2E Desktop Lifecycle Chart Updated",
        url: "https://resource-lifecycle.invalid/desktop",
        host: sharedResourceLifecycle.host,
      };

type ResourceLifecycleFixture = ReturnType<typeof getResourceLifecycleFixture>;

const getResourceItem = (
  page: Page,
  { title, host }: { title: string; host: string },
) =>
  page
    .locator("li")
    .filter({ has: page.getByText(title, { exact: true }) })
    .filter({ hasText: host });

const getCreatedResourceLink = (
  page: Page,
  fixture: ResourceLifecycleFixture,
) =>
  getResourceItem(page, {
    title: fixture.createTitle,
    host: fixture.host,
  }).getByRole("link");

const getUpdatedResourceLink = (
  page: Page,
  fixture: ResourceLifecycleFixture,
) =>
  getResourceItem(page, {
    title: fixture.updatedTitle,
    host: fixture.host,
  }).getByRole("link");

const getResourceActionMenu = (page: Page, title: string) =>
  page.getByRole("button", {
    name: `Open actions for ${title}`,
  });

const resetResourceLifecycleFixture = async (
  fixture: ResourceLifecycleFixture,
) => {
  const e2eUserId = process.env.E2E_CLERK_USER_ID;

  if (!e2eUserId) {
    throw new Error("E2E_CLERK_USER_ID is required for Playwright E2E tests.");
  }

  await db.transaction(async (transaction) => {
    await transaction
      .delete(resources)
      .where(
        and(
          eq(resources.songId, e2eIds.firstSongId),
          inArray(resources.url, [
            fixture.url,
            sharedResourceLifecycle.legacyUrl,
          ]),
        ),
      );

    await transaction
      .update(userPreferences)
      .set({ confirmResourceDelete: true })
      .where(eq(userPreferences.userId, e2eUserId));
  });
};

const fillResourceForm = async (
  dialog: Locator,
  {
    title,
    url,
  }: {
    title?: string;
    url?: string;
  },
) => {
  if (url !== undefined) {
    await dialog.getByLabel("URL *").fill(url);
  }

  if (title !== undefined) {
    await dialog.getByLabel("Name").fill(title);
  }
};

test("song detail resource lifecycle can link, update, and unlink a resource", async ({
  page,
}, testInfo) => {
  const fixture = getResourceLifecycleFixture(testInfo.project.name);

  await resetResourceLifecycleFixture(fixture);

  // The CRUD path still uses the real tRPC resource procedures. The preview is
  // best-effort UI decoration, so keep it out of this smoke's network surface.
  await page.route("**/api/trpc/resource.previewMetadata**", (route) =>
    route.abort(),
  );

  await page.goto(`/${e2eIds.organizationId}/songs/${e2eIds.firstSongId}`);
  await expect(
    page.getByRole("heading", { name: e2eData.songs.first.name }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Link resource" }).click();

  const createDialog = page.getByRole("dialog");
  await expect(
    createDialog.getByRole("heading", { name: "Link a song resource" }),
  ).toBeVisible();
  await fillResourceForm(createDialog, {
    url: fixture.url,
    title: fixture.createTitle,
  });

  const linkResourceButton = createDialog.getByRole("button", {
    name: "Link resource",
  });
  await expect(linkResourceButton).toBeEnabled({ timeout: 10_000 });
  await linkResourceButton.click();

  await expect(page.getByText("Resource was linked")).toBeVisible();
  await expect(createDialog).toBeHidden({ timeout: 15_000 });

  const createdResourceLink = getCreatedResourceLink(page, fixture);
  await expect(createdResourceLink).toBeVisible();
  await expect(createdResourceLink).toContainText(fixture.host);
  await expect(createdResourceLink).toHaveAttribute("href", fixture.url);

  await getResourceActionMenu(page, fixture.createTitle).click();
  await page.getByRole("menuitem", { name: "Edit resource" }).click();

  const editDialog = page.getByRole("dialog");
  await expect(
    editDialog.getByRole("heading", { name: "Edit resource" }),
  ).toBeVisible();
  await fillResourceForm(editDialog, {
    title: fixture.updatedTitle,
  });

  const saveChangesButton = editDialog.getByRole("button", {
    name: "Save changes",
  });
  await expect(saveChangesButton).toBeEnabled();
  await saveChangesButton.click();

  await expect(page.getByText("Resource was updated")).toBeVisible();
  await expect(editDialog).toBeHidden({ timeout: 15_000 });
  await expect(getCreatedResourceLink(page, fixture)).toBeHidden();

  const updatedResourceLink = getUpdatedResourceLink(page, fixture);
  await expect(updatedResourceLink).toBeVisible();
  await expect(updatedResourceLink).toContainText(fixture.host);

  await getResourceActionMenu(page, fixture.updatedTitle).click();
  await page.getByRole("menuitem", { name: "Unlink resource" }).click();

  const confirmationDialog = page.getByRole("alertdialog");
  await expect(
    confirmationDialog.getByRole("heading", {
      name: `Unlink ${fixture.updatedTitle}`,
    }),
  ).toBeVisible();
  await confirmationDialog
    .getByRole("button", { name: "Unlink resource" })
    .click();

  await expect(page.getByText("Resource was unlinked")).toBeVisible();
  await expect(getUpdatedResourceLink(page, fixture)).toBeHidden();
});

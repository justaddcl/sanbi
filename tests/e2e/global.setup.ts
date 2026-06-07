import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { expect, test as setup } from "@playwright/test";
import { e2eIds } from "@testUtils/e2e/fixtures";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { seedE2eDatabase } from "@server/db/seed-e2e";

const authFile = path.join(process.cwd(), "playwright/.clerk/user.json");

setup.describe.configure({ mode: "serial" });

setup("seed e2e database", async () => {
  await seedE2eDatabase();
});

setup("configure clerk testing", async () => {
  await clerkSetup();
});

setup("authenticate and save clerk state", async ({ page }) => {
  const e2eUserEmail = process.env.E2E_CLERK_USER_EMAIL;

  if (!e2eUserEmail) {
    throw new Error("E2E_CLERK_USER_EMAIL is required for Playwright auth.");
  }

  await mkdir(path.dirname(authFile), { recursive: true });

  await page.goto("/sign-in");
  await clerk.signIn({
    page,
    emailAddress: e2eUserEmail,
  });

  await page.goto(`/${e2eIds.organizationId}`);
  await expect(
    page.getByRole("heading", { name: "Upcoming sets" }),
  ).toBeVisible();
  await page.context().storageState({ path: authFile });
});

import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { expect, test as setup } from "@playwright/test";
import { e2eIds } from "@testUtils/e2e/fixtures";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const authFileForProject = (projectName: string) =>
  path.join(
    process.cwd(),
    projectName.includes("webkit")
      ? "playwright/.clerk/webkit-user.json"
      : "playwright/.clerk/chromium-user.json",
  );

setup.setTimeout(60_000);

setup("authenticate and save clerk state", async ({ page }, testInfo) => {
  await clerkSetup();

  const e2eUserEmail = process.env.E2E_CLERK_USER_EMAIL;

  if (!e2eUserEmail) {
    throw new Error("E2E_CLERK_USER_EMAIL is required for Playwright auth.");
  }

  const authFile = authFileForProject(testInfo.project.name);

  await mkdir(path.dirname(authFile), { recursive: true });

  await page.goto("/sign-in", { waitUntil: "domcontentloaded" });
  await clerk.signIn({
    page,
    emailAddress: e2eUserEmail,
  });

  await page.goto(`/${e2eIds.organizationId}`, {
    timeout: 45_000,
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByRole("heading", { name: "Upcoming sets" }),
  ).toBeVisible({ timeout: 15_000 });
  await page.context().storageState({ path: authFile });
});

import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { type BrowserContext, expect, test as setup } from "@playwright/test";
import { e2eIds } from "@testUtils/e2e/fixtures";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const authFile = path.join(
  process.cwd(),
  "playwright/.clerk/chromium-user.json",
);

const hasClerkSessionCookie = async (context: BrowserContext) => {
  const cookies = await context.cookies();

  return cookies.some(
    ({ name, value }) =>
      (name === "__session" || name.startsWith("__session_")) &&
      value.length > 0,
  );
};

setup.setTimeout(90_000);

setup("authenticate and save clerk state", async ({ page }) => {
  await clerkSetup();

  const e2eUserEmail = process.env.E2E_CLERK_USER_EMAIL;

  if (!e2eUserEmail) {
    throw new Error("E2E_CLERK_USER_EMAIL is required for Playwright auth.");
  }

  await mkdir(path.dirname(authFile), { recursive: true });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await clerk.signIn({
    page,
    emailAddress: e2eUserEmail,
  });

  const context = page.context();

  await expect
    .poll(() => hasClerkSessionCookie(context), { timeout: 20_000 })
    .toBe(true);
  await page.close();

  const authenticatedPage = await context.newPage();

  await authenticatedPage.goto(`/${e2eIds.organizationId}`, {
    timeout: 45_000,
    waitUntil: "domcontentloaded",
  });
  await expect(
    authenticatedPage.getByRole("heading", { name: "Upcoming sets" }),
  ).toBeVisible({ timeout: 15_000 });
  await context.storageState({ path: authFile });
  await authenticatedPage.close();
});

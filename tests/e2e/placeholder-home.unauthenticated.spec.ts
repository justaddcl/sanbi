import { expect, test } from "@playwright/test";
import { e2eData, e2eIds } from "@testUtils/e2e/fixtures";

test("placeholder home page links to the seeded Stoneway organization", async ({
  page,
}) => {
  await page.goto("/");

  const homeLink = page.getByRole("link", { name: "賛美 // Sanbi" });

  await expect(homeLink).toBeVisible();
  await expect(homeLink).toHaveAttribute(
    "href",
    `/${e2eIds.placeholderHomeOrganizationId}`,
  );
  await expect(page.getByText(e2eData.organization.name)).toHaveCount(0);
});

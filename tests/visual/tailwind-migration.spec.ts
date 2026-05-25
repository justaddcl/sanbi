import { expect, test } from "@playwright/test";

const surfaces = ["controls", "cards", "dialog", "sheet", "popover"] as const;
const themes = ["light", "dark"] as const;
const portalSurfaces = new Set<(typeof surfaces)[number]>([
  "dialog",
  "sheet",
  "popover",
]);

for (const surface of surfaces) {
  for (const theme of themes) {
    test(`${surface} ${theme}`, async ({ page }) => {
      await page.goto(`/visual-harness?surface=${surface}&theme=${theme}`);

      if (surface === "dialog") {
        await expect(
          page.getByRole("dialog", { name: "Archive set" }),
        ).toBeVisible();
      }

      if (surface === "sheet") {
        await expect(page.getByText("Set options")).toBeVisible();
      }

      if (surface === "popover") {
        await expect(page.getByText("Resource status")).toBeVisible();
      }

      if (portalSurfaces.has(surface)) {
        await expect(page).toHaveScreenshot(`${surface}-${theme}.png`, {
          fullPage: true,
        });
      } else {
        await expect(page.locator("[data-visual-harness]")).toHaveScreenshot(
          `${surface}-${theme}.png`,
        );
      }
    });
  }
}

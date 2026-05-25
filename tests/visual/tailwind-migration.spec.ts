import { expect, test } from "@playwright/test";

const surfaces = ["controls", "cards", "dialog", "sheet", "popover"] as const;
const themes = ["light", "dark"] as const;

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
        await expect(
          page.getByRole("dialog", { name: "Set options" }),
        ).toBeVisible();
      }

      if (surface === "popover") {
        await expect(page.getByText("Resource status")).toBeVisible();
      }

      await expect(page.locator("[data-visual-harness]")).toHaveScreenshot(
        `${surface}-${theme}.png`,
      );
    });
  }
}

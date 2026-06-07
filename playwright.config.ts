import { defineConfig, devices } from "@playwright/test";

const e2ePort = Number(process.env.E2E_PORT ?? 3100);
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${e2ePort}`;
const webServerURL = new URL("/api/e2e/health", baseURL).toString();
const authFile = "playwright/.clerk/user.json";
const shouldStartWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER !== "1";

// Project names are report labels. These matchers map spec file suffixes
// to each runtime project below.
const unauthenticatedSpecFiles = /.*\.unauthenticated\.spec\.ts/;
const authenticatedSpecFiles = /.*\.authenticated\.spec\.ts/;

const desktopChromium = devices["Desktop Chrome"];
const mobileSafari = devices["iPhone SE (3rd gen)"];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["html"], ["list"]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: shouldStartWebServer
    ? {
        command: `SANBI_E2E=1 pnpm exec next dev --port ${e2ePort}`,
        url: webServerURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "unauthenticated-desktop-chromium",
      testMatch: unauthenticatedSpecFiles,
      use: {
        ...desktopChromium,
      },
      dependencies: ["setup"],
    },
    {
      name: "unauthenticated-iphone-se-webkit",
      testMatch: unauthenticatedSpecFiles,
      use: {
        ...mobileSafari,
      },
      dependencies: ["setup"],
    },
    {
      name: "authenticated-desktop-chromium",
      testMatch: authenticatedSpecFiles,
      use: {
        ...desktopChromium,
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
    {
      name: "authenticated-iphone-se-webkit",
      testMatch: authenticatedSpecFiles,
      use: {
        ...mobileSafari,
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
  ],
});

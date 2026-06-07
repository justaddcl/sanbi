import { test as setup } from "@playwright/test";

import { seedE2eDatabase } from "@server/db/seed-e2e";

setup("seed e2e database", async () => {
  await seedE2eDatabase();
});

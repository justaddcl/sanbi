import * as Sentry from "@sentry/nextjs";

import "server-only";
import "@lib/orpc/server-client";

if (!globalThis.$orpc) {
  Sentry.captureException(new Error("ORPC client not initialized"));
  throw new Error("ORPC client not initialized");
}

export const serverApi = globalThis.$orpc;

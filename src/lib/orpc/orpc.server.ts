import { createRouterClient } from "@orpc/server";

import { createORPCContext } from "@server/orpc/base";
import { appRouter } from "@server/orpc/routers";

import "server-only";

globalThis.$client = createRouterClient(appRouter, {
  context: async () => {
    const { headers: getHeaders } = await import("next/headers");
    const headers = getHeaders();
    return createORPCContext({ headers });
  },
});

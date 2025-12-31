import { createRouterClient, type RouterClient } from "@orpc/server";

import { createORPCContext } from "@server/orpc/base";
import { appRouter } from "@server/orpc/routers";

import "server-only";

declare global {
  // eslint-disable-next-line no-var
  var $orpc: RouterClient<typeof appRouter> | undefined;
}

globalThis.$orpc ??= createRouterClient(appRouter, {
  context: async () => {
    const { headers: getHeaders } = await import("next/headers");
    const headers = getHeaders();
    return createORPCContext({ headers });
  },
});

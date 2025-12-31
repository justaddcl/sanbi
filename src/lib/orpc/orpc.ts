import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";

import { type appRouter } from "@server/orpc/routers";
import { getBaseUrl } from "@server/utils/urls/getBaseUrl";
import { RPC_PREFIX } from "@app/api/rpc/[[...rest]]/route";

declare global {
  // eslint-disable-next-line no-var
  var $client: RouterClient<typeof appRouter> | undefined;
}

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") {
      throw new Error("RPCLink is not allowed on the server side.");
    }

    return getBaseUrl() + RPC_PREFIX;
  },
});

export const client: RouterClient<typeof appRouter> =
  globalThis.$client ?? createORPCClient(link);

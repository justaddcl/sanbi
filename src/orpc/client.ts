import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { type RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import { type appRouter } from "@server/orpc/routers";
import { getBaseUrl } from "@server/utils/urls/getBaseUrl";

const link = new RPCLink({
  url: getBaseUrl() + "/api/rpc",
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const api: RouterClient<typeof appRouter> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(api);

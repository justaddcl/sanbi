"use client";

import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { type RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import { type appRouter } from "@server/orpc/routers";
import { getBaseUrl } from "@server/utils/urls/getBaseUrl";

import { RPC_PREFIX } from "./shared";

const link = new RPCLink({
  url: getBaseUrl() + RPC_PREFIX,
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const orpcClient: RouterClient<typeof appRouter> =
  createORPCClient(link);

export const orpc = createTanstackQueryUtils(orpcClient, {
  path: ["orpc"],
});

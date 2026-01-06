import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { createHydrationHelpers } from "@trpc/react-query/rsc";

import { makeQueryClient } from "@lib/tanstack/query-client";
import { type appRouter, createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export const getQueryClient = cache(makeQueryClient);
/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(() => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

export const api = createCaller(createContext);

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  api,
  getQueryClient,
);

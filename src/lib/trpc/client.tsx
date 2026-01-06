"use client";

import { useState } from "react";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import SuperJSON from "superjson";

import { getBaseUrl } from "@server/utils/urls/getBaseUrl";
import { type AppRouter } from "@/server/api/root";

// const createQueryClient = () => new QueryClient();

// let clientQueryClientSingleton: QueryClient | undefined = undefined;
// const getQueryClient = () => {
//   if (typeof window === "undefined") {
//     // Server: always make a new query client
//     return createQueryClient();
//   }
//   // Browser: use singleton pattern to keep the same query client
//   return (clientQueryClientSingleton ??= createQueryClient());
// };

export const trpc = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCProvider(props: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  const { children, queryClient } = props;

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  );
}

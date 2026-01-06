// src/app/providers.tsx
"use client";

import React from "react";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "@components/ui/sonner";
import { TooltipProvider } from "@components/ui/tooltip";
import { orpc } from "@lib/orpc/client";
import { ORPCContext } from "@lib/orpc/react";
import { makeQueryClient } from "@lib/tanstack/query-client";
import { TRPCProvider } from "@lib/trpc/client";
import { SanbiStoreProvider } from "@/providers/sanbi-store-provider";

let browserQueryClient: QueryClient | undefined;

export const getClientQueryClient = () => {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
};

export const Providers = (props: { children: React.ReactNode }) => {
  const queryClient = getClientQueryClient();

  const orpcClient = orpc as unknown as React.ContextType<typeof ORPCContext>;

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient}>
        <ORPCContext.Provider value={orpcClient}>
          <SanbiStoreProvider>
            <TooltipProvider>
              <Toaster position="bottom-center" richColors />
              {props.children}
            </TooltipProvider>
          </SanbiStoreProvider>
        </ORPCContext.Provider>
      </TRPCProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

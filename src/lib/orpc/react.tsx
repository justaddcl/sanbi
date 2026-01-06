"use client";

import React from "react";
import type { createTanstackQueryUtils } from "@orpc/tanstack-query";

type ORPCUtils = ReturnType<typeof createTanstackQueryUtils>;

export const ORPCContext = React.createContext<ORPCUtils | undefined>(
  undefined,
);

export const useORPC = () => {
  const orpcUtils = React.useContext(ORPCContext);

  if (!orpcUtils) {
    throw new Error(
      "ORPCContext is not set. Wrap your app in <ORPCContext.Provider>.",
    );
  }

  return orpcUtils;
};

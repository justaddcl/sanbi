"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import {
  type SanbiStore,
  createSanbiStore,
  initSanbiStore,
} from "@/stores/sanbi-store";

export type SanbiStoreApi = ReturnType<typeof createSanbiStore>;

export const SanbiStoreContext = createContext<SanbiStoreApi | undefined>(
  undefined,
);

export type SanbiStoreProviderProps = {
  children: ReactNode;
};

export const SanbiStoreProvider = ({ children }: SanbiStoreProviderProps) => {
  const storeRef = useRef<SanbiStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createSanbiStore(initSanbiStore());
  }

  return (
    <SanbiStoreContext.Provider value={storeRef.current}>
      {children}
    </SanbiStoreContext.Provider>
  );
};

export const useSanbiStore = <T,>(selector: (store: SanbiStore) => T): T => {
  const sanbiStoreContext = useContext(SanbiStoreContext);

  if (!sanbiStoreContext) {
    throw new Error(`useSanbiStore must be used within SanbiStoreProvider`);
  }

  return useStore(sanbiStoreContext, selector);
};

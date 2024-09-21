import { createStore } from "zustand/vanilla";
import { devtools } from "zustand/middleware";

export type SanbiState = {
  isMobileNavOpen: boolean;
};

export type SanbiActions = {
  setIsMobileNavOpen: (isMobileNavOpen: boolean) => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
};

export type SanbiStore = SanbiState & SanbiActions;

export const initSanbiStore = (): SanbiState => {
  return { isMobileNavOpen: false };
};

export const defaultInitState: SanbiState = {
  isMobileNavOpen: false,
};

export const createSanbiStore = (initState: SanbiState = defaultInitState) => {
  return createStore<SanbiStore>()(
    devtools((set) => ({
      ...initState,
      setIsMobileNavOpen: (isMobileNavOpen: boolean) =>
        set(() => ({ isMobileNavOpen })),
      openMobileNav: () => set(() => ({ isMobileNavOpen: true })),
      closeMobileNav: () => set(() => ({ isMobileNavOpen: false })),
    })),
  );
};

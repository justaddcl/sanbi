import { useMediaQuery } from "usehooks-ts";

import {
  DESKTOP_MEDIA_QUERY_STRING,
  MOBILE_MEDIA_QUERY_STRING,
} from "@lib/constants/mediaQueries";

/**
 * A hook that provides responsive utilities for desktop vs mobile views.
 * Uses the DESKTOP_MEDIA_QUERY_STRING constant for consistency across the app.
 *
 * @returns {Object} An object containing:
 *   - isDesktop: boolean - True if the viewport matches desktop size
 *   - textSize: string - The appropriate text size class for the current viewport
 *
 * @example
 * const { isDesktop, textSize } = useResponsive();
 *
 * return (
 *   <div className={textSize}>
 *     {isDesktop ? <DesktopView /> : <MobileView />}
 *   </div>
 * );
 */
export const useResponsive = () => {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY_STRING);
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY_STRING);
  const textSize = isDesktop ? "text-base" : "text-xs";

  return {
    isMobile,
    isDesktop,
    textSize,
  } as const;
};

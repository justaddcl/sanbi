import { renderHook } from "@testing-library/react";
import { useResponsive } from "../useResponsive";
import { useMediaQuery } from "usehooks-ts";
import { DESKTOP_MEDIA_QUERY_STRING } from "@lib/constants/mediaQueries";

// Mock the usehooks-ts useMediaQuery hook
jest.mock("usehooks-ts", () => ({
  useMediaQuery: jest.fn(),
}));

describe("useResponsive", () => {
  it("should return desktop values when on desktop viewport", () => {
    // Mock the useMediaQuery to return true (desktop viewport)
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.textSize).toBe("text-base");
    expect(useMediaQuery).toHaveBeenCalledWith(DESKTOP_MEDIA_QUERY_STRING);
  });

  it("should return mobile values when on mobile viewport", () => {
    // Mock the useMediaQuery to return false (mobile viewport)
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isDesktop).toBe(false);
    expect(result.current.textSize).toBe("text-xs");
    expect(useMediaQuery).toHaveBeenCalledWith(DESKTOP_MEDIA_QUERY_STRING);
  });

  it("should use the correct media query string", () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    renderHook(() => useResponsive());

    expect(useMediaQuery).toHaveBeenCalledWith("(min-width: 1025px)");
  });
});

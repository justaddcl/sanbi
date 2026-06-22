import { getArchivedBannerDescription } from "../ArchivedBanner";

describe("getArchivedBannerDescription", () => {
  it("explains that archived songs can still appear in search", () => {
    expect(getArchivedBannerDescription("song")).toBe(
      "This song is hidden from your main library, but it can still appear in search results with an Archived badge. All song history and data are preserved, and you can find it in the archived section.",
    );
  });

  it("keeps the archived set search visibility copy", () => {
    expect(getArchivedBannerDescription("set")).toBe(
      "This set won't show up in your library or in your searches by default. However, all set history and data are preserved, and you can find it in the archived section.",
    );
  });
});

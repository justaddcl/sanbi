import { render, screen } from "@testing-library/react";

import {
  getLastPlayedContext,
  getMatchedTagContext,
  getSongContext,
  SearchSongRow,
  SearchTagMatchedSongRow,
} from "../SearchResultRows";
import { type SearchSongResult, type TagSearchResult } from "../types";

const songResult: SearchSongResult = {
  songId: "4af1ad2a-5aac-4a35-91f9-f51edc376e03",
  name: "Amazing Grace",
  preferredKey: "g",
  isArchived: false,
  similarityScore: 0.9,
  tags: ["Communion", "Classic", "Sending"],
  matchedTags: [],
  lastPlayedDate: new Date("2026-06-09T12:00:00.000Z"),
};

describe("SearchResultRows", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-10T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("formats last played context for never played, day, and week distances", () => {
    expect(getLastPlayedContext(null)).toBe("Never played");
    expect(getLastPlayedContext(new Date("2026-06-11T12:00:00.000Z"))).toBe(
      "Last played 0d ago",
    );
    expect(getLastPlayedContext(new Date("2026-06-09T12:00:00.000Z"))).toBe(
      "Last played 1d ago",
    );
    expect(getLastPlayedContext(new Date("2026-05-27T12:00:00.000Z"))).toBe(
      "Last played 2w ago",
    );
  });

  it("summarizes song context with last played and a bounded tag preview", () => {
    expect(getSongContext(songResult)).toBe(
      "Last played 1d ago · Communion, Classic, 1 more",
    );
  });

  it("summarizes matched tag context with overflow", () => {
    const tagResult: TagSearchResult = {
      ...songResult,
      matchedTags: ["Communion", "Community", "Common prayer"],
    };

    expect(getMatchedTagContext(tagResult)).toBe(
      "Communion, Community, 1 more",
    );
  });

  it("renders a song row with title, key, last played, and tag context", () => {
    render(<SearchSongRow query="grace" result={songResult} />);

    expect(
      screen.getByText((_, element) => element?.textContent === songResult.name),
    ).toBeInTheDocument();
    expect(screen.getByText("G")).toBeInTheDocument();
    expect(
      screen.getByText("Last played 1d ago · Communion, Classic, 1 more"),
    ).toBeInTheDocument();
  });

  it("renders a tag-matched song row with matched tag context", () => {
    const tagResult: TagSearchResult = {
      ...songResult,
      matchedTags: ["Communion"],
    };

    render(<SearchTagMatchedSongRow query="communion" result={tagResult} />);

    expect(screen.getByText("Amazing Grace")).toBeInTheDocument();
    expect(screen.getByText("Communion")).toBeInTheDocument();
    expect(screen.getByText("Last played 1d ago")).toBeInTheDocument();
  });
});

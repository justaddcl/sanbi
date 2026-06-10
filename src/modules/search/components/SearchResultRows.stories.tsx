import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  SearchResultSkeletonRows,
  SearchSongRow,
  SearchTagMatchedSongRow,
} from "./SearchResultRows";
import { type SearchSongResult, type TagSearchResult } from "./types";

const songResult = {
  songId: "4af1ad2a-5aac-4a35-91f9-f51edc376e03",
  name: "Amazing Grace",
  preferredKey: "g",
  isArchived: false,
  similarityScore: 0.9,
  tags: ["Communion", "Classic", "Sending"],
  matchedTags: [],
  lastPlayedDate: new Date("2026-06-06T12:00:00.000Z"),
} satisfies SearchSongResult;

const tagResult = {
  ...songResult,
  matchedTags: ["Communion", "Community"],
} satisfies TagSearchResult;

const meta = {
  title: "Search/Result Rows",
  decorators: [
    (Story) => (
      <div className="max-w-xl rounded-lg border border-slate-100 bg-white p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const SongResult: Story = {
  render: () => <SearchSongRow query="grace" result={songResult} />,
};

export const TagResult: Story = {
  render: () => (
    <SearchTagMatchedSongRow query="communion" result={tagResult} />
  ),
};

export const LoadingRows: Story = {
  render: () => <SearchResultSkeletonRows />,
};

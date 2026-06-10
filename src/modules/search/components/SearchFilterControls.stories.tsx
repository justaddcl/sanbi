import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SearchFilterControls } from "./SearchFilterControls";
import { type SearchToggleFilter } from "./types";

const SearchFilterControlsStory = () => {
  const [selectedFilters, setSelectedFilters] = useState<
    Record<SearchToggleFilter, boolean>
  >({
    songs: false,
    tags: false,
  });

  return (
    <SearchFilterControls
      selectedFilters={selectedFilters}
      onFilterToggle={(filter) =>
        setSelectedFilters((currentFilters) => ({
          ...currentFilters,
          [filter]: !currentFilters[filter],
        }))
      }
    />
  );
};

const meta = {
  title: "Search/Filter Controls",
  component: SearchFilterControls,
  args: {
    selectedFilters: {
      songs: false,
      tags: false,
    },
    onFilterToggle: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl rounded-lg border border-slate-100 bg-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchFilterControls>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SearchFilterControlsStory />,
};

import {
  HouseLine,
  MagnifyingGlass,
  MusicNoteSimple,
  Playlist,
} from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SanbiStoreProvider } from "@/providers/sanbi-store-provider";

import { NavLink } from "./NavLink";

const meta = {
  title: "App Shell/Nav Link",
  component: NavLink,
  decorators: [
    (Story) => (
      <SanbiStoreProvider>
        <nav className="grid max-w-xs gap-2 rounded border border-slate-200 p-6">
          <Story />
        </nav>
      </SanbiStoreProvider>
    ),
  ],
  args: {
    href: "#",
    children: "Home",
    icon: <HouseLine />,
  },
} satisfies Meta<typeof NavLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    active: true,
  },
};

export const Inactive: Story = {};

export const NavigationGroup: Story = {
  render: () => (
    <>
      <NavLink href="#" icon={<HouseLine />} active>
        Home
      </NavLink>
      <NavLink href="#" icon={<MagnifyingGlass />}>
        Search
      </NavLink>
      <NavLink href="#" icon={<Playlist />}>
        Sets
      </NavLink>
      <NavLink href="#" icon={<MusicNoteSimple />}>
        Songs
      </NavLink>
    </>
  ),
};

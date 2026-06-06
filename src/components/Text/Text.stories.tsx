import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { typographyStyles } from "@lib/styles/typography";

import { Text } from "./Text";

const meta = {
  title: "Base Components/Text",
  component: Text,
  args: {
    children: "Sanbi typography sample",
  },
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TypographyStyles: Story = {
  render: () => (
    <div className="grid max-w-2xl gap-4">
      {typographyStyles.map((style) => (
        <div
          key={style}
          className="grid grid-cols-[180px_1fr] items-baseline gap-4"
        >
          <Text className="text-xs text-slate-400">{style}</Text>
          <Text style={style}>Sanbi typography sample</Text>
        </div>
      ))}
    </div>
  ),
};

export const Overrides: Story = {
  render: () => (
    <div className="grid gap-3">
      <Text fontSize="2xl" fontWeight="bold" lineHeight="tight">
        Large bold override
      </Text>
      <Text fontSize="sm" fontWeight="medium" className="text-slate-600">
        Small medium override
      </Text>
      <Text align="center" className="max-w-sm rounded bg-slate-50 p-3">
        Center-aligned text inside a constrained surface
      </Text>
    </div>
  ),
};

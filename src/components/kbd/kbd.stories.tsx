import type { Meta, StoryObj } from "@storybook/react";
import { Kbd } from "./kbd";

const meta = {
  title: "Components/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  args: { children: "Ctrl K" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shortcut: Story = {};

export const Combination: Story = {
  render: () => <span>Open commands with <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></span>,
};

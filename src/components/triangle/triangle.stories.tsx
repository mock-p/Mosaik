import type { Meta, StoryObj } from "@storybook/react";
import { Triangle } from "./triangle";

const meta: Meta<typeof Triangle> = {
  title: "Components/Triangle",
  component: Triangle,
  tags: ["autodocs"],
  args: {
    size: 48,
    direction: "up",
  },
  argTypes: {
    size: { control: { type: "range", min: 8, max: 128, step: 1 } },
    direction: {
      control: "inline-radio",
      options: ["up", "right", "down", "left"],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ color: "var(--mk-primary)" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Directions: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <Triangle {...args} direction="up" />
      <Triangle {...args} direction="right" />
      <Triangle {...args} direction="down" />
      <Triangle {...args} direction="left" />
    </div>
  ),
};

export const Secondary: Story = {
  args: { size: 48 },
  decorators: [
    (Story) => (
      <div style={{ color: "var(--mk-secondary)" }}>
        <Story />
      </div>
    ),
  ],
};

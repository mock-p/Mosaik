import type { Meta, StoryObj } from "@storybook/react";
import { Wizard } from "./wizard";

const meta: Meta<typeof Wizard> = {
  title: "Components/Wizard",
  component: Wizard,
  tags: ["autodocs"],
  args: {
    steps: [
      { label: "Manifest" },
      { label: "Permissions" },
      { label: "Test" },
      { label: "Publish" },
    ],
    current: 2,
  },
  argTypes: {
    current: { control: { type: "number", min: 0, max: 3 } },
    steps: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {
  args: { current: 0 },
};

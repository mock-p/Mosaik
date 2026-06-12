import type { Meta, StoryObj } from "@storybook/react";
import { SegmentedControl } from "./segmented-control";

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  args: {
    options: ["Éditeur", "Aperçu", "Code"],
    defaultValue: "Éditeur",
    "aria-label": "Mode",
  },
  argTypes: {
    options: { control: "object" },
    defaultValue: { control: "text" },
    "aria-label": { control: "text" },
    value: { control: false },
    onChange: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoOptions: Story = {
  args: {
    options: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
    ],
    defaultValue: "light",
  },
};

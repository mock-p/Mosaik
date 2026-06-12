import type { Meta, StoryObj } from "@storybook/react";
import { Stepper } from "./stepper";

const meta: Meta<typeof Stepper> = {
  title: "Components/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  args: {
    defaultValue: 2,
    min: 1,
    max: 8,
    step: 1,
    disabled: false,
    "aria-label": "Instances",
  },
  argTypes: {
    defaultValue: { control: "number" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
    "aria-label": { control: "text" },
    value: { control: false },
    onChange: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AtBound: Story = {
  args: { defaultValue: 1 },
};

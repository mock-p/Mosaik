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
    readOnly: { control: "boolean" },
    invalid: { control: "boolean" },
    label: { control: "text" },
    helper: { control: "text" },
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

export const LabeledInvalid: Story = {
  args: {
    label: "Concurrent executions",
    helper: "Choose between 1 and 8 executions.",
    invalid: true,
    "aria-label": undefined,
  },
};

export const ReadOnly: Story = {
  args: {
    label: "Reserved instances",
    helper: "Managed by workspace policy.",
    readOnly: true,
    "aria-label": undefined,
  },
};

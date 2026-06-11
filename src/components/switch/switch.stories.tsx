import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: {
    label: "Public listing",
    defaultChecked: false,
    disabled: false,
  },
  argTypes: {
    label: { control: "text" },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    checked: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Checked: Story = {
  args: { label: "Auto-update", defaultChecked: true },
};

export const DisabledChecked: Story = {
  args: { label: "Sandboxed", defaultChecked: true, disabled: true },
};

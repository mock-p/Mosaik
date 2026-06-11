import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./select";

const APPS = ["Notion", "Figma", "Slack", "Airtable", "Linear", "GitHub"];

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    options: APPS,
    multiple: false,
    label: "Target app",
    labelHint: "Required",
    helper: "Where this plugin will run.",
    placeholder: "Choose an app…",
    status: "none" as never,
    maxChips: 3,
    disabled: false,
  },
  argTypes: {
    options: { control: "object" },
    multiple: { control: "boolean" },
    label: { control: "text" },
    labelHint: { control: "text" },
    helper: { control: "text" },
    placeholder: { control: "text" },
    status: {
      control: "inline-radio",
      options: ["none", "error", "success"],
      mapping: { none: undefined, error: "error", success: "success" },
    },
    maxChips: { control: { type: "number", min: 1, max: 6 } },
    disabled: { control: "boolean" },
    defaultValue: { control: "object" },
    value: { control: false },
    onChange: { control: false },
  },
  decorators: [(Story) => <div style={{ maxWidth: 380, minHeight: 340 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: { defaultValue: "Notion" },
};

export const Multi: Story = {
  args: {
    multiple: true,
    label: "Compatible apps",
    labelHint: "Multi-select",
    helper: "Apps where the plugin can also be installed.",
    placeholder: "Select apps…",
    defaultValue: ["Notion", "Slack"],
  },
};

export const ManyChips: Story = {
  args: {
    multiple: true,
    label: "Compatible apps",
    placeholder: "Select apps…",
    defaultValue: ["Notion", "Slack", "Figma", "Linear", "GitHub"],
  },
};

export const WithError: Story = {
  args: {
    status: "error",
    helper: "Pick a target app first.",
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

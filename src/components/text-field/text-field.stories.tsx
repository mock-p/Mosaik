import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./text-field";

const meta: Meta<typeof TextField> = {
  title: "Components/TextField",
  component: TextField,
  tags: ["autodocs"],
  args: {
    label: "Plugin name",
    labelHint: "",
    placeholder: "e.g. Auto-tagger",
    helper: "Shown publicly in the plugin gallery.",
    status: "none" as never,
    disabled: false,
    defaultValue: "",
  },
  argTypes: {
    label: { control: "text" },
    labelHint: { control: "text" },
    placeholder: { control: "text" },
    helper: { control: "text" },
    defaultValue: { control: "text" },
    status: {
      control: "inline-radio",
      options: ["none", "error", "success"],
      mapping: { none: undefined, error: "error", success: "success" },
    },
    disabled: { control: "boolean" },
  },
  decorators: [(Story) => <div style={{ maxWidth: 380 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithHint: Story = {
  args: { label: "Target app", labelHint: "Required" },
};

export const Error: Story = {
  args: {
    label: "Slug",
    defaultValue: "auto tagger!",
    status: "error",
    helper: "Lowercase letters and dashes only.",
  },
};

export const Success: Story = {
  args: {
    label: "API key",
    defaultValue: "pk_live_4xT…9q2",
    status: "success",
    helper: "Key verified — connected to workspace.",
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Locked value" },
};

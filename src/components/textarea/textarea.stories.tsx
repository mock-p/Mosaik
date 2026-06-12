import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    label: "Description",
    labelHint: "Optional",
    placeholder: "What does this plugin do?",
    helper: "Markdown supported.",
    status: "none" as never,
    maxLength: 280,
    showCount: true,
    disabled: false,
    defaultValue: "",
    rows: 4,
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
    maxLength: { control: { type: "number", min: 0, step: 10 } },
    showCount: { control: "boolean" },
    disabled: { control: "boolean" },
    rows: { control: { type: "number", min: 2, max: 12 } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {
  args: {
    status: "error",
    helper: "Description is required.",
    defaultValue: "",
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Locked description." },
};

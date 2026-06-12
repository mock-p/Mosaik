import type { Meta, StoryObj } from "@storybook/react";
import { Kbd } from "../kbd";
import { TextField } from "./text-field";

const SearchIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <circle
      cx="6"
      cy="6"
      r="4.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M9.4 9.4 L12.5 12.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

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
    iconStart: {
      control: "select",
      options: ["none", "search"],
      mapping: { none: undefined, search: SearchIcon },
    },
    iconEnd: {
      control: "select",
      options: ["none", "kbd"],
      mapping: { none: undefined, kbd: <Kbd>⌘K</Kbd> },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

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

export const Search: Story = {
  args: {
    label: "Recherche",
    placeholder: "Rechercher un plugin…",
    helper: undefined,
    iconStart: SearchIcon,
    iconEnd: <Kbd>⌘K</Kbd>,
  },
};

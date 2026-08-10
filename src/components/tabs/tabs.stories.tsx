import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./tabs";

const ITEMS = [
  { value: "overview", label: "Overview" },
  { value: "builder", label: "Builder" },
  { value: "logs", label: "Logs", count: 3 },
  { value: "settings", label: "Settings" },
];

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  args: {
    items: ITEMS,
    defaultValue: "overview",
  },
  argTypes: {
    items: { control: "object" },
    defaultValue: { control: "text" },
    value: { control: false },
    onChange: { control: false },
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

export const WithoutCounts: Story = {
  args: {
    items: [
      { value: "editor", label: "Editor" },
      { value: "preview", label: "Preview" },
      { value: "code", label: "Code" },
    ],
    defaultValue: "editor",
  },
};

export const PanelsKeyboardAndDisabled: Story = {
  args: {
    "aria-label": "Plugin workspace",
    items: [
      {
        value: "overview",
        label: "Overview",
        panel: "Overview content is programmatically associated with its tab.",
      },
      {
        value: "logs",
        label: "Logs",
        count: 3,
        panel: "Use Arrow keys, Home and End to move between enabled tabs.",
      },
      { value: "billing", label: "Billing", disabled: true, panel: "Unavailable" },
    ],
    defaultValue: "overview",
  },
};

export const NarrowScrollable: Story = {
  parameters: { viewport: { defaultViewport: "mobile320" } },
  decorators: [(Story) => <div style={{ width: 240, maxWidth: "100%", overflowX: "auto" }}><Story /></div>],
};

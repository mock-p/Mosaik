import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../badge";
import { Accordion } from "./accordion";

const ITEMS = [
  {
    id: "permissions",
    title: "Permissions",
    meta: <Badge variant="info">3 active</Badge>,
    content:
      "Read documents, write tags, and access the clipboard. Network permissions are disabled by default.",
  },
  {
    id: "triggers",
    title: "Triggers",
    content:
      "When opening a document, creating a block, or on a schedule (cron).",
  },
  {
    id: "advanced",
    disabled: true,
    title: "Advanced",
    content:
      "Environment variables, runtime version, and detailed logging.",
  },
];

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  args: {
    items: ITEMS,
    defaultOpen: ["permissions"],
  },
  argTypes: {
    items: { control: false },
    defaultOpen: { control: "object" },
    open: { control: false },
    onToggle: { control: false },
    multiple: { control: "boolean" },
    collapsible: { control: "boolean" },
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

export const AllClosed: Story = {
  args: { defaultOpen: [] },
};

export const SinglePanel: Story = {
  args: {
    multiple: false,
    collapsible: false,
    defaultOpen: ["permissions"],
  },
};

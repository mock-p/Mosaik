import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";
import { Triangle } from "../triangle";
import { ActionMenu, type ActionMenuEntry } from "./action-menu";

const CopyIcon = (
  <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
    <rect
      x="4.75"
      y="4.75"
      width="7.5"
      height="7.5"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M9.25 2.5 H4 a2 2 0 0 0 -2 2 V9.25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const CrossIcon = (
  <svg width="11" height="11" viewBox="0 0 8 8" aria-hidden="true">
    <path
      d="M1 1l6 6M7 1L1 7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const ITEMS: ActionMenuEntry[] = [
  { label: "Run", icon: <Triangle size={12} direction="right" />, kbd: "⌘R" },
  { label: "Duplicate", icon: CopyIcon, kbd: "⌘D" },
  "separator",
  { label: "Delete", icon: CrossIcon, danger: true },
];

const meta: Meta<typeof ActionMenu> = {
  title: "Components/ActionMenu",
  component: ActionMenu,
  tags: ["autodocs"],
  args: {
    items: ITEMS,
    align: "right",
  },
  argTypes: {
    align: { control: "inline-radio", options: ["left", "right"] },
    "aria-label": { control: "text" },
    items: { control: false },
    trigger: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 235 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const OnCard: Story = {
  render: (args) => (
    <div style={{ minHeight: 235, maxWidth: 430 }}>
      <Card
        row
        title="Auto-tagger"
        author="v2.4.1 · published"
        icon={<Triangle size={16} />}
        action={<ActionMenu items={ITEMS} {...args} />}
      />
    </div>
  ),
};

export const CustomTrigger: Story = {
  args: {
    trigger: (
      <Button variant="tonal" size="sm">
        Actions
      </Button>
    ),
    align: "left",
  },
};

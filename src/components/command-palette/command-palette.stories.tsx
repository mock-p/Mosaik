import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Button } from "../button";
import { Triangle } from "../triangle";
import { CheckGlyph } from "../../internal/glyphs";
import { CommandPalette, type CommandGroup } from "./command-palette";

const PlusIcon = (
  <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
    <path
      d="M7 2.5v9M2.5 7h9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

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

const GROUPS: CommandGroup[] = [
  {
    label: "Plugin",
    items: [
      {
        label: "Run plugin",
        icon: <Triangle size={12} direction="right" />,
        kbd: "⌘R",
      },
      { label: "New block", icon: PlusIcon, kbd: "⌘N" },
      { label: "Duplicate plugin", icon: CopyIcon, kbd: "⌘D" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Search marketplace", icon: SearchIcon },
      { label: "Publish…", icon: <CheckGlyph size={13} />, kbd: "⇧⌘P" },
    ],
  },
];

const meta: Meta<typeof CommandPalette> = {
  title: "Components/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs"],
  args: {
    groups: GROUPS,
    placeholder: "Que voulez-vous faire ?",
    dialogLabel: "Command palette",
    searchLabel: "Search commands",
  },
  argTypes: {
    placeholder: { control: "text" },
    emptyMessage: { control: "text" },
    groups: { control: false },
    footer: { control: false },
    onClose: { control: false },
    open: { control: "boolean" },
    modal: { control: "boolean" },
    portal: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          minHeight: 360,
          background: "var(--mk-surface-2)",
          borderRadius: "var(--mk-c1) var(--mk-c2) var(--mk-c1) var(--mk-c2)",
          padding: "26px 18px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Embedded: Story = {};

function ModalDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open command palette</Button>
      <CommandPalette
        groups={GROUPS}
        open={open}
        modal
        closeOnSelect
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export const Modal: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ModalDemo />,
};

export const DisabledAndEmptyStates: Story = {
  args: {
    groups: [
      {
        label: "Workspace",
        items: [{ label: "Publish workspace", disabled: true, keywords: ["release"] }],
      },
    ],
  },
};

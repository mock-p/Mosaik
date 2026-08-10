import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { Modal } from "./modal";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  args: {
    open: true,
    inline: true,
    variant: "danger",
    metaLabel: "Danger zone · Auto-tagger",
    title: "Delete this plugin?",
    children:
      "Auto-tagger will be removed from the marketplace and uninstalled for 1,240 users.",
    footNote: "This action cannot be undone.",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["danger", "primary", "success", "neutral"],
    },
    open: { control: "boolean" },
    inline: { control: "boolean" },
    metaLabel: { control: "text" },
    title: { control: "text" },
    children: { control: "text" },
    footNote: { control: "text" },
    metaIcon: { control: false },
    details: { control: false },
    actions: { control: false },
    onClose: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Danger: Story = {
  args: {
    details: (
      <>
        <span><strong>1 240</strong> installs</span>
        <span>v<strong>2.4.1</strong></span>
        <span>marketplace · <strong>public</strong></span>
      </>
    ),
    actions: (
      <>
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button variant="danger" size="sm">Delete</Button>
      </>
    ),
    onClose: () => {},
  },
};

export const Confirmation: Story = {
  args: {
    variant: "primary",
    metaLabel: "Publish · Auto-tagger",
    title: "Publish this plugin?",
    children:
      "Version 2.4.1 will be reviewed, then distributed automatically to your 1,240 users.",
    footNote: "Publication after review.",
    details: (
      <>
        <span>v<strong>2.4.1</strong></span>
        <span><strong>1 240</strong> users</span>
        <span>review · <strong>~24 h</strong></span>
      </>
    ),
    actions: (
      <>
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button variant="primary" size="sm">Publish</Button>
      </>
    ),
    onClose: () => {},
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    metaLabel: "Published · Auto-tagger",
    title: "Plugin published",
    children:
      "Auto-tagger is live on the marketplace. Users receive the update immediately.",
    footNote: "Just published.",
    details: (
      <>
        <span>v<strong>2.4.1</strong></span>
        <span>status · <strong>live</strong></span>
      </>
    ),
    actions: (
      <>
        <Button variant="ghost" size="sm">Close</Button>
        <Button variant="primary" size="sm">View listing</Button>
      </>
    ),
    onClose: () => {},
  },
};

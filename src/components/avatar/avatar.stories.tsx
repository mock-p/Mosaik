import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarStack } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: {
    children: "AL",
    size: "md",
    tone: "default",
  },
  argTypes: {
    children: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: { control: "inline-radio", options: ["default", "coral", "solid"] },
    status: { control: "inline-radio", options: [undefined, "online", "away"] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SizesAndTones: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Avatar size="sm">AL</Avatar>
      <Avatar>AL</Avatar>
      <Avatar size="lg">AL</Avatar>
      <Avatar tone="coral">JR</Avatar>
      <Avatar tone="solid">MK</Avatar>
    </div>
  ),
};

export const StatusAndStack: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <Avatar status="online">AL</Avatar>
      <Avatar tone="coral" status="away">
        JR
      </Avatar>
      <AvatarStack more={4}>
        <Avatar>AL</Avatar>
        <Avatar tone="coral">JR</Avatar>
        <Avatar tone="solid">MK</Avatar>
      </AvatarStack>
    </div>
  ),
};

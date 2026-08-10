import type { Meta, StoryObj } from "@storybook/react";
import { LinkButton } from "./link-button";

const meta = {
  title: "Components/LinkButton",
  component: LinkButton,
  tags: ["autodocs"],
  args: { children: "View workspace", href: "#workspace" },
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Navigation: Story = {};
export const Secondary: Story = { args: { variant: "outline", cornerAxis: "trbl" } };
export const Disabled: Story = { args: { disabled: true } };
export const FullWidth: Story = { args: { fullWidth: true } };

import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "./typography";

const meta = {
  title: "Foundations/Typography",
  component: Heading,
  tags: ["autodocs"],
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeadingHierarchy: Story = {
  render: () => <><Heading level={1} size="display">Build clearer workflows</Heading><Heading level={2}>Workspace overview</Heading></>,
};

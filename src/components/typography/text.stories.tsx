import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./typography";

const meta = {
  title: "Foundations/Typography/Text",
  component: Text,
  tags: ["autodocs"],
  args: { children: "Clear interface text", size: "md", tone: "default" },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => <><Text>Default interface text</Text><Text tone="muted">Supporting information</Text><Text tone="brand">Highlighted guidance</Text></>,
};

export const SemanticElement: Story = {
  args: { as: "span", size: "sm", weight: "semibold", children: "Inline status label" },
};

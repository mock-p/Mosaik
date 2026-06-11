import type { Meta, StoryObj } from "@storybook/react";
import { Triangle } from "../triangle";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "Draft",
    variant: "neutral",
  },
  argTypes: {
    children: { control: "text" },
    variant: {
      control: "inline-radio",
      options: ["success", "neutral", "info", "featured", "danger"],
    },
    icon: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Badge {...args} variant="success">Published</Badge>
      <Badge {...args} variant="neutral">Draft</Badge>
      <Badge {...args} variant="info">Beta</Badge>
      <Badge {...args} variant="featured" icon={<Triangle size={9} />}>Featured</Badge>
      <Badge {...args} variant="danger">Deprecated</Badge>
    </div>
  ),
};

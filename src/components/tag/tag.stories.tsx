import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from "./tag";

const meta: Meta<typeof Tag> = {
  title: "Components/Tag",
  component: Tag,
  tags: ["autodocs"],
  args: {
    children: "notion",
    active: false,
    removable: true,
  },
  argTypes: {
    children: { control: "text" },
    active: { control: "boolean" },
    removable: { control: "boolean" },
    removeLabel: { control: "text" },
    onRemove: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Tag {...args}>notion</Tag>
      <Tag {...args}>automation</Tag>
      <Tag {...args} active>
        productivity
      </Tag>
      <Tag {...args} removable={false}>
        v2.4.1
      </Tag>
    </div>
  ),
};

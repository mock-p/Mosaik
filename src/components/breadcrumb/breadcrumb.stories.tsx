import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "./breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  args: {
    items: [
      { label: "Marketplace", href: "#" },
      { label: "Productivity", href: "#" },
      { label: "Auto-tagger" },
    ],
  },
  argTypes: {
    items: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoLevels: Story = {
  args: {
    items: [{ label: "Marketplace", href: "#" }, { label: "Auto-tagger" }],
  },
};

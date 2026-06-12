import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../card";
import { Skeleton } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  args: {
    variant: "line",
    width: 200,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["line", "title", "square"] },
    width: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingCard: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card style={{ maxWidth: 380, padding: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Skeleton variant="square" />
        <div style={{ display: "grid", gap: 8, flex: 1 }}>
          <Skeleton variant="title" width="55%" />
          <Skeleton width="35%" />
        </div>
      </div>
      <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
        <Skeleton />
        <Skeleton width="80%" />
      </div>
    </Card>
  ),
};

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./pagination";

const meta: Meta<typeof Pagination> = {
  title: "Components/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  args: {
    page: 2,
    count: 12,
    siblingCount: 1,
  },
  argTypes: {
    page: { control: { type: "number", min: 1 } },
    count: { control: { type: "number", min: 1 } },
    siblingCount: { control: { type: "number", min: 0, max: 3 } },
    onChange: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveDemo() {
  const [page, setPage] = React.useState(2);
  return <Pagination page={page} count={12} onChange={setPage} />;
}

export const Interactive: Story = {
  parameters: { controls: { disable: true } },
  render: () => <InteractiveDemo />,
};

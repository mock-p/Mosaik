import type { Meta } from "@storybook/react";
import { Button } from "../button";
import { EmptyState } from "./empty-state";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    title: "No plugins yet",
    children:
      "Create your first plugin or import an existing manifest to get started.",
    action: <Button>Create plugin</Button>,
  },
  argTypes: {
    title: { control: "text" },
    children: { control: "text" },
    art: { control: false },
    action: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

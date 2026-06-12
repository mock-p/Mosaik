import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { Progress, Spinner } from "./progress";

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
  args: {
    value: 64,
    label: "Build du plugin",
    success: false,
    indeterminate: false,
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    label: { control: "text" },
    success: { control: "boolean" },
    indeterminate: { control: "boolean" },
    valueText: { control: "text" },
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
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { value: 100, label: "Tests", success: true },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, label: undefined },
};

function ReplayDemo() {
  const [value, setValue] = React.useState(64);
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 380 }}>
      <Progress value={value} label="Build du plugin" />
      <Button
        variant="tonal"
        size="sm"
        style={{ justifySelf: "start" }}
        onClick={() => {
          setValue(0);
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setValue(64)),
          );
        }}
      >
        Rejouer
      </Button>
    </div>
  );
}

export const Replay: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ReplayDemo />,
};

export const Spinners: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <Spinner size={18} />
      <Spinner size={26} />
    </div>
  ),
};

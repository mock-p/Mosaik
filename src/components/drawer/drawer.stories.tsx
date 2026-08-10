import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { SegmentedControl } from "../segmented-control";
import { Switch } from "../switch";
import { TextField } from "../text-field";
import { Drawer } from "./drawer";

const meta: Meta<typeof Drawer> = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  args: {
    open: true,
    fixed: false,
    title: "Block: Auto-tag",
    children: "Configure the block before saving it.",
  },
  argTypes: {
    open: { control: "boolean" },
    fixed: { control: "boolean" },
    title: { control: "text" },
    children: { control: "text" },
    footer: { control: false },
    onClose: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function StageDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mk-drawer-stage">
      <div className="stage-bg">
        <Button onClick={() => setOpen(true)}>Configure block</Button>
      </div>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Block: Auto-tag"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Save
            </Button>
          </>
        }
      >
        <TextField label="Block name" defaultValue="Auto-tag" />
        <div className="mk-field">
          <span className="mk-field-label">Mode</span>
          <SegmentedControl options={["Auto", "Manual"]} aria-label="Mode" />
        </div>
        <Switch label="Active" defaultChecked />
      </Drawer>
    </div>
  );
}

export const InStage: Story = {
  parameters: { controls: { disable: true } },
  render: () => <StageDemo />,
};

export const NonFixedAtMobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile390" } },
  args: { fixed: false, portal: false, open: true },
  decorators: [(Story) => <div className="mk-drawer-stage" style={{ width: 320, maxWidth: "100%", minHeight: 440 }}><Story /></div>],
};

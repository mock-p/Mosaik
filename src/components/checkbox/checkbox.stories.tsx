import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    label: "Email notifications",
    helper: "Visible to all users in the gallery.",
    defaultChecked: false,
    indeterminate: false,
    disabled: false,
  },
  argTypes: {
    label: { control: "text" },
    helper: { control: "text" },
    defaultChecked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
    checked: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 14, justifyItems: "start" }}>
      <Checkbox {...args} label="Email notifications" helper={undefined} />
      <Checkbox {...args} label="Auto-publish updates" defaultChecked helper={undefined} />
      <Checkbox {...args} label="All permissions" indeterminate helper={undefined} />
      <Checkbox {...args} label="Marketplace listing" defaultChecked helper="Visible to all users in the gallery." />
      <Checkbox {...args} label="Required scope" defaultChecked disabled helper={undefined} />
    </div>
  ),
};

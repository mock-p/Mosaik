import type { Meta, StoryObj } from "@storybook/react";
import { Radio } from "./radio";

const meta: Meta<typeof Radio> = {
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
  args: {
    label: "One-time purchase",
    name: "pricing-playground",
    defaultChecked: true,
    disabled: false,
  },
  argTypes: {
    label: { control: "text" },
    helper: { control: "text" },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    checked: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Group: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 14, justifyItems: "start" }}>
      <Radio {...args} name="pricing" label="Free" defaultChecked={false} />
      <Radio
        {...args}
        name="pricing"
        label="One-time purchase"
        defaultChecked
      />
      <Radio
        {...args}
        name="pricing"
        label="Subscription"
        defaultChecked={false}
      />
      <Radio
        {...args}
        name="pricing"
        label="Enterprise (soon)"
        disabled
        defaultChecked={false}
      />
    </div>
  ),
};

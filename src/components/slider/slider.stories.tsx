import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./slider";

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
  args: {
    label: "Timeout d'exécution",
    unit: " s",
    min: 5,
    max: 120,
    step: 5,
    defaultValue: 30,
    showValue: true,
  },
  argTypes: {
    label: { control: "text" },
    unit: { control: "text" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    defaultValue: { control: "number" },
    showValue: { control: "boolean" },
    value: { control: false },
    onChange: { control: false },
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

export const Bare: Story = {
  args: {
    label: undefined,
    showValue: false,
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 50,
  },
};

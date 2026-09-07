import type { Meta, StoryObj } from "@storybook/react";
import { Combobox, type ComboboxOption } from "./combobox";

const OPTIONS = [
  { value: "atlas", label: "Atlas", textValue: "Atlas Universe" },
  { value: "forge", label: "Forge", textValue: "Forge Extension" },
  { value: "orbit", label: "Orbit", textValue: "Orbit Mock" },
  { value: "legacy", label: "Legacy", disabled: true },
];

const meta: Meta<typeof Combobox> = {
  title: "Components/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  args: {
    options: OPTIONS,
    label: "Resource",
    placeholder: "Search resources",
    emptyMessage: "No resources match your search",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RichOptions: Story = {
  args: {
    defaultValue: "atlas",
    renderOption: (option: ComboboxOption) => (
      <span>
        {option.label} <small style={{ color: "var(--mk-muted)" }}>{option.textValue}</small>
      </span>
    ),
  },
};

export const Error: Story = {
  args: {
    status: "error",
    helper: "Choose a resource",
    required: true,
  },
};

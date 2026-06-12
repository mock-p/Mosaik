import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Triangle } from "../triangle";

const PlusIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path
      d="M7 2.5v9M2.5 7h9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Publish plugin",
    variant: "primary",
    size: "md",
    icon: "none" as unknown as React.ReactNode,
    iconPosition: "start",
    iconOnly: false,
    loading: false,
    fullWidth: false,
    uppercase: false,
    cornerAxis: "tlbr",
    disabled: false,
    className: "default",
  },
  argTypes: {
    children: { control: "text" },
    variant: {
      control: "select",
      options: ["primary", "secondary", "tonal", "outline", "ghost", "danger"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    icon: {
      control: "select",
      options: ["none", "plus", "run"],
      mapping: {
        none: undefined,
        plus: PlusIcon,
        run: <Triangle size={13} direction="right" />,
      },
      description: "Glyph next to the label",
    },
    iconPosition: { control: "inline-radio", options: ["start", "end"] },
    iconOnly: { control: "boolean" },
    loading: { control: "boolean" },
    fullWidth: { control: "boolean" },
    uppercase: { control: "boolean" },
    cornerAxis: { control: "inline-radio", options: ["tlbr", "trbl"] },
    disabled: { control: "boolean" },
    className: {
      name: "state (forced)",
      control: "inline-radio",
      options: ["default", "hover", "focus", "pressed"],
      mapping: {
        default: "",
        hover: "is-hover",
        focus: "is-focus",
        pressed: "is-active",
      },
      description: "Force a visual state for inspection",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Button {...args} variant="primary">
        Publish plugin
      </Button>
      <Button {...args} variant="secondary">
        Try it live
      </Button>
      <Button {...args} variant="tonal">
        Duplicate
      </Button>
      <Button {...args} variant="outline">
        Settings
      </Button>
      <Button {...args} variant="ghost">
        Cancel
      </Button>
      <Button {...args} variant="danger">
        Delete
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button {...args} size="sm">
        Save draft
      </Button>
      <Button {...args} size="md">
        Save draft
      </Button>
      <Button {...args} size="lg">
        Save draft
      </Button>
    </div>
  ),
};

export const WithIconAndLoading: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button {...args} icon={<Triangle size={13} direction="right" />}>
        Run
      </Button>
      <Button {...args} variant="tonal" icon={PlusIcon}>
        New block
      </Button>
      <Button
        {...args}
        variant="outline"
        iconOnly
        icon={PlusIcon}
        aria-label="Add"
      />
      <Button {...args} loading>
        Publishing…
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button {...args} className="is-hover">
        hover
      </Button>
      <Button {...args} className="is-focus">
        focus
      </Button>
      <Button {...args} className="is-active">
        pressed
      </Button>
      <Button {...args} disabled>
        disabled
      </Button>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { Triangle } from "../triangle";
import { FloatingButton, FloatingLayer } from "./floating-layer";

const meta: Meta<typeof FloatingLayer> = {
  title: "Components/FloatingLayer",
  component: FloatingLayer,
  tags: ["autodocs"],
  args: {
    placement: "top",
    children: "Run this plugin",
    pointer: true,
  },
  argTypes: {
    placement: {
      control: "inline-radio",
      options: ["top", "bottom", "left", "right"],
    },
    title: { control: "text" },
    children: { control: "text" },
    tip: { control: "boolean" },
    pointer: { control: "boolean" },
    actions: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Tooltip: Story = {};

export const RichTooltip: Story = {
  args: {
    title: "Sandboxed",
    children: "Le plugin s'exécute isolé, sans accès réseau sortant.",
  },
};

export const Popover: Story = {
  args: {
    placement: "right",
    title: "Share this plugin",
    children: "Toute personne disposant du lien pourra installer la version publiée.",
    actions: (
      <>
        <FloatingButton>Settings</FloatingButton>
        <FloatingButton variant="primary">Copy link</FloatingButton>
      </>
    ),
  },
};

export const FourDirections: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 44, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <FloatingLayer placement="top">Run this plugin</FloatingLayer>
        <Button variant="outline" iconOnly icon={<Triangle size={13} direction="right" />} aria-label="Run" />
      </div>
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Button variant="outline" iconOnly icon={<Triangle size={13} />} aria-label="Add" />
        <FloatingLayer placement="bottom">New block</FloatingLayer>
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
        <FloatingLayer placement="left">Duplicate</FloatingLayer>
        <Button variant="outline" iconOnly icon={<Triangle size={13} />} aria-label="Duplicate" />
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
        <Button variant="outline" iconOnly icon={<Triangle size={13} />} aria-label="Settings" />
        <FloatingLayer placement="right">Settings</FloatingLayer>
      </div>
    </div>
  ),
};

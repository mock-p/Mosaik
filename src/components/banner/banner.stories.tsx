import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";
import { Banner } from "./banner";

const meta: Meta<typeof Banner> = {
  title: "Components/Banner",
  component: Banner,
  tags: ["autodocs"],
  args: {
    variant: "brand",
    children: (
      <>
        <strong>Mosaik SDK 3.2 est là.</strong> Déclencheurs planifiés et nouveau runtime.
      </>
    ),
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["brand", "warning"] },
    children: { control: false },
    icon: { control: false },
    action: { control: false },
    onDismiss: { control: false },
  },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {
  args: {
    action: (
      <Button size="sm" style={{ background: "#FFFFFF", color: "#2B38C9", borderColor: "#FFFFFF" }}>
        Découvrir
      </Button>
    ),
    onDismiss: () => {},
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: (
      <>
        <strong>Maintenance planifiée</strong> — samedi 14 juin, 02:00–04:00 UTC.
      </>
    ),
    onDismiss: () => {},
  },
};

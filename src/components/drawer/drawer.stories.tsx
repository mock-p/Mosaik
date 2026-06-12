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
    title: "Bloc : Auto-tag",
    children: "Configurez le bloc avant de l'enregistrer.",
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
        <Button onClick={() => setOpen(true)}>Configurer le bloc</Button>
      </div>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Bloc : Auto-tag"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Enregistrer
            </Button>
          </>
        }
      >
        <TextField label="Nom du bloc" defaultValue="Auto-tag" />
        <div className="mk-field">
          <span className="mk-field-label">Mode</span>
          <SegmentedControl options={["Auto", "Manuel"]} aria-label="Mode" />
        </div>
        <Switch label="Actif" defaultChecked />
      </Drawer>
    </div>
  );
}

export const InStage: Story = {
  parameters: { controls: { disable: true } },
  render: () => <StageDemo />,
};

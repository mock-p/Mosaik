import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    variant: "info",
    title: "Nouvelle version disponible",
    children: "Mosaik SDK 3.2 apporte les déclencheurs planifiés.",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["info", "success", "warning", "danger"],
    },
    title: { control: "text" },
    children: { control: "text" },
    icon: { control: false },
    onDismiss: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Dismissible: Story = {
  args: { onDismiss: () => {} },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
      <Alert
        variant="info"
        title="Nouvelle version disponible"
        onDismiss={() => {}}
      >
        Mosaik SDK 3.2 apporte les déclencheurs planifiés.
      </Alert>
      <Alert variant="success" title="Clé API vérifiée">
        Votre workspace est connecté.
      </Alert>
      <Alert variant="warning" title="Quota presque atteint">
        92 % des exécutions mensuelles utilisées.
      </Alert>
      <Alert variant="danger" title="Build échoué" onDismiss={() => {}}>
        Le manifest contient une erreur de syntaxe.
      </Alert>
    </div>
  ),
};

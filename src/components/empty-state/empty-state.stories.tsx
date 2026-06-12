import type { Meta } from "@storybook/react";
import { Button } from "../button";
import { EmptyState } from "./empty-state";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    title: "Aucun plugin pour l'instant",
    children:
      "Créez votre premier plugin ou importez un manifest existant pour démarrer.",
    action: <Button>Créer un plugin</Button>,
  },
  argTypes: {
    title: { control: "text" },
    children: { control: "text" },
    art: { control: false },
    action: { control: false },
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

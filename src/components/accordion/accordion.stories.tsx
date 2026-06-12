import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../badge";
import { Accordion } from "./accordion";

const ITEMS = [
  {
    id: "permissions",
    title: "Permissions",
    meta: <Badge variant="info">3 actives</Badge>,
    content:
      "Lecture des documents, écriture des tags, accès au presse-papier. Les permissions réseau sont désactivées par défaut.",
  },
  {
    id: "triggers",
    title: "Déclencheurs",
    content:
      "À l'ouverture d'un document, à la création d'un bloc, ou planifié (cron).",
  },
  {
    id: "advanced",
    title: "Avancé",
    content:
      "Variables d'environnement, version du runtime, journalisation détaillée.",
  },
];

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  args: {
    items: ITEMS,
    defaultOpen: ["permissions"],
  },
  argTypes: {
    items: { control: false },
    defaultOpen: { control: "object" },
    open: { control: false },
    onToggle: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllClosed: Story = {
  args: { defaultOpen: [] },
};

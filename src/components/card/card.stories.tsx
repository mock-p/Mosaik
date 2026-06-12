import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../badge";
import { Button } from "../button";
import { Triangle } from "../triangle";
import { Card } from "./card";

const PlusIcon = (
  <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden="true">
    <path
      d="M7 2.5v9M2.5 7h9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  args: {
    title: "Auto-tagger",
    author: "par Lena K.",
    description:
      "Classe automatiquement vos pages Notion avec des tags générés à partir du contenu.",
    icon: <Triangle size={18} />,
    iconTone: "primary",
    badge: <Badge variant="success">Published</Badge>,
    action: (
      <Button variant="tonal" size="sm">
        Install
      </Button>
    ),
    row: false,
  },
  argTypes: {
    title: { control: "text" },
    author: { control: "text" },
    description: { control: "text" },
    iconTone: { control: "inline-radio", options: ["primary", "coral"] },
    row: { control: "boolean" },
    icon: { control: false },
    badge: { control: false },
    action: { control: false },
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

export const PluginCards: Story = {
  render: (args) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 16,
      }}
    >
      <Card {...args} />
      <Card
        {...args}
        title="Linear ↔ Slack Sync"
        author="par Tomas R."
        description="Synchronise les issues Linear avec vos canaux Slack, dans les deux sens."
        icon={<Triangle size={18} direction="right" />}
        iconTone="coral"
        badge={<Badge variant="info">Beta</Badge>}
        action={
          <Button variant="primary" size="sm">
            Install
          </Button>
        }
      />
    </div>
  ),
};

export const Row: Story = {
  args: {
    row: true,
    title: "Markdown Export",
    author: "par vous · modifié il y a 2 j",
    description: undefined,
    icon: PlusIcon,
    badge: <Badge variant="neutral">Draft</Badge>,
    action: (
      <Button variant="ghost" size="sm">
        Edit
      </Button>
    ),
  },
};

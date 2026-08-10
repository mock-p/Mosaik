import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    variant: "info",
    title: "New version available",
    children: "Mosaik SDK 3.2 adds scheduled triggers.",
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
          title="New version available"
        onDismiss={() => {}}
      >
          Mosaik SDK 3.2 adds scheduled triggers.
      </Alert>
        <Alert variant="success" title="API key verified">
      Your workspace is connected.
      </Alert>
        <Alert variant="warning" title="Quota nearly reached">
          92% of monthly runs used.
      </Alert>
        <Alert variant="danger" title="Build failed" onDismiss={() => {}}>
          The manifest contains a syntax error.
      </Alert>
    </div>
  ),
};

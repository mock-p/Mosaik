import type { Meta, StoryObj } from "@storybook/react";
import { Definition } from "./definition";

const meta: Meta<typeof Definition> = {
  title: "Components/Definition",
  component: Definition,
  tags: ["autodocs"],
  args: {
    title: "Machine",
    children: "machine",
    content: "The computer that runs your server, in the cloud or at home.",
    placement: "top",
    delay: 300,
    disabled: false,
  },
  argTypes: {
    placement: {
      control: "inline-radio",
      options: ["top", "bottom", "left", "right"],
    },
    title: { control: "text" },
    children: { control: "text" },
    content: { control: "text" },
    delay: { control: { type: "number", min: 0, step: 50 } },
    disabled: { control: "boolean" },
    action: { control: false },
  },
  render: (args) => (
    <p style={{ padding: "96px 24px", maxWidth: 520, fontFamily: "var(--mk-font-ui)" }}>
      Start your <Definition {...args} /> to play with your friends.
    </p>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithLearnMore: Story = {
  args: {
    action: <a href="#glossary-machine">Learn more</a>,
  },
};

export const InHeading: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <h2 style={{ padding: "96px 24px 24px", fontFamily: "var(--mk-font-display)" }}>
      Your{" "}
      <Definition
        title="Mock"
        content="A Minecraft plugin built without code in Mocka. It installs on a server."
        action={<a href="#glossary-mock">Learn more</a>}
        placement="bottom"
      >
        mocks
      </Definition>
    </h2>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const EdgeOfViewport: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "96px 0", fontFamily: "var(--mk-font-ui)" }}>
      <span>
        <Definition title="Coins" content="Used to buy on the Marketplace." action={<a href="#coins">Learn more</a>}>
          coins
        </Definition>
      </span>
      <span>
        <Definition
          title="Server credits"
          content="Used to pay for hosting your servers."
          action={<a href="#credits">Learn more</a>}
        >
          server credits
        </Definition>
      </span>
    </div>
  ),
};

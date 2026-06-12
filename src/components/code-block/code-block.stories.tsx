import type { Meta, StoryObj } from "@storybook/react";
import { CodeBlock, InlineCode } from "./code-block";

const CODE = `{
  "name": "auto-tagger",
  "version": "2.4.1",
  "permissions": ["read", "write"]
}`;

/* naive JSON coloring matching the design's tk-key / tk-str spans */
function renderJsonLine(line: string) {
  const parts = line.split(/("[^"]*")/g);
  let isKey = true;
  return parts.map((part, i) => {
    if (!part.startsWith('"')) {
      if (part.includes(":")) isKey = false;
      if (part.includes(",") || part.includes("[")) isKey = !part.includes(":");
      return part;
    }
    const cls =
      isKey && line.trimStart().startsWith(part) ? "tk-key" : "tk-str";
    return (
      <span key={i} className={cls}>
        {part}
      </span>
    );
  });
}

const meta: Meta<typeof CodeBlock> = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  args: {
    title: "manifest.json",
    code: CODE,
    lineNumbers: true,
  },
  argTypes: {
    title: { control: "text" },
    code: { control: "text" },
    lineNumbers: { control: "boolean" },
    copyLabel: { control: "text" },
    copiedLabel: { control: "text" },
    renderLine: { control: false },
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

export const Highlighted: Story = {
  args: { renderLine: renderJsonLine },
};

export const Inline: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <p
      style={{
        fontFamily: "var(--mk-font-ui)",
        fontSize: 13.5,
        color: "var(--mk-muted)",
        maxWidth: "52ch",
      }}
    >
      Appelez <InlineCode>mosaik.run()</InlineCode> après avoir déclaré le
      déclencheur dans <InlineCode>manifest.json</InlineCode>.
    </p>
  ),
};

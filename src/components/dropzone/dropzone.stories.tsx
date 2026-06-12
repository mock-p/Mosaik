import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../badge";
import { Dropzone, FileItem } from "./dropzone";

const meta: Meta<typeof Dropzone> = {
  title: "Components/Dropzone",
  component: Dropzone,
  tags: ["autodocs"],
  args: {
    title: (
      <>
        Glissez votre manifest ici ou <em>parcourez</em>
      </>
    ),
    hint: "JSON ou YAML · 2 Mo max",
    accept: ".json,.yaml,.yml",
    multiple: false,
  },
  argTypes: {
    hint: { control: "text" },
    accept: { control: "text" },
    multiple: { control: "boolean" },
    title: { control: false },
    icon: { control: false },
    onFiles: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImportedFile: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 14, maxWidth: 420 }}>
      <Dropzone {...args} />
      <FileItem
        name="manifest.json"
        meta="14 Ko · importé"
        end={<Badge variant="success">Valide</Badge>}
      />
    </div>
  ),
};

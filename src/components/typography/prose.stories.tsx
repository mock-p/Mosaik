import type { Meta, StoryObj } from "@storybook/react";
import { Prose } from "./typography";

const meta = {
  title: "Foundations/Typography/Prose",
  component: Prose,
  tags: ["autodocs"],
  args: { measure: "default" },
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EditorialContent: Story = {
  render: (args) => <Prose {...args}><h2>Design for focused work</h2><p>Mosaik keeps documentation readable while preserving semantic HTML and a comfortable measure.</p><blockquote>Structure supports the content; it does not replace it.</blockquote></Prose>,
};

export const LongMeasure: Story = {
  args: { measure: "long", children: <><h2>Long-form guidance</h2><p>Use the long measure for reference material that benefits from a wider reading column.</p></> },
};

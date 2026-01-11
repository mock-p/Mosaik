import Button from "@/components/core/Button";

export default {
  title: 'Core/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const Default = {
  args: {
    text: 'Click Me',
    primary: true,
  },
};
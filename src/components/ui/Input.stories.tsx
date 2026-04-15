import type { Meta, StoryObj } from "@storybook/react";
import { Input, TextArea } from "./Input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Name",
    placeholder: "Enter resource name...",
  },
};

export const WithIcon: Story = {
  args: {
    label: "Search",
    placeholder: "Search resources...",
  },
};

export const WithAccent: Story = {
  args: {
    label: "Lambda Function",
    placeholder: "my-function",
    accentColor: "amber",
  },
};

export const Disabled: Story = {
  args: {
    label: "Read Only",
    value: "arn:aws:iam::000000000000:user/admin",
    disabled: true,
  },
};

export const TextAreaExample: StoryObj<typeof TextArea> = {
  render: (args) => <TextArea {...args} />,
  args: {
    label: "Description",
    placeholder: "Enter long description...",
    rows: 4,
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "success",
        "warning",
        "error",
        "info",
        "mono",
        "purple",
        "amber",
        "orange",
        "rose",
        "blue",
        "emerald",
        "sky",
        "teal",
        "pink",
        "cyan",
        "indigo",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Default Badge",
    variant: "default",
  },
};

export const Success: Story = {
  args: {
    children: "Success Status",
    variant: "success",
  },
};

export const Error: Story = {
  args: {
    children: "Error Status",
    variant: "error",
  },
};

export const Mono: Story = {
  args: {
    children: "v1.2.3",
    variant: "mono",
  },
};

export const ServicePurple: Story = {
  args: {
    children: "IAM",
    variant: "purple",
  },
};

export const ServiceAmber: Story = {
  args: {
    children: "Lambda",
    variant: "amber",
  },
};

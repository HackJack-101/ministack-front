import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Plus, RefreshCw } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "ghost",
        "outline",
        "purple",
        "rose",
        "cyan",
        "indigo",
        "teal",
        "pink",
        "amber",
        "emerald",
        "sky",
        "orange",
        "blue",
      ],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Primary Button",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary Button",
    variant: "secondary",
  },
};

export const Success: Story = {
  args: {
    children: "Success Button",
    variant: "success",
  },
};

export const Danger: Story = {
  args: {
    children: "Danger Button",
    variant: "danger",
  },
};

export const Warning: Story = {
  args: {
    children: "Warning Button",
    variant: "warning",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost Button",
    variant: "ghost",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline Button",
    variant: "outline",
  },
};

export const WithIcon: Story = {
  args: {
    children: "Create Resource",
    leftIcon: <Plus className="w-3.5 h-3.5" />,
  },
};

export const Loading: Story = {
  args: {
    children: "Saving...",
    isLoading: true,
  },
};

export const SmallIcon: Story = {
  args: {
    variant: "ghost",
    size: "sm",
    children: <RefreshCw className="w-4 h-4" />,
  },
};

export const ServiceAmber: Story = {
  args: {
    children: "Lambda Action",
    variant: "amber",
  },
};

export const ServiceOrange: Story = {
  args: {
    children: "SQS Action",
    variant: "orange",
  },
};

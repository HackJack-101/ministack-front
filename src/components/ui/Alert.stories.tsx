import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Informational: Story = {
  args: {
    type: "info",
    message: "A new version of the dashboard is ready to install.",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    message: "The new S3 bucket has been successfully provisioned.",
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    message: "You have reached 80% of your current instance quota.",
  },
};

export const Error: Story = {
  args: {
    type: "error",
    message: "Unable to reach the backend service. Check your network.",
  },
};

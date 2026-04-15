import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState";
import { Inbox, HardDrive, Shield } from "lucide-react";

const meta: Meta<typeof EmptyState> = {
  title: "UI/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: Inbox,
    title: "No messages found",
    description: "Send your first message to see it here.",
  },
};

export const WithAction: Story = {
  args: {
    icon: HardDrive,
    title: "No buckets yet",
    description: "Create your first S3 bucket to get started.",
    action: { label: "Create Bucket", onClick: () => alert("Clicked") },
  },
};

export const NoDescription: Story = {
  args: {
    icon: Shield,
    title: "Access Denied",
  },
};

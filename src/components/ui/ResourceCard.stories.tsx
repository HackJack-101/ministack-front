import type { Meta, StoryObj } from "@storybook/react";
import { ResourceCard } from "./ResourceCard";
import { Badge } from "./Badge";
import { Zap, Database, HardDrive } from "lucide-react";

const meta: Meta<typeof ResourceCard> = {
  title: "UI/ResourceCard",
  component: ResourceCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Lambda: Story = {
  args: {
    title: "process-order-worker",
    subtitle: "arn:aws:lambda:us-east-1:000000000000:function:process-order-worker",
    icon: Zap,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    hoverBorder: "hover:border-amber-500/50",
    hoverBg: "hover:bg-amber-500/[0.02]",
    badge: <Badge variant="success">Active</Badge>,
    onClick: () => {},
    onDelete: (e) => {
      e.stopPropagation();
      alert("Delete clicked");
    },
  },
};

export const S3: Story = {
  args: {
    title: "my-app-assets-production",
    subtitle: "2,450 objects • 1.2 GB",
    icon: HardDrive,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    hoverBorder: "hover:border-blue-500/50",
    hoverBg: "hover:bg-blue-500/[0.02]",
    onClick: () => {},
  },
};

export const RDS: Story = {
  args: {
    title: "customer-db-primary",
    subtitle: "mysql-8.0.32 • db.t3.medium",
    icon: Database,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-600/10",
    hoverBorder: "hover:border-blue-600/50",
    hoverBg: "hover:bg-blue-600/[0.02]",
    badge: <Badge variant="warning">Backing up</Badge>,
    onClick: () => {},
  },
};

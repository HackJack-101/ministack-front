import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "./PageHeader";
import { Button } from "./Button";
import { Plus, RefreshCw } from "lucide-react";

const meta: Meta<typeof PageHeader> = {
  title: "UI/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Functions",
    subtitle: "Manage your Lambda functions",
  },
};

export const WithActions: Story = {
  args: {
    title: "S3 Buckets",
    subtitle: "List of all buckets in your account",
    actions: (
      <>
        <Button variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Create Bucket
        </Button>
      </>
    ),
  },
};

export const WithBackButton: Story = {
  args: {
    title: "my-function",
    subtitle: "Function details and configuration",
    backButton: {
      label: "Back to functions",
      onClick: () => alert("Back clicked"),
    },
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmModal } from "./ConfirmModal";
import { Button } from "./Button";
import { useState } from "react";

const meta: Meta<typeof ConfirmModal> = {
  title: "UI/ConfirmModal",
  component: ConfirmModal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ConfirmStory = (args) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button variant={args.confirmVariant === "danger" ? "danger" : "warning"} onClick={() => setIsOpen(true)}>
        Open Confirm Modal
      </Button>
      <ConfirmModal {...args} open={isOpen} onConfirm={() => setIsOpen(false)} onCancel={() => setIsOpen(false)} />
    </>
  );
};

export const Danger: Story = {
  render: (args) => <ConfirmStory {...args} />,
  args: {
    title: "Delete resource?",
    description: "This action cannot be undone. All data will be permanently removed.",
    confirmVariant: "danger",
    confirmLabel: "Delete",
  },
};

export const Warning: Story = {
  render: (args) => <ConfirmStory {...args} />,
  args: {
    title: "Purge queue?",
    description: "This will remove all messages from the queue. Are you sure?",
    confirmVariant: "warning",
    confirmLabel: "Purge",
  },
};

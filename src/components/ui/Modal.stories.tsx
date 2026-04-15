import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { useState } from "react";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ModalStory = (args) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This is a standard modal body. You can place any form fields or content here.
          </p>
          <Input label="Resource Name" placeholder="my-resource" />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsOpen(false)}>
            Create
          </Button>
        </div>
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: (args) => <ModalStory {...args} />,
  args: {
    title: "Create Resource",
  },
};

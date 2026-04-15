import type { Meta, StoryObj } from "@storybook/react";
import { ObjectKeyModal } from "./ObjectKeyModal";
import { Button } from "../ui/Button";
import { useState } from "react";

const meta: Meta<typeof ObjectKeyModal> = {
  title: "S3/ObjectKeyModal",
  component: ObjectKeyModal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ObjectKeyModalStory = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <ObjectKeyModal
        {...args}
        open={isOpen}
        onConfirm={(value) => {
          console.log("Confirmed with value:", value);
          setIsOpen(false);
        }}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export const Default: Story = {
  render: (args) => <ObjectKeyModalStory {...args} />,
  args: {
    title: "Copy Object",
    initialValue: "my-folder/my-object.txt",
  },
};

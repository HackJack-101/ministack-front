import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "./DataTable";
import { Badge } from "./Badge";
import { Trash2, HardDrive } from "lucide-react";

const meta: Meta<typeof DataTable> = {
  title: "UI/DataTable",
  component: DataTable,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const columns = [
  { key: "name", header: "Name", className: "font-medium", render: (r: any) => r.name },
  {
    key: "status",
    header: "Status",
    render: (r: any) => <Badge variant={r.status === "active" ? "success" : "warning"}>{r.status}</Badge>,
  },
  { key: "size", header: "Size", render: (r: any) => r.size },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: () => (
      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all">
        <button className="p-1 hover:bg-surface-hover rounded text-red-500">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
  },
];

const rows = [
  { id: "1", name: "backup-2024.zip", status: "active", size: "1.2 GB" },
  { id: "2", name: "logs-april.txt", status: "active", size: "450 KB" },
  { id: "3", name: "temp-data.tmp", status: "pending", size: "0 B" },
];

export const Default: Story = {
  args: {
    columns,
    rows,
    rowKey: (r: any) => r.id,
  },
};

export const Loading: Story = {
  args: {
    columns,
    rows: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    columns,
    rows: [],
    emptyTitle: "No objects found",
    emptyDescription: "Upload a file to get started.",
    emptyIcon: HardDrive,
  },
};

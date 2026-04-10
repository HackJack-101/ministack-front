import { useState, useEffect } from "react";
import { Settings, RefreshCw, Plus, Search, Trash2, Edit2, Lock } from "lucide-react";
import { useSSM } from "../hooks/useSSM";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { CreateParameterModal } from "../components/ssm/CreateParameterModal";
import type { ParameterMetadata } from "@aws-sdk/client-ssm";

export const SSM = () => {
  const ssm = useSSM();
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<{ name: string; value: string; type: any } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    ssm.fetchParameters();
  }, [ssm.fetchParameters]);

  const handleEdit = async (param: ParameterMetadata) => {
    if (!param.Name) return;
    const value = await ssm.getParameterValue(param.Name);
    setEditingParam({
      name: param.Name,
      value,
      type: param.Type,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (name: string) => {
    confirm({
      title: "Delete parameter?",
      description: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      action: () => ssm.deleteParameter(name),
    });
  };

  const filteredParams = ssm.parameters.filter((p) => p.Name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Parameter Store"
        subtitle="Manage hierarchical configuration data and secrets"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={ssm.fetchParameters} title="Refresh">
              <RefreshCw className={`w-4 h-4 ${ssm.loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="indigo"
              size="sm"
              onClick={() => {
                setEditingParam(null);
                setIsModalOpen(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Parameter
            </Button>
          </>
        }
      />

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
        <input
          type="text"
          className="w-full bg-surface-card border border-border-subtle rounded px-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Filter parameters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
        <DataTable
          columns={[
            {
              key: "name",
              header: "Name",
              render: (p: ParameterMetadata) => (
                <div className="flex items-center gap-2">
                  {p.Type === "SecureString" && <Lock className="w-3 h-3 text-indigo-500" />}
                  <span className="font-medium text-text-primary">{p.Name}</span>
                </div>
              ),
            },
            {
              key: "type",
              header: "Type",
              render: (p: ParameterMetadata) => (
                <span className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-secondary border border-border-subtle">
                  {p.Type}
                </span>
              ),
            },
            {
              key: "modified",
              header: "Last Modified",
              render: (p: ParameterMetadata) =>
                p.LastModifiedDate ? new Date(p.LastModifiedDate).toLocaleString() : "-",
            },
            {
              key: "actions",
              header: "Actions",
              render: (p: ParameterMetadata) => (
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(p);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-text-muted hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.Name!);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ),
              className: "w-24",
            },
          ]}
          rows={filteredParams}
          rowKey={(p: ParameterMetadata) => p.Name || ""}
          loading={ssm.loading}
          emptyIcon={Settings}
          emptyTitle="No parameters found"
          emptyDescription="Create a parameter to store configuration or secrets."
          emptyAction={{
            label: "Create Parameter",
            onClick: () => setIsModalOpen(true),
          }}
        />
      </div>

      <CreateParameterModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={async (name, value, type) => {
          await ssm.putParameter(name, value, type);
        }}
        initialName={editingParam?.name}
        initialValue={editingParam?.value}
        initialType={editingParam?.type}
        isEdit={!!editingParam}
      />
      {ConfirmModalComponent}
    </div>
  );
};

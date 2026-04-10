import { useState } from "react";
import { ShieldCheck, RefreshCw, Plus, Trash2 } from "lucide-react";
import { useWAFv2 } from "../hooks/useWAFv2";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";

export default function WAFv2() {
  const { webACLs, loading, createWebACL, deleteWebACL, refresh } = useWAFv2();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsCreating(true);
    await createWebACL(newName);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setNewName("");
  };

  const handleDelete = (name: string, id: string, lockToken: string) => {
    confirm({
      title: "Delete Web ACL",
      description: `Are you sure you want to delete Web ACL "${name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      confirmVariant: "danger",
      action: () => deleteWebACL(name, id, lockToken),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="WAF v2"
        subtitle="Protect your applications from common web exploits"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Web ACL
            </Button>
          </>
        }
      />

      {loading && webACLs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="rose" />
          <p className="mt-4 text-gray-500">Loading Web ACLs...</p>
        </div>
      ) : webACLs.length === 0 ? (
        <EmptyState
          title="No Web ACLs"
          description="Create a Web ACL to protect your resources from web exploits."
          icon={ShieldCheck}
          action={{
            label: "Create Web ACL",
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <DataTable
          rows={webACLs}
          rowKey={(p) => p.Id || ""}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (p: any) => (
                <div className="flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-rose-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{p.Name}</span>
                </div>
              ),
            },
            {
              key: "id",
              header: "ID",
              render: (p: any) => (
                <code className="text-xs bg-surface-elevated px-1 py-0.5 rounded text-text-secondary">{p.Id}</code>
              ),
            },
            {
              key: "arn",
              header: "ARN",
              render: (p: any) => (
                <span className="text-xs text-gray-500 break-all max-w-xs block" title={p.ARN}>
                  {p.ARN}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (p: any) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(p.Name!, p.Id!, p.LockToken!)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ),
            },
          ]}
        />
      )}

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Web ACL">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name"
            placeholder="my-web-acl"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            autoFocus
          />
          <p className="text-xs text-gray-500">
            Note: This will create a regional Web ACL with default "Allow" action and no rules.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} color="rose">
              Create Web ACL
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}

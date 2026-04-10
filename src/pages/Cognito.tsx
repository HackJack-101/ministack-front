import { useState } from "react";
import { Users, RefreshCw, Plus, Trash2, Key } from "lucide-react";
import { useCognito } from "../hooks/useCognito";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";

export default function Cognito() {
  const { userPools, identityPools, loading, createUserPool, deleteUserPool, refresh } = useCognito();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPoolName, setNewPoolName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"user-pools" | "identity-pools">("user-pools");
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleCreateUserPool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoolName.trim()) return;

    setIsCreating(true);
    await createUserPool(newPoolName);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setNewPoolName("");
  };

  const handleDeleteUserPool = (id: string, name: string) => {
    confirm({
      title: "Delete User Pool",
      description: `Are you sure you want to delete user pool "${name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      confirmVariant: "danger",
      action: () => deleteUserPool(id),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cognito"
        subtitle="Manage user authentication and identity pools"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {activeTab === "user-pools" && (
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create User Pool
              </Button>
            )}
          </>
        }
      />

      <div className="flex border-b border-border-subtle">
        <button
          onClick={() => setActiveTab("user-pools")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "user-pools"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          User Pools
        </button>
        <button
          onClick={() => setActiveTab("identity-pools")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "identity-pools"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Identity Pools
        </button>
      </div>

      {loading && userPools.length === 0 && identityPools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="indigo" />
          <p className="mt-4 text-gray-500">Loading Cognito resources...</p>
        </div>
      ) : activeTab === "user-pools" ? (
        userPools.length === 0 ? (
          <EmptyState
            title="No User Pools"
            description="Create a user pool to manage your users and authentication."
            icon={Users}
            action={{
              label: "Create User Pool",
              onClick: () => setIsCreateModalOpen(true),
            }}
          />
        ) : (
          <DataTable
            rows={userPools}
            rowKey={(p) => p.Id || ""}
            columns={[
              {
                key: "name",
                header: "Name",
                render: (p: any) => (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-indigo-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{p.Name}</span>
                  </div>
                ),
              },
              {
                key: "id",
                header: "Pool ID",
                render: (p: any) => (
                  <code className="text-xs bg-surface-elevated px-1 py-0.5 rounded text-text-secondary">{p.Id}</code>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (p: any) => (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {p.Status || "Enabled"}
                  </span>
                ),
              },
              {
                key: "modified",
                header: "Last Modified",
                render: (p: any) => (p.LastModifiedDate ? new Date(p.LastModifiedDate).toLocaleString() : "-"),
              },
              {
                key: "actions",
                header: "",
                className: "text-right",
                render: (p: any) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUserPool(p.Id!, p.Name!)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                ),
              },
            ]}
          />
        )
      ) : identityPools.length === 0 ? (
        <EmptyState
          title="No Identity Pools"
          description="Identity pools provide AWS credentials to your users."
          icon={Key}
        />
      ) : (
        <DataTable
          rows={identityPools}
          rowKey={(p) => p.IdentityPoolId || ""}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (p: any) => (
                <div className="flex items-center">
                  <Key className="w-4 h-4 mr-2 text-indigo-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{p.IdentityPoolName}</span>
                </div>
              ),
            },
            {
              key: "id",
              header: "Pool ID",
              render: (p: any) => (
                <code className="text-xs bg-surface-elevated px-1 py-0.5 rounded text-text-secondary">
                  {p.IdentityPoolId}
                </code>
              ),
            },
          ]}
        />
      )}

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create User Pool">
        <form onSubmit={handleCreateUserPool} className="space-y-4">
          <Input
            label="Pool Name"
            placeholder="my-user-pool"
            value={newPoolName}
            onChange={(e) => setNewPoolName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} color="indigo">
              Create Pool
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}

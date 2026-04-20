import { useState } from "react";
import { Map, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useCloudMap } from "../hooks/useCloudMap";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { serviceTokens } from "../design-system/serviceTokens";
import type { Namespace, Service } from "@aws-sdk/client-servicediscovery";

export default function CloudMap() {
  const { namespaces, services, loading, createNamespace, deleteNamespace, refresh } = useCloudMap();
  const token = serviceTokens.cloudMap;
  const [activeTab, setActiveTab] = useState<"namespaces" | "services">("namespaces");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [namespaceName, setNamespaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namespaceName.trim()) return;
    setIsCreating(true);
    await createNamespace(namespaceName);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setNamespaceName("");
  };

  const handleDelete = (ns: Namespace) => {
    confirm({
      title: `Delete namespace "${ns.Name}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteNamespace(ns.Id!),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cloud Map"
        subtitle="Service discovery namespaces"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {activeTab === "namespaces" && (
              <Button variant={token.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Namespace
              </Button>
            )}
          </>
        }
      />

      <div className="flex items-center gap-1 border-b border-border-subtle mb-5">
        <button
          onClick={() => setActiveTab("namespaces")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "namespaces"
              ? "border-teal-600 text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Namespaces
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "services"
              ? "border-teal-600 text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Services
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-teal-600" />
          <p className="mt-4 text-text-muted">Loading...</p>
        </div>
      ) : activeTab === "namespaces" ? (
        namespaces.length === 0 ? (
          <EmptyState
            title="No Namespaces"
            description="Create a Cloud Map namespace to enable service discovery."
            icon={Map}
            action={
              <Button variant={token.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Namespace
              </Button>
            }
          />
        ) : (
          <DataTable
            rows={namespaces}
            rowKey={(ns: Namespace) => ns.Id || ""}
            accentColor="teal"
            columns={[
              {
                key: "id",
                header: "ID",
                render: (ns: Namespace) => <Badge variant="mono">{ns.Id || "—"}</Badge>,
              },
              {
                key: "name",
                header: "Name",
                render: (ns: Namespace) => <span className="font-medium text-text-primary">{ns.Name || "—"}</span>,
              },
              {
                key: "type",
                header: "Type",
                render: (ns: Namespace) => <Badge variant="teal">{ns.Type || "—"}</Badge>,
              },
              {
                key: "serviceCount",
                header: "Services",
                render: (ns: Namespace) => <span className="text-sm text-text-secondary">{ns.ServiceCount ?? 0}</span>,
              },
              {
                key: "actions",
                header: "",
                className: "text-right",
                render: (ns: Namespace) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(ns)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                ),
              },
            ]}
          />
        )
      ) : services.length === 0 ? (
        <EmptyState title="No Services" description="No Cloud Map services found." icon={Map} />
      ) : (
        <DataTable
          rows={services}
          rowKey={(s: Service) => s.Id || ""}
          accentColor="teal"
          columns={[
            {
              key: "id",
              header: "ID",
              render: (s: Service) => <Badge variant="mono">{s.Id || "—"}</Badge>,
            },
            {
              key: "name",
              header: "Name",
              render: (s: Service) => <span className="font-medium text-text-primary">{s.Name || "—"}</span>,
            },
            {
              key: "namespaceId",
              header: "Namespace ID",
              render: (s: Service) => <Badge variant="mono">{s.NamespaceId || "—"}</Badge>,
            },
          ]}
        />
      )}

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Namespace">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Namespace Name"
            placeholder="my-namespace"
            value={namespaceName}
            onChange={(e) => setNamespaceName(e.target.value)}
            required
            autoFocus
            accentColor="teal"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} variant={token.buttonVariant}>
              Create Namespace
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}

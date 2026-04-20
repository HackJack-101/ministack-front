import { useState } from "react";
import { Network, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useApiGatewayV1 } from "../hooks/useApiGatewayV1";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { serviceTokens } from "../design-system/serviceTokens";
import type { RestApi } from "@aws-sdk/client-api-gateway";

export default function APIGatewayV1() {
  const { restApis, loading, createRestApi, deleteRestApi, refresh } = useApiGatewayV1();
  const token = serviceTokens.apiGatewayV1;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [apiName, setApiName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiName.trim()) return;
    setIsCreating(true);
    await createRestApi(apiName);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setApiName("");
  };

  const handleDelete = (api: RestApi) => {
    confirm({
      title: `Delete REST API "${api.name}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteRestApi(api.id!),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Gateway v1"
        subtitle="REST APIs"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant={token.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create REST API
            </Button>
          </>
        }
      />

      {loading && restApis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-violet-600" />
          <p className="mt-4 text-text-muted">Loading REST APIs...</p>
        </div>
      ) : restApis.length === 0 ? (
        <EmptyState
          title="No REST APIs"
          description="Create a REST API to get started."
          icon={Network}
          action={
            <Button variant={token.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create REST API
            </Button>
          }
        />
      ) : (
        <DataTable
          rows={restApis}
          rowKey={(a: RestApi) => a.id || ""}
          accentColor="indigo"
          columns={[
            {
              key: "id",
              header: "ID",
              render: (a: RestApi) => <Badge variant="mono">{a.id || "—"}</Badge>,
            },
            {
              key: "name",
              header: "Name",
              render: (a: RestApi) => <span className="font-medium text-text-primary">{a.name || "—"}</span>,
            },
            {
              key: "createdDate",
              header: "Created",
              render: (a: RestApi) => (
                <span className="text-sm text-text-secondary">
                  {a.createdDate ? new Date(a.createdDate).toLocaleDateString() : "—"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (a: RestApi) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(a)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ),
            },
          ]}
        />
      )}

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create REST API">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="API Name"
            placeholder="my-rest-api"
            value={apiName}
            onChange={(e) => setApiName(e.target.value)}
            required
            autoFocus
            accentColor="indigo"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} variant={token.buttonVariant}>
              Create REST API
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}

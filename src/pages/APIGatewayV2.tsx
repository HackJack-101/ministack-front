import { useState } from "react";
import { Globe2, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useApiGatewayV2 } from "../hooks/useApiGatewayV2";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { serviceTokens } from "../design-system/serviceTokens";
import type { Api } from "@aws-sdk/client-apigatewayv2";

export default function APIGatewayV2() {
  const { apis, loading, createApi, deleteApi, refresh } = useApiGatewayV2();
  const token = serviceTokens.apiGatewayV2;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [apiName, setApiName] = useState("");
  const [protocolType, setProtocolType] = useState("HTTP");
  const [isCreating, setIsCreating] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiName.trim()) return;
    setIsCreating(true);
    await createApi(apiName, protocolType);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setApiName("");
    setProtocolType("HTTP");
  };

  const handleDelete = (api: Api) => {
    confirm({
      title: `Delete API "${api.Name}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteApi(api.ApiId!),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Gateway v2"
        subtitle="HTTP APIs"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant={token.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create API
            </Button>
          </>
        }
      />

      {loading && apis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-violet-500" />
          <p className="mt-4 text-text-muted">Loading APIs...</p>
        </div>
      ) : apis.length === 0 ? (
        <EmptyState
          title="No APIs"
          description="Create an HTTP or WebSocket API to get started."
          icon={Globe2}
          action={
            <Button variant={token.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create API
            </Button>
          }
        />
      ) : (
        <DataTable
          rows={apis}
          rowKey={(a: Api) => a.ApiId || ""}
          accentColor="indigo"
          columns={[
            {
              key: "apiId",
              header: "API ID",
              render: (a: Api) => <Badge variant="mono">{a.ApiId || "—"}</Badge>,
            },
            {
              key: "name",
              header: "Name",
              render: (a: Api) => <span className="font-medium text-text-primary">{a.Name || "—"}</span>,
            },
            {
              key: "protocolType",
              header: "Protocol",
              render: (a: Api) => <Badge variant="purple">{a.ProtocolType || "—"}</Badge>,
            },
            {
              key: "endpoint",
              header: "Endpoint",
              render: (a: Api) => <span className="font-mono text-xs text-text-muted">{a.ApiEndpoint || "—"}</span>,
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (a: Api) => (
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

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create API">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="API Name"
            placeholder="my-http-api"
            value={apiName}
            onChange={(e) => setApiName(e.target.value)}
            required
            autoFocus
            accentColor="indigo"
          />
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5 block mb-1.5">
              Protocol Type
            </label>
            <select
              value={protocolType}
              onChange={(e) => setProtocolType(e.target.value)}
              className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-sm text-text-primary"
            >
              <option value="HTTP">HTTP</option>
              <option value="WEBSOCKET">WEBSOCKET</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} variant={token.buttonVariant}>
              Create API
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}

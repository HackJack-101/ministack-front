import { useState } from "react";
import { Sparkles, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useAppSync } from "../hooks/useAppSync";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { serviceTokens } from "../design-system/serviceTokens";
import { AuthenticationType, type GraphqlApi } from "@aws-sdk/client-appsync";

export default function AppSync() {
  const { apis, loading, createApi, deleteApi, refresh } = useAppSync();
  const token = serviceTokens.appsync;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [apiName, setApiName] = useState("");
  const [authType, setAuthType] = useState<AuthenticationType>(AuthenticationType.API_KEY);
  const [isCreating, setIsCreating] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiName.trim()) return;
    setIsCreating(true);
    await createApi(apiName, authType);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setApiName("");
    setAuthType(AuthenticationType.API_KEY);
  };

  const handleDelete = (api: GraphqlApi) => {
    confirm({
      title: `Delete GraphQL API "${api.name}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteApi(api.apiId!),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AppSync"
        subtitle="GraphQL APIs"
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
          <Spinner size="lg" color="text-purple-400" />
          <p className="mt-4 text-text-muted">Loading GraphQL APIs...</p>
        </div>
      ) : apis.length === 0 ? (
        <EmptyState
          title="No GraphQL APIs"
          description="Create an AppSync GraphQL API to get started."
          icon={Sparkles}
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
          rowKey={(a: GraphqlApi) => a.apiId || ""}
          accentColor="indigo"
          columns={[
            {
              key: "apiId",
              header: "API ID",
              render: (a: GraphqlApi) => <Badge variant="mono">{a.apiId || "—"}</Badge>,
            },
            {
              key: "name",
              header: "Name",
              render: (a: GraphqlApi) => <span className="font-medium text-text-primary">{a.name || "—"}</span>,
            },
            {
              key: "authType",
              header: "Auth Type",
              render: (a: GraphqlApi) => <Badge variant="purple">{a.authenticationType || "—"}</Badge>,
            },
            {
              key: "uris",
              header: "Endpoints",
              render: (a: GraphqlApi) => (
                <span className="text-xs text-text-muted font-mono">
                  {a.uris ? Object.keys(a.uris).join(", ") : "—"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (a: GraphqlApi) => (
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

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create GraphQL API">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="API Name"
            placeholder="my-graphql-api"
            value={apiName}
            onChange={(e) => setApiName(e.target.value)}
            required
            autoFocus
            accentColor="indigo"
          />
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5 block mb-1.5">
              Authentication Type
            </label>
            <select
              value={authType}
              onChange={(e) => setAuthType(e.target.value as AuthenticationType)}
              className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-sm text-text-primary"
            >
              <option value={AuthenticationType.API_KEY}>API_KEY</option>
              <option value={AuthenticationType.AWS_IAM}>AWS_IAM</option>
              <option value={AuthenticationType.AMAZON_COGNITO_USER_POOLS}>AMAZON_COGNITO_USER_POOLS</option>
              <option value={AuthenticationType.OPENID_CONNECT}>OPENID_CONNECT</option>
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

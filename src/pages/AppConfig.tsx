import { useState } from "react";
import { SlidersHorizontal, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useAppConfig } from "../hooks/useAppConfig";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { serviceTokens } from "../design-system/serviceTokens";
import type { Application, Environment } from "@aws-sdk/client-appconfig";

export default function AppConfig() {
  const { applications, environments, loading, createApplication, deleteApplication, fetchEnvironments, refresh } =
    useAppConfig();
  const token = serviceTokens.appConfig;
  const [activeTab, setActiveTab] = useState<"applications" | "environments">("applications");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;
    setIsCreating(true);
    await createApplication(appName, appDescription || undefined);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setAppName("");
    setAppDescription("");
  };

  const handleDelete = (app: Application) => {
    confirm({
      title: `Delete application "${app.Name}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteApplication(app.Id!),
    });
  };

  const handleViewEnvironments = async (app: Application) => {
    await fetchEnvironments(app.Id!);
    setActiveTab("environments");
  };

  const getEnvStateBadgeVariant = (state: string | undefined) => {
    if (state === "READY_FOR_DEPLOYMENT") return "success";
    if (state === "DEPLOYING") return "warning";
    if (state === "ROLLED_BACK" || state === "REVERTED") return "error";
    return "default";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AppConfig"
        subtitle="Application configuration"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {activeTab === "applications" && (
              <Button variant={token.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Application
              </Button>
            )}
          </>
        }
      />

      <div className="flex items-center gap-1 border-b border-border-subtle mb-5">
        <button
          onClick={() => setActiveTab("applications")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "applications"
              ? "border-indigo-400 text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Applications
        </button>
        <button
          onClick={() => setActiveTab("environments")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "environments"
              ? "border-indigo-400 text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Environments
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-indigo-400" />
          <p className="mt-4 text-text-muted">Loading...</p>
        </div>
      ) : activeTab === "applications" ? (
        applications.length === 0 ? (
          <EmptyState
            title="No Applications"
            description="Create an AppConfig application to manage configurations."
            icon={SlidersHorizontal}
            action={
              <Button variant={token.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Application
              </Button>
            }
          />
        ) : (
          <DataTable
            rows={applications}
            rowKey={(a: Application) => a.Id || ""}
            accentColor="indigo"
            columns={[
              {
                key: "id",
                header: "ID",
                render: (a: Application) => <Badge variant="mono">{a.Id || "—"}</Badge>,
              },
              {
                key: "name",
                header: "Name",
                render: (a: Application) => <span className="font-medium text-text-primary">{a.Name || "—"}</span>,
              },
              {
                key: "description",
                header: "Description",
                render: (a: Application) => <span className="text-sm text-text-secondary">{a.Description || "—"}</span>,
              },
              {
                key: "actions",
                header: "",
                className: "text-right",
                render: (a: Application) => (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewEnvironments(a)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400"
                      title="View Environments"
                    >
                      Environments
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(a)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        )
      ) : environments.length === 0 ? (
        <EmptyState
          title="No Environments"
          description="Select an application to view its environments."
          icon={SlidersHorizontal}
        />
      ) : (
        <DataTable
          rows={environments}
          rowKey={(e: Environment) => e.Id || ""}
          accentColor="indigo"
          columns={[
            {
              key: "id",
              header: "ID",
              render: (e: Environment) => <Badge variant="mono">{e.Id || "—"}</Badge>,
            },
            {
              key: "name",
              header: "Name",
              render: (e: Environment) => <span className="font-medium text-text-primary">{e.Name || "—"}</span>,
            },
            {
              key: "appId",
              header: "Application ID",
              render: (e: Environment) => <Badge variant="mono">{e.ApplicationId || "—"}</Badge>,
            },
            {
              key: "state",
              header: "State",
              render: (e: Environment) => <Badge variant={getEnvStateBadgeVariant(e.State)}>{e.State || "—"}</Badge>,
            },
          ]}
        />
      )}

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Application">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Application Name"
            placeholder="my-app"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            required
            autoFocus
            accentColor="indigo"
          />
          <Input
            label="Description"
            placeholder="Optional description"
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            accentColor="indigo"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} variant={token.buttonVariant}>
              Create Application
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}

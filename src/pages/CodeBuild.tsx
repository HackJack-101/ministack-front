import { useState } from "react";
import { Hammer, RefreshCw, Trash2, Play, Info } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useCodeBuild } from "../hooks/useCodeBuild";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { Project, Build } from "@aws-sdk/client-codebuild";

export default function CodeBuild() {
  const { projects, builds, loading, deleteProject, startBuild, fetchBuildsForProject, refresh } = useCodeBuild();
  const [activeTab, setActiveTab] = useState<"projects" | "builds">("projects");
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleDelete = (project: Project) => {
    confirm({
      title: `Delete project "${project.name}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteProject(project.name!),
    });
  };

  const handleStartBuild = (project: Project) => {
    startBuild(project.name!);
  };

  const handleViewBuilds = async (project: Project) => {
    await fetchBuildsForProject(project.name!);
    setActiveTab("builds");
  };

  const getBuildStatusVariant = (status: string | undefined) => {
    if (status === "SUCCEEDED") return "success";
    if (status === "FAILED" || status === "FAULT" || status === "TIMED_OUT") return "error";
    if (status === "IN_PROGRESS") return "warning";
    return "default";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CodeBuild"
        subtitle="Build projects"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-1 border-b border-border-subtle mb-5">
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "projects"
              ? "border-emerald-500 text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab("builds")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "builds"
              ? "border-emerald-500 text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Builds
        </button>
      </div>

      {loading && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-emerald-500" />
          <p className="mt-4 text-text-muted">Loading projects...</p>
        </div>
      ) : activeTab === "projects" ? (
        <>
          <div className="flex items-start gap-2 p-3 bg-surface-elevated border border-border-default rounded-card text-xs text-text-muted">
            <Info className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
            <span>Use the AWS CLI or SDK to create CodeBuild projects with full configuration options.</span>
          </div>
          {projects.length === 0 ? (
            <EmptyState title="No Projects" description="No CodeBuild projects found." icon={Hammer} />
          ) : (
            <DataTable
              rows={projects}
              rowKey={(p: Project) => p.arn || p.name || ""}
              accentColor="emerald"
              columns={[
                {
                  key: "name",
                  header: "Name",
                  render: (p: Project) => <span className="font-medium text-text-primary">{p.name || "—"}</span>,
                },
                {
                  key: "arn",
                  header: "ARN",
                  render: (p: Project) => <span className="font-mono text-xs text-text-muted">{p.arn || "—"}</span>,
                },
                {
                  key: "serviceRole",
                  header: "Service Role",
                  render: (p: Project) => <span className="text-xs text-text-muted">{p.serviceRole || "—"}</span>,
                },
                {
                  key: "actions",
                  header: "",
                  className: "text-right",
                  render: (p: Project) => (
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewBuilds(p)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="View Builds"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartBuild(p)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500"
                        title="Start Build"
                      >
                        Start Build
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(p)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </>
      ) : builds.length === 0 ? (
        <EmptyState
          title="No Builds"
          description="Select a project and click 'Start Build' or view builds."
          icon={Hammer}
        />
      ) : (
        <DataTable
          rows={builds}
          rowKey={(b: Build) => b.id || ""}
          accentColor="emerald"
          columns={[
            {
              key: "id",
              header: "Build ID",
              render: (b: Build) => <Badge variant="mono">{b.id || "—"}</Badge>,
            },
            {
              key: "project",
              header: "Project",
              render: (b: Build) => <span className="text-sm text-text-secondary">{b.projectName || "—"}</span>,
            },
            {
              key: "status",
              header: "Status",
              render: (b: Build) => (
                <Badge variant={getBuildStatusVariant(b.buildStatus)}>{b.buildStatus || "—"}</Badge>
              ),
            },
            {
              key: "startTime",
              header: "Started",
              render: (b: Build) => (
                <span className="text-sm text-text-secondary">
                  {b.startTime ? new Date(b.startTime).toLocaleString() : "—"}
                </span>
              ),
            },
          ]}
        />
      )}

      {ConfirmModalComponent}
    </div>
  );
}

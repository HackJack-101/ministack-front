import { useState } from "react";
import { Search, RefreshCw, Trash2, Square, Play } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useAthena } from "../hooks/useAthena";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { QueryExecution, WorkGroupSummary } from "@aws-sdk/client-athena";

type Tab = "editor" | "executions" | "workgroups";

const EXECUTION_STATE_VARIANT = (state: string | undefined) => {
  if (state === "SUCCEEDED") return "success";
  if (state === "FAILED" || state === "CANCELLED") return "error";
  if (state === "RUNNING" || state === "QUEUED") return "warning";
  return "default";
};

export default function Athena() {
  const { executions, workgroups, loading, startQuery, stopQuery, deleteWorkgroup, refresh } = useAthena();
  const [activeTab, setActiveTab] = useState<Tab>("editor");
  const [sql, setSql] = useState("SELECT 1 AS answer");
  const [workgroup, setWorkgroup] = useState("primary");
  const [running, setRunning] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleRunQuery = async () => {
    setRunning(true);
    try {
      await startQuery(sql, workgroup);
      setActiveTab("executions");
    } finally {
      setRunning(false);
    }
  };

  const handleStopQuery = (ex: QueryExecution) => {
    confirm({
      title: "Stop this query?",
      description: "The query execution will be cancelled.",
      confirmVariant: "warning",
      action: () => stopQuery(ex.QueryExecutionId!),
    });
  };

  const handleDeleteWorkgroup = (wg: WorkGroupSummary) => {
    confirm({
      title: `Delete workgroup "${wg.Name}"?`,
      description: "All query history in this workgroup will be deleted.",
      confirmVariant: "danger",
      action: () => deleteWorkgroup(wg.Name!),
    });
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "editor", label: "Query Editor" },
    { key: "executions", label: `Executions${executions.length > 0 ? ` (${executions.length})` : ""}` },
    { key: "workgroups", label: `Workgroups${workgroups.length > 0 ? ` (${workgroups.length})` : ""}` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Athena"
        subtitle="SQL query engine — run queries against your data catalog"
        actions={
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        }
      />

      <div className="flex items-center gap-1 border-b border-border-subtle mb-5">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === key
                ? "border-cyan-700 text-text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && executions.length === 0 && activeTab !== "editor" ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-cyan-700" />
          <p className="mt-4 text-text-muted">Loading Athena resources...</p>
        </div>
      ) : (
        <>
          {activeTab === "editor" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium">Workgroup</label>
                <select
                  value={workgroup}
                  onChange={(e) => setWorkgroup(e.target.value)}
                  className="bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-cyan-700/60"
                >
                  <option value="primary">primary</option>
                  {workgroups.map((wg) =>
                    wg.Name && wg.Name !== "primary" ? (
                      <option key={wg.Name} value={wg.Name}>
                        {wg.Name}
                      </option>
                    ) : null,
                  )}
                </select>
              </div>
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                rows={8}
                className="w-full bg-surface-input border border-border-default rounded-card px-4 py-3 font-mono text-sm text-text-primary focus:outline-none focus:border-cyan-700/60 resize-y"
                placeholder="SELECT * FROM my_table LIMIT 10"
              />
              <div className="flex justify-end">
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={handleRunQuery}
                  isLoading={running}
                  disabled={!sql.trim() || running}
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Run Query
                </Button>
              </div>
            </div>
          )}

          {activeTab === "executions" &&
            (executions.length === 0 ? (
              <EmptyState
                title="No Query Executions"
                description="Run a query from the Query Editor to see executions here."
                icon={Search}
              />
            ) : (
              <DataTable
                rows={executions}
                rowKey={(ex: QueryExecution) => ex.QueryExecutionId || ""}
                accentColor="cyan"
                columns={[
                  {
                    key: "id",
                    header: "Execution ID",
                    render: (ex: QueryExecution) => (
                      <Badge variant="mono">{ex.QueryExecutionId?.slice(0, 8) || "—"}…</Badge>
                    ),
                  },
                  {
                    key: "query",
                    header: "Query",
                    render: (ex: QueryExecution) => (
                      <span className="font-mono text-xs text-text-secondary truncate max-w-xs block">
                        {ex.Query?.slice(0, 80) || "—"}
                      </span>
                    ),
                  },
                  {
                    key: "state",
                    header: "State",
                    render: (ex: QueryExecution) => (
                      <Badge variant={EXECUTION_STATE_VARIANT(ex.Status?.State)}>{ex.Status?.State || "—"}</Badge>
                    ),
                  },
                  {
                    key: "workgroup",
                    header: "Workgroup",
                    render: (ex: QueryExecution) => (
                      <span className="text-sm text-text-secondary">{ex.WorkGroup || "—"}</span>
                    ),
                  },
                  {
                    key: "submitted",
                    header: "Submitted",
                    render: (ex: QueryExecution) => (
                      <span className="text-sm text-text-secondary">
                        {ex.Status?.SubmissionDateTime ? new Date(ex.Status.SubmissionDateTime).toLocaleString() : "—"}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (ex: QueryExecution) =>
                      ex.Status?.State === "RUNNING" || ex.Status?.State === "QUEUED" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStopQuery(ex)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                          title="Stop Query"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </Button>
                      ) : null,
                  },
                ]}
              />
            ))}

          {activeTab === "workgroups" &&
            (workgroups.length === 0 ? (
              <EmptyState title="No Workgroups" description="No Athena workgroups found." icon={Search} />
            ) : (
              <DataTable
                rows={workgroups}
                rowKey={(wg: WorkGroupSummary) => wg.Name || ""}
                accentColor="cyan"
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    render: (wg: WorkGroupSummary) => (
                      <span className="font-medium text-text-primary">{wg.Name || "—"}</span>
                    ),
                  },
                  {
                    key: "state",
                    header: "State",
                    render: (wg: WorkGroupSummary) => (
                      <Badge variant={wg.State === "ENABLED" ? "success" : "error"}>{wg.State || "—"}</Badge>
                    ),
                  },
                  {
                    key: "description",
                    header: "Description",
                    render: (wg: WorkGroupSummary) => (
                      <span className="text-sm text-text-secondary">{wg.Description || "—"}</span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (wg: WorkGroupSummary) =>
                      wg.Name !== "primary" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWorkgroup(wg)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      ) : null,
                  },
                ]}
              />
            ))}
        </>
      )}

      {ConfirmModalComponent}
    </div>
  );
}

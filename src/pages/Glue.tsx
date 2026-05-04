import { useState } from "react";
import { Combine, RefreshCw, Trash2, Play, Info } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useGlue } from "../hooks/useGlue";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { Database, Table, Crawler, Job } from "@aws-sdk/client-glue";

type Tab = "databases" | "tables" | "crawlers" | "jobs";

const CRAWLER_STATE_VARIANT = (state: string | undefined) => {
  if (state === "READY") return "success";
  if (state === "RUNNING") return "warning";
  if (state === "STOPPING") return "warning";
  return "default";
};

export default function Glue() {
  const {
    databases,
    tables,
    crawlers,
    jobs,
    loading,
    startCrawler,
    deleteDatabase,
    deleteCrawler,
    deleteJob,
    refresh,
  } = useGlue();
  const [activeTab, setActiveTab] = useState<Tab>("databases");
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleDeleteDatabase = (db: Database) => {
    confirm({
      title: `Delete database "${db.Name}"?`,
      description: "All tables in this database will also be deleted. This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteDatabase(db.Name!),
    });
  };

  const handleDeleteCrawler = (crawler: Crawler) => {
    confirm({
      title: `Delete crawler "${crawler.Name}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteCrawler(crawler.Name!),
    });
  };

  const handleDeleteJob = (job: Job) => {
    confirm({
      title: `Delete job "${job.Name}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteJob(job.Name!),
    });
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "databases", label: "Databases", count: databases.length },
    { key: "tables", label: "Tables", count: tables.length },
    { key: "crawlers", label: "Crawlers", count: crawlers.length },
    { key: "jobs", label: "Jobs", count: jobs.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Glue"
        subtitle="Data catalog — databases, tables, crawlers, and ETL jobs"
        actions={
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        }
      />

      <div className="flex items-center gap-1 border-b border-border-subtle mb-5">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === key
                ? "border-teal-700 text-text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {label}
            {count > 0 && (
              <span className="ml-1.5 text-[10px] bg-surface-elevated text-text-muted rounded px-1">{count}</span>
            )}
          </button>
        ))}
      </div>

      {loading && databases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-teal-700" />
          <p className="mt-4 text-text-muted">Loading Glue resources...</p>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2 p-3 bg-surface-elevated border border-border-default rounded-card text-xs text-text-muted">
            <Info className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
            <span>
              Use the AWS CLI or SDK to create Glue databases, crawlers, and jobs with full configuration options.
            </span>
          </div>

          {activeTab === "databases" &&
            (databases.length === 0 ? (
              <EmptyState title="No Databases" description="No Glue databases found." icon={Combine} />
            ) : (
              <DataTable
                rows={databases}
                rowKey={(db: Database) => db.Name || ""}
                accentColor="teal"
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    render: (db: Database) => <span className="font-medium text-text-primary">{db.Name || "—"}</span>,
                  },
                  {
                    key: "description",
                    header: "Description",
                    render: (db: Database) => (
                      <span className="text-sm text-text-secondary">{db.Description || "—"}</span>
                    ),
                  },
                  {
                    key: "location",
                    header: "Location URI",
                    render: (db: Database) => (
                      <span className="font-mono text-xs text-text-muted">{db.LocationUri || "—"}</span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (db: Database) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDatabase(db)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    ),
                  },
                ]}
              />
            ))}

          {activeTab === "tables" &&
            (tables.length === 0 ? (
              <EmptyState title="No Tables" description="No Glue tables found." icon={Combine} />
            ) : (
              <DataTable
                rows={tables}
                rowKey={(t: Table) => `${t.DatabaseName}/${t.Name}`}
                accentColor="teal"
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    render: (t: Table) => <span className="font-medium text-text-primary">{t.Name || "—"}</span>,
                  },
                  {
                    key: "database",
                    header: "Database",
                    render: (t: Table) => <Badge variant="teal">{t.DatabaseName || "—"}</Badge>,
                  },
                  {
                    key: "tableType",
                    header: "Type",
                    render: (t: Table) => <span className="text-sm text-text-secondary">{t.TableType || "—"}</span>,
                  },
                  {
                    key: "location",
                    header: "Location",
                    render: (t: Table) => (
                      <span className="font-mono text-xs text-text-muted">{t.StorageDescriptor?.Location || "—"}</span>
                    ),
                  },
                ]}
              />
            ))}

          {activeTab === "crawlers" &&
            (crawlers.length === 0 ? (
              <EmptyState title="No Crawlers" description="No Glue crawlers found." icon={Combine} />
            ) : (
              <DataTable
                rows={crawlers}
                rowKey={(c: Crawler) => c.Name || ""}
                accentColor="teal"
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    render: (c: Crawler) => <span className="font-medium text-text-primary">{c.Name || "—"}</span>,
                  },
                  {
                    key: "state",
                    header: "State",
                    render: (c: Crawler) => <Badge variant={CRAWLER_STATE_VARIANT(c.State)}>{c.State || "—"}</Badge>,
                  },
                  {
                    key: "database",
                    header: "Database",
                    render: (c: Crawler) => (
                      <span className="text-sm text-text-secondary">{c.DatabaseName || "—"}</span>
                    ),
                  },
                  {
                    key: "schedule",
                    header: "Schedule",
                    render: (c: Crawler) => (
                      <span className="text-xs text-text-muted">{c.Schedule?.ScheduleExpression || "On demand"}</span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (c: Crawler) => (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startCrawler(c.Name!)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-700"
                          title="Start Crawler"
                          disabled={c.State === "RUNNING"}
                        >
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCrawler(c)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            ))}

          {activeTab === "jobs" &&
            (jobs.length === 0 ? (
              <EmptyState title="No Jobs" description="No Glue ETL jobs found." icon={Combine} />
            ) : (
              <DataTable
                rows={jobs}
                rowKey={(j: Job) => j.Name || ""}
                accentColor="teal"
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    render: (j: Job) => <span className="font-medium text-text-primary">{j.Name || "—"}</span>,
                  },
                  {
                    key: "type",
                    header: "Type",
                    render: (j: Job) => <span className="text-sm text-text-secondary">{j.Command?.Name || "—"}</span>,
                  },
                  {
                    key: "role",
                    header: "IAM Role",
                    render: (j: Job) => <span className="font-mono text-xs text-text-muted">{j.Role || "—"}</span>,
                  },
                  {
                    key: "workers",
                    header: "Workers",
                    render: (j: Job) => <span className="text-sm text-text-secondary">{j.NumberOfWorkers ?? "—"}</span>,
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (j: Job) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJob(j)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    ),
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

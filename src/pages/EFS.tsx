import { useState } from "react";
import { Folder, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useEFS } from "../hooks/useEFS";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { FileSystemDescription, AccessPointDescription } from "@aws-sdk/client-efs";

type Tab = "filesystems" | "accesspoints";

const LIFECYCLE_VARIANT = (state: string | undefined) => {
  if (state === "available") return "success";
  if (state === "creating" || state === "updating") return "warning";
  if (state === "deleting" || state === "deleted") return "error";
  return "default";
};

export default function EFS() {
  const { fileSystems, accessPoints, loading, deleteFileSystem, deleteAccessPoint, refresh } = useEFS();
  const [activeTab, setActiveTab] = useState<Tab>("filesystems");
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleDeleteFileSystem = (fs: FileSystemDescription) => {
    confirm({
      title: `Delete file system "${fs.FileSystemId}"?`,
      description: "All mount targets must be deleted first. This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteFileSystem(fs.FileSystemId!),
    });
  };

  const handleDeleteAccessPoint = (ap: AccessPointDescription) => {
    confirm({
      title: `Delete access point "${ap.AccessPointId}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteAccessPoint(ap.AccessPointId!),
    });
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "filesystems", label: "File Systems", count: fileSystems.length },
    { key: "accesspoints", label: "Access Points", count: accessPoints.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="EFS"
        subtitle="Elastic File System — scalable network file storage"
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
                ? "border-violet-500 text-text-primary"
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

      {loading && fileSystems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-violet-500" />
          <p className="mt-4 text-text-muted">Loading EFS resources...</p>
        </div>
      ) : (
        <>
          {activeTab === "filesystems" &&
            (fileSystems.length === 0 ? (
              <EmptyState
                title="No File Systems"
                description="No EFS file systems found. Use the AWS CLI to create one."
                icon={Folder}
              />
            ) : (
              <DataTable
                rows={fileSystems}
                rowKey={(fs: FileSystemDescription) => fs.FileSystemId || ""}
                accentColor="indigo"
                columns={[
                  {
                    key: "id",
                    header: "File System ID",
                    render: (fs: FileSystemDescription) => <Badge variant="mono">{fs.FileSystemId || "—"}</Badge>,
                  },
                  {
                    key: "name",
                    header: "Name",
                    render: (fs: FileSystemDescription) => (
                      <span className="font-medium text-text-primary">
                        {fs.Name || fs.Tags?.find((t) => t.Key === "Name")?.Value || "—"}
                      </span>
                    ),
                  },
                  {
                    key: "state",
                    header: "State",
                    render: (fs: FileSystemDescription) => (
                      <Badge variant={LIFECYCLE_VARIANT(fs.LifeCycleState)}>{fs.LifeCycleState || "—"}</Badge>
                    ),
                  },
                  {
                    key: "throughput",
                    header: "Throughput Mode",
                    render: (fs: FileSystemDescription) => (
                      <span className="text-sm text-text-secondary">{fs.ThroughputMode || "—"}</span>
                    ),
                  },
                  {
                    key: "size",
                    header: "Size (bytes)",
                    render: (fs: FileSystemDescription) => (
                      <span className="text-sm text-text-secondary font-mono">
                        {fs.SizeInBytes?.Value?.toString() ?? "—"}
                      </span>
                    ),
                  },
                  {
                    key: "mountTargets",
                    header: "Mount Targets",
                    render: (fs: FileSystemDescription) => (
                      <span className="text-sm text-text-secondary">{fs.NumberOfMountTargets ?? "—"}</span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (fs: FileSystemDescription) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFileSystem(fs)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    ),
                  },
                ]}
              />
            ))}

          {activeTab === "accesspoints" &&
            (accessPoints.length === 0 ? (
              <EmptyState
                title="No Access Points"
                description="No EFS access points found. Use the AWS CLI to create one."
                icon={Folder}
              />
            ) : (
              <DataTable
                rows={accessPoints}
                rowKey={(ap: AccessPointDescription) => ap.AccessPointId || ""}
                accentColor="indigo"
                columns={[
                  {
                    key: "id",
                    header: "Access Point ID",
                    render: (ap: AccessPointDescription) => <Badge variant="mono">{ap.AccessPointId || "—"}</Badge>,
                  },
                  {
                    key: "name",
                    header: "Name",
                    render: (ap: AccessPointDescription) => (
                      <span className="font-medium text-text-primary">
                        {ap.Name || ap.Tags?.find((t) => t.Key === "Name")?.Value || "—"}
                      </span>
                    ),
                  },
                  {
                    key: "filesystem",
                    header: "File System",
                    render: (ap: AccessPointDescription) => <Badge variant="indigo">{ap.FileSystemId || "—"}</Badge>,
                  },
                  {
                    key: "state",
                    header: "State",
                    render: (ap: AccessPointDescription) => (
                      <Badge variant={LIFECYCLE_VARIANT(ap.LifeCycleState)}>{ap.LifeCycleState || "—"}</Badge>
                    ),
                  },
                  {
                    key: "path",
                    header: "Root Path",
                    render: (ap: AccessPointDescription) => (
                      <span className="font-mono text-xs text-text-muted">{ap.RootDirectory?.Path || "/"}</span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (ap: AccessPointDescription) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccessPoint(ap)}
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

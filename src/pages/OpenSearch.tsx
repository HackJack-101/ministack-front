import { SearchCode, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useOpenSearch } from "../hooks/useOpenSearch";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { DomainStatus } from "@aws-sdk/client-opensearch";

const DOMAIN_STATUS_VARIANT = (
  processing: boolean | undefined,
  created: boolean | undefined,
  deleted: boolean | undefined,
) => {
  if (deleted) return "error";
  if (processing) return "warning";
  if (created) return "success";
  return "default";
};

const DOMAIN_STATUS_LABEL = (
  processing: boolean | undefined,
  created: boolean | undefined,
  deleted: boolean | undefined,
) => {
  if (deleted) return "DELETING";
  if (processing) return "PROCESSING";
  if (created) return "ACTIVE";
  return "UNKNOWN";
};

export default function OpenSearch() {
  const { domains, loading, deleteDomain, refresh } = useOpenSearch();
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleDelete = (domain: DomainStatus) => {
    confirm({
      title: `Delete domain "${domain.DomainName}"?`,
      description: "All data in this OpenSearch domain will be permanently lost.",
      confirmVariant: "danger",
      action: () => deleteDomain(domain.DomainName!),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="OpenSearch"
        subtitle="Managed OpenSearch and Elasticsearch service"
        actions={
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        }
      />

      {loading && domains.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-blue-700" />
          <p className="mt-4 text-text-muted">Loading OpenSearch domains...</p>
        </div>
      ) : domains.length === 0 ? (
        <EmptyState
          title="No Domains"
          description="No OpenSearch domains found. Use the AWS CLI or SDK to create one."
          icon={SearchCode}
        />
      ) : (
        <DataTable
          rows={domains}
          rowKey={(d: DomainStatus) => d.DomainId || d.DomainName || ""}
          accentColor="blue"
          columns={[
            {
              key: "name",
              header: "Domain Name",
              render: (d: DomainStatus) => <span className="font-medium text-text-primary">{d.DomainName || "—"}</span>,
            },
            {
              key: "status",
              header: "Status",
              render: (d: DomainStatus) => (
                <Badge variant={DOMAIN_STATUS_VARIANT(d.Processing, d.Created, d.Deleted)}>
                  {DOMAIN_STATUS_LABEL(d.Processing, d.Created, d.Deleted)}
                </Badge>
              ),
            },
            {
              key: "engineVersion",
              header: "Engine Version",
              render: (d: DomainStatus) => (
                <span className="text-sm text-text-secondary">{d.EngineVersion || "—"}</span>
              ),
            },
            {
              key: "endpoint",
              header: "Endpoint",
              render: (d: DomainStatus) => (
                <span className="font-mono text-xs text-text-muted">{d.Endpoint || "—"}</span>
              ),
            },
            {
              key: "instanceType",
              header: "Instance Type",
              render: (d: DomainStatus) => (
                <span className="text-sm text-text-secondary">{d.ClusterConfig?.InstanceType || "—"}</span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (d: DomainStatus) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(d)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </Button>
              ),
            },
          ]}
        />
      )}

      {ConfirmModalComponent}
    </div>
  );
}

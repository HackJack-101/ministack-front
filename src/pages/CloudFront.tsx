import { useState } from "react";
import { Cloud, RefreshCw, Trash2, RotateCcw } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useCloudFront } from "../hooks/useCloudFront";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { serviceTokens } from "../design-system/serviceTokens";
import type { DistributionSummary } from "@aws-sdk/client-cloudfront";

export default function CloudFront() {
  const { distributions, loading, deleteDistribution, createInvalidation, refresh } = useCloudFront();
  const token = serviceTokens.cloudfront;
  const [invalidationModal, setInvalidationModal] = useState<{ open: boolean; distributionId: string }>({
    open: false,
    distributionId: "",
  });
  const [paths, setPaths] = useState("/*");
  const [isInvalidating, setIsInvalidating] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleDelete = (dist: DistributionSummary) => {
    confirm({
      title: `Delete distribution "${dist.Id}"?`,
      description: "The distribution must be disabled before deletion.",
      confirmVariant: "danger",
      action: () => deleteDistribution(dist.Id!, dist.ETag || ""),
    });
  };

  const handleInvalidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInvalidating(true);
    const pathList = paths
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    await createInvalidation(invalidationModal.distributionId, pathList);
    setIsInvalidating(false);
    setInvalidationModal({ open: false, distributionId: "" });
    setPaths("/*");
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    if (status === "Deployed") return "success";
    if (status === "InProgress") return "warning";
    return "default";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CloudFront"
        subtitle="Content delivery distributions"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </>
        }
      />

      {loading && distributions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-sky-600" />
          <p className="mt-4 text-text-muted">Loading distributions...</p>
        </div>
      ) : distributions.length === 0 ? (
        <EmptyState title="No Distributions" description="No CloudFront distributions found." icon={Cloud} />
      ) : (
        <DataTable
          rows={distributions}
          rowKey={(d: DistributionSummary) => d.Id || ""}
          accentColor="sky"
          columns={[
            {
              key: "id",
              header: "ID",
              render: (d: DistributionSummary) => (
                <span className="font-mono text-xs text-text-primary">{d.Id || "—"}</span>
              ),
            },
            {
              key: "domain",
              header: "Domain Name",
              render: (d: DistributionSummary) => (
                <span className="text-sm text-text-secondary">{d.DomainName || "—"}</span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (d: DistributionSummary) => (
                <Badge variant={getStatusBadgeVariant(d.Status)}>{d.Status || "—"}</Badge>
              ),
            },
            {
              key: "origins",
              header: "Origins",
              render: (d: DistributionSummary) => (
                <span className="text-sm text-text-secondary">{d.Origins?.Quantity ?? 0}</span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (d: DistributionSummary) => (
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInvalidationModal({ open: true, distributionId: d.Id! })}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Create Invalidation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(d)}
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

      <Modal
        open={invalidationModal.open}
        onClose={() => setInvalidationModal({ open: false, distributionId: "" })}
        title="Create Invalidation"
      >
        <form onSubmit={handleInvalidate} className="space-y-4">
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5 block mb-1.5">
              Paths (one per line)
            </label>
            <textarea
              value={paths}
              onChange={(e) => setPaths(e.target.value)}
              rows={4}
              className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-sm text-text-primary font-mono resize-none"
              placeholder="/*"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setInvalidationModal({ open: false, distributionId: "" })}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isInvalidating} variant={token.buttonVariant}>
              Create Invalidation
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}

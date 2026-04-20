import { Scale, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useELBv2 } from "../hooks/useELBv2";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { LoadBalancer } from "@aws-sdk/client-elastic-load-balancing-v2";

export default function ELBv2() {
  const { loadBalancers, loading, deleteLoadBalancer, refresh } = useELBv2();
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleDelete = (lb: LoadBalancer) => {
    confirm({
      title: `Delete load balancer "${lb.LoadBalancerName}"?`,
      description: "This action cannot be undone.",
      confirmVariant: "danger",
      action: () => deleteLoadBalancer(lb.LoadBalancerArn!),
    });
  };

  const getStateBadgeVariant = (state: string | undefined) => {
    if (state === "active") return "success";
    if (state === "failed") return "error";
    return "warning";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ELBv2 / ALB"
        subtitle="Elastic Load Balancers"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </>
        }
      />

      {loading && loadBalancers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-green-500" />
          <p className="mt-4 text-text-muted">Loading load balancers...</p>
        </div>
      ) : loadBalancers.length === 0 ? (
        <EmptyState title="No Load Balancers" description="No ELBv2 load balancers found." icon={Scale} />
      ) : (
        <DataTable
          rows={loadBalancers}
          rowKey={(lb: LoadBalancer) => lb.LoadBalancerArn || ""}
          accentColor="teal"
          columns={[
            {
              key: "name",
              header: "Name",
              render: (lb: LoadBalancer) => (
                <span className="font-medium text-text-primary">{lb.LoadBalancerName || "—"}</span>
              ),
            },
            {
              key: "type",
              header: "Type",
              render: (lb: LoadBalancer) => <Badge variant="teal">{lb.Type || "—"}</Badge>,
            },
            {
              key: "state",
              header: "State",
              render: (lb: LoadBalancer) => (
                <Badge variant={getStateBadgeVariant(lb.State?.Code)}>{lb.State?.Code || "—"}</Badge>
              ),
            },
            {
              key: "dnsName",
              header: "DNS Name",
              render: (lb: LoadBalancer) => (
                <span className="font-mono text-xs text-text-muted">{lb.DNSName || "—"}</span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (lb: LoadBalancer) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(lb)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
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

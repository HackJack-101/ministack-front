import { useState } from "react";
import { BadgeCheck, RefreshCw, Plus, Trash2, Globe } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useACM } from "../hooks/useACM";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";

export default function ACM() {
  const { certificates, loading, requestCertificate, deleteCertificate, refresh } = useACM();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [domainName, setDomainName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName.trim()) return;

    setIsCreating(true);
    await requestCertificate(domainName);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setDomainName("");
  };

  const handleDelete = (arn: string, domain: string) => {
    confirm({
      title: "Delete Certificate",
      description: `Are you sure you want to delete certificate for "${domain}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      confirmVariant: "danger",
      action: () => deleteCertificate(arn),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ACM"
        subtitle="Manage SSL/TLS certificates for your domains"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Request Certificate
            </Button>
          </>
        }
      />

      {loading && certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="emerald" />
          <p className="mt-4 text-gray-500">Loading certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <EmptyState
          title="No Certificates"
          description="Request a certificate to secure your custom domains."
          icon={BadgeCheck}
          action={{
            label: "Request Certificate",
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <DataTable
          rows={certificates}
          rowKey={(p) => p.CertificateArn || ""}
          columns={[
            {
              key: "domain",
              header: "Domain Name",
              render: (p: any) => (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-emerald-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{p.DomainName}</span>
                </div>
              ),
            },
            {
              key: "arn",
              header: "Certificate ARN",
              render: (p: any) => (
                <span className="text-xs text-gray-500 break-all max-w-xs block" title={p.CertificateArn}>
                  {p.CertificateArn}
                </span>
              ),
            },
            {
              key: "type",
              header: "Type",
              render: (p: any) => <Badge variant="blue">{p.Type || "AMAZON_ISSUED"}</Badge>,
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (p: any) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(p.CertificateArn!, p.DomainName!)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ),
            },
          ]}
        />
      )}

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Request Certificate">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Domain Name"
            placeholder="example.com or *.example.com"
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} color="emerald">
              Request Certificate
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}

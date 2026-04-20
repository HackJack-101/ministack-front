import { useState } from "react";
import { Package, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useECR } from "../hooks/useECR";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { serviceTokens } from "../design-system/serviceTokens";
import { ImageTagMutability, type Repository } from "@aws-sdk/client-ecr";

export default function ECR() {
  const { repositories, loading, createRepository, deleteRepository, refresh } = useECR();
  const token = serviceTokens.ecr;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [mutability, setMutability] = useState<ImageTagMutability>(ImageTagMutability.MUTABLE);
  const [isCreating, setIsCreating] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoName.trim()) return;
    setIsCreating(true);
    await createRepository(repoName, mutability);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setRepoName("");
    setMutability(ImageTagMutability.MUTABLE);
  };

  const handleDelete = (repo: Repository) => {
    confirm({
      title: `Delete repository "${repo.repositoryName}"?`,
      description: "All images will be permanently removed.",
      confirmVariant: "danger",
      action: () => deleteRepository(repo.repositoryName!),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ECR"
        subtitle="Container image repositories"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant={token.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Repository
            </Button>
          </>
        }
      />

      {loading && repositories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-orange-700" />
          <p className="mt-4 text-text-muted">Loading repositories...</p>
        </div>
      ) : repositories.length === 0 ? (
        <EmptyState
          title="No Repositories"
          description="Create an ECR repository to store container images."
          icon={Package}
          action={
            <Button variant={token.buttonVariant} size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Repository
            </Button>
          }
        />
      ) : (
        <DataTable
          rows={repositories}
          rowKey={(r: Repository) => r.repositoryArn || ""}
          accentColor="orange"
          columns={[
            {
              key: "name",
              header: "Name",
              render: (r: Repository) => (
                <span className="font-medium text-text-primary">{r.repositoryName || "—"}</span>
              ),
            },
            {
              key: "uri",
              header: "URI",
              render: (r: Repository) => (
                <span className="font-mono text-xs text-text-muted truncate max-w-xs block">
                  {r.repositoryUri || "—"}
                </span>
              ),
            },
            {
              key: "mutability",
              header: "Tag Mutability",
              render: (r: Repository) => (
                <Badge variant={r.imageTagMutability === "IMMUTABLE" ? "info" : "default"}>
                  {r.imageTagMutability || "—"}
                </Badge>
              ),
            },
            {
              key: "createdAt",
              header: "Created",
              render: (r: Repository) => (
                <span className="text-sm text-text-secondary">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (r: Repository) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(r)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ),
            },
          ]}
        />
      )}

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Repository">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Repository Name"
            placeholder="my-app"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            required
            autoFocus
            accentColor="orange"
          />
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5 block mb-1.5">
              Image Tag Mutability
            </label>
            <select
              value={mutability}
              onChange={(e) => setMutability(e.target.value as ImageTagMutability)}
              className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-sm text-text-primary"
            >
              <option value={ImageTagMutability.MUTABLE}>MUTABLE</option>
              <option value={ImageTagMutability.IMMUTABLE}>IMMUTABLE</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} variant={token.buttonVariant}>
              Create Repository
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Key, RefreshCw, Plus, Trash2, Power } from "lucide-react";
import { useKMS } from "../hooks/useKMS";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { KeyMetadata } from "@aws-sdk/client-kms";

export const KMS = () => {
  const kms = useKMS();
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyDescription, setNewKeyDescription] = useState("");

  useEffect(() => {
    kms.fetchKeys();
  }, [kms.fetchKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await kms.createKey(newKeyDescription);
    setIsModalOpen(false);
    setNewKeyDescription("");
  };

  const handleToggleStatus = (keyId: string, enabled: boolean) => {
    confirm({
      title: enabled ? "Disable Key?" : "Enable Key?",
      description: `Are you sure you want to ${enabled ? "disable" : "enable"} this KMS key?`,
      action: () => kms.toggleKeyStatus(keyId, enabled),
    });
  };

  const handleDelete = (keyId: string) => {
    confirm({
      title: "Schedule Key Deletion?",
      description: "This will schedule the key for deletion. This action is irreversible after the pending period.",
      action: () => kms.deleteKey(keyId),
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Key Management Service"
        subtitle="Manage cryptographic keys for your applications"
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => kms.fetchKeys()}
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${kms.loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="amber"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Key
            </Button>
          </>
        }
      />

      <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
        <DataTable
          columns={[
            {
              key: "id",
              header: "Key ID",
              render: (k: KeyMetadata) => (
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-semibold text-text-primary">{k.KeyId}</span>
                  <span className="text-[10px] text-text-faint">{k.Arn}</span>
                </div>
              ),
            },
            {
              key: "description",
              header: "Description",
              render: (k: KeyMetadata) => (
                <span className="text-sm text-text-secondary italic">
                  {k.Description || "No description"}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (k: KeyMetadata) => (
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                  k.Enabled 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}>
                  {k.Enabled ? "Enabled" : "Disabled"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (k: KeyMetadata) => (
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(k.KeyId!, k.Enabled!)}
                    title={k.Enabled ? "Disable" : "Enable"}
                  >
                    <Power className={`w-3.5 h-3.5 ${k.Enabled ? "text-emerald-500" : "text-text-muted"}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-text-muted hover:text-red-500"
                    onClick={() => handleDelete(k.KeyId!)}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ),
              className: "w-24",
            },
          ]}
          rows={kms.keys}
          rowKey={(k: KeyMetadata) => k.KeyId || ""}
          loading={kms.loading}
          emptyIcon={Key}
          emptyTitle="No KMS keys"
          emptyDescription="Create a key to start encrypting and decrypting data."
          emptyAction={{ label: "Create Key", onClick: () => setIsModalOpen(true) }}
        />
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create KMS Key">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Input
            label="Description"
            placeholder="e.g. My app encryption key"
            value={newKeyDescription}
            onChange={(e) => setNewKeyDescription(e.target.value)}
            required
            autoFocus
            accentColor="amber"
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="amber">
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
};

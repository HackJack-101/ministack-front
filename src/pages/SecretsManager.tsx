import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { SecretListEntry } from "@aws-sdk/client-secrets-manager";
import {
  ListSecretsCommand,
  CreateSecretCommand,
  DeleteSecretCommand,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { secretsManagerClient } from "../services/awsClients";
import { Plus, RefreshCw, Eye, EyeOff, Lock, Copy, Check, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { Spinner } from "../components/ui/Spinner";
import { CreateSecretModal } from "../components/secrets-manager/CreateSecretModal";

export const SecretsManager = () => {
  const { secretName } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm, ConfirmModalComponent } = useConfirmModal();
  const [secrets, setSecrets] = useState<SecretListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, string>>({});
  const [fetchingValue, setFetchingValue] = useState<Record<string, boolean>>({});
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);

  const fetchSecrets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await secretsManagerClient.send(new ListSecretsCommand({}));
      setSecrets(response.SecretList || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch secrets");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const handleDelete = (name: string) => {
    confirm({
      title: `Delete secret "${name}"?`,
      description: "The secret value will be permanently destroyed and cannot be recovered.",
      action: async () => {
        try {
          await secretsManagerClient.send(
            new DeleteSecretCommand({ SecretId: name, ForceDeleteWithoutRecovery: true }),
          );
          fetchSecrets();
          toast.success(`Secret "${name}" deleted`);
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to delete secret");
        }
      },
    });
  };

  const toggleSecretValue = async (name: string) => {
    if (visibleSecrets[name]) {
      const next = { ...visibleSecrets };
      delete next[name];
      setVisibleSecrets(next);
      return;
    }
    setFetchingValue((prev) => ({ ...prev, [name]: true }));
    try {
      const response = await secretsManagerClient.send(new GetSecretValueCommand({ SecretId: name }));
      setVisibleSecrets((prev) => ({ ...prev, [name]: response.SecretString || "" }));
    } catch (err: unknown) {
      toast.error(`Failed to fetch value for ${name}: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setFetchingValue((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleCopySecret = async (name: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedSecret(name);
      setTimeout(() => setCopiedSecret(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (s: SecretListEntry) => (
        <button
          onClick={() => navigate(`/secrets-manager/${s.Name}`)}
          className="font-medium text-text-primary hover:text-purple-500 transition-colors"
        >
          {s.Name}
        </button>
      ),
    },
    {
      key: "arn",
      header: "ARN",
      render: (s: SecretListEntry) => (
        <code className="text-xs text-purple-500 font-mono">{s.ARN}</code>
      ),
    },
    {
      key: "value",
      header: "Value",
      render: (s: SecretListEntry) => (
        <div className="flex items-center gap-2 min-w-[200px]">
          {fetchingValue[s.Name!] ? (
            <Spinner size="sm" color="text-purple-500" />
          ) : visibleSecrets[s.Name!] ? (
            <span className="bg-surface-elevated border border-border-subtle px-2 py-1 rounded text-xs font-mono break-all line-clamp-2 max-w-xs text-text-primary">
              {visibleSecrets[s.Name!]}
            </span>
          ) : (
            <span className="text-text-faint font-mono tracking-widest text-sm">••••••••</span>
          )}
          <div className="flex items-center gap-1 flex-shrink-0">
            {visibleSecrets[s.Name!] && (
              <button
                onClick={() => handleCopySecret(s.Name!, visibleSecrets[s.Name!])}
                className="p-1 hover:text-purple-500 text-text-faint transition-colors"
                title="Copy value"
                aria-label="Copy secret value"
              >
                {copiedSecret === s.Name ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            <button
              onClick={() => toggleSecretValue(s.Name!)}
              className="p-1 hover:text-purple-500 text-text-faint transition-colors"
              title={visibleSecrets[s.Name!] ? "Hide value" : "Reveal value"}
              aria-label={visibleSecrets[s.Name!] ? "Hide secret value" : "Reveal secret value"}
            >
              {visibleSecrets[s.Name!] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (s: SecretListEntry) => (
        <div className="flex justify-end">
          <button
            onClick={() => handleDelete(s.Name!)}
            className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
            title="Delete secret"
            aria-label="Delete secret"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const filteredSecrets = secretName ? secrets.filter((s) => s.Name === secretName) : secrets;

  useEffect(() => {
    if (secretName && secrets.length > 0) {
      const exists = secrets.some((s) => s.Name === secretName);
      if (exists && !visibleSecrets[secretName] && !fetchingValue[secretName]) {
        toggleSecretValue(secretName);
      }
    }
  }, [secretName, secrets, visibleSecrets, fetchingValue, toggleSecretValue]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Secrets Manager"
        subtitle="Manage application secrets and credentials in your local environment"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={fetchSecrets} title="Refresh" aria-label="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {!secretName && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCreating(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Secret
              </Button>
            )}
          </>
        }
      />

      {secretName && (
        <button
          onClick={() => navigate("/secrets-manager")}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to list
        </button>
      )}

      <CreateSecretModal
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onConfirm={async (name, value) => {
          await secretsManagerClient.send(new CreateSecretCommand({ Name: name, SecretString: value }));
          fetchSecrets();
          toast.success(`Secret "${name}" created successfully`);
        }}
        isLoading={loading}
      />

      <DataTable
        columns={columns}
        rows={filteredSecrets}
        rowKey={(s) => s.ARN ?? s.Name ?? ""}
        loading={loading}
        emptyIcon={Lock}
        emptyTitle="No secrets found"
        emptyDescription="Create a secret to get started."
        emptyAction={{ label: "Create Secret", onClick: () => setIsCreating(true) }}
        accentColor="text-purple-500"
      />

      {ConfirmModalComponent}
    </div>
  );
};

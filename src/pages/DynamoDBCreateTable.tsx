import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Database, Settings } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { useDynamoDB } from "../hooks/useDynamoDB";
import type { NewTableForm } from "../hooks/useDynamoDB";
import { useToast } from "../hooks/useToast";

export const DynamoDBCreateTable = () => {
  const navigate = useNavigate();
  const db = useDynamoDB();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<NewTableForm>({
    name: "",
    partitionKey: "id",
    partitionKeyType: "S",
    sortKey: "",
    sortKeyType: "S",
  });

  const handleCreate = async () => {
    if (!form.name || !form.partitionKey) {
      toast.error("Table name and partition key are required");
      return;
    }

    setLoading(true);
    try {
      await db.createTable(form);
      navigate(`/dynamodb/${form.name}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create table");
    } finally {
      setLoading(false);
    }
  };

  const selectClass =
    "w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-emerald-500/60 transition-colors text-sm disabled:opacity-40";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dynamodb")}
          className="p-2 hover:bg-surface-hover rounded-full transition-colors text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title="Create DynamoDB Table" subtitle="Define your table schema and primary key" />
      </div>

      <div className="bg-surface-card border border-border-default rounded-card shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border-subtle bg-surface-elevated/30">
          <div className="max-w-md">
            <Input
              label="Table Name"
              placeholder="e.g. Users"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              accentColor="emerald"
              autoFocus
              required
            />
          </div>
        </div>

        <div className="p-6 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Primary Key</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-elevated p-6 rounded-xl border border-border-subtle">
              <div className="space-y-4">
                <Input
                  label="Partition Key"
                  placeholder="id"
                  value={form.partitionKey}
                  onChange={(e) => setForm({ ...form, partitionKey: e.target.value })}
                  required
                  accentColor="emerald"
                />
                <div className="space-y-1.5">
                  <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">
                    Key Type
                  </label>
                  <select
                    className={selectClass}
                    value={form.partitionKeyType}
                    onChange={(e) => setForm({ ...form, partitionKeyType: e.target.value as "S" | "N" })}
                  >
                    <option value="S">String</option>
                    <option value="N">Number</option>
                    <option value="B" disabled>
                      Binary (Not supported)
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Sort Key (Optional)"
                  placeholder="timestamp"
                  value={form.sortKey}
                  onChange={(e) => setForm({ ...form, sortKey: e.target.value })}
                  accentColor="emerald"
                />
                <div className="space-y-1.5">
                  <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">
                    Key Type
                  </label>
                  <select
                    className={selectClass}
                    disabled={!form.sortKey}
                    value={form.sortKeyType}
                    onChange={(e) => setForm({ ...form, sortKeyType: e.target.value as "S" | "N" })}
                  >
                    <option value="S">String</option>
                    <option value="N">Number</option>
                  </select>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-text-muted flex items-center gap-1.5 px-1">
              <Database className="w-3 h-3" />
              The partition key is used to distribute data across shards. The sort key is optional and used for data
              organization.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Table Settings</h3>
            </div>
            <div className="bg-surface-elevated p-6 rounded-xl border border-border-subtle opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Provisioned Capacity</h4>
                  <p className="text-xs text-text-muted mt-1">
                    Default: 5 RCU / 5 WCU. Ministack ignores these values in local mode.
                  </p>
                </div>
                <div className="px-3 py-1 bg-surface-card border border-border-default rounded-md text-xs text-text-faint">
                  Local Mode
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-border-subtle bg-surface-elevated/30 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate("/dynamodb")} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="emerald"
            onClick={handleCreate}
            isLoading={loading}
            disabled={!form.name || !form.partitionKey}
          >
            Create Table
          </Button>
        </div>
      </div>
    </div>
  );
};

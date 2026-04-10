import React, { useState, useEffect } from "react";
import { Globe, RefreshCw, Plus, Trash2, Server, Search } from "lucide-react";
import { useRoute53 } from "../hooks/useRoute53";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { HostedZone, ResourceRecordSet } from "@aws-sdk/client-route-53";

export const Route53 = () => {
  const { hostedZones, loading, fetchHostedZones, fetchRecordSets, createHostedZone, deleteHostedZone } = useRoute53();
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const [selectedZone, setSelectedBus] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<ResourceRecordSet[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");

  useEffect(() => {
    fetchHostedZones();
  }, [fetchHostedZones]);

  useEffect(() => {
    const loadRecords = async () => {
      if (selectedZone?.Id) {
        setRecordsLoading(true);
        const fetchedRecords = await fetchRecordSets(selectedZone.Id);
        setRecords(fetchedRecords);
        setRecordsLoading(false);
      }
    };
    loadRecords();
  }, [selectedZone, fetchRecordSets]);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) return;
    await createHostedZone(newZoneName);
    setIsZoneModalOpen(false);
    setNewZoneName("");
  };

  const handleDeleteZone = (zone: HostedZone) => {
    confirm({
      title: "Delete Hosted Zone?",
      description: `Are you sure you want to delete "${zone.Name}"? All record sets will be removed.`,
      action: () => deleteHostedZone(zone.Id!),
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Route 53"
        subtitle="Manage DNS records and health checks"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => fetchHostedZones()} title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="sky"
              size="sm"
              onClick={() => setIsZoneModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Zone
            </Button>
          </>
        }
      />

      <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
        <DataTable
          columns={[
            {
              key: "name",
              header: "Domain Name",
              render: (zone: HostedZone) => (
                <button
                  onClick={() => setSelectedBus(zone)}
                  className={`font-medium transition-colors text-left ${
                    selectedZone?.Id === zone.Id ? "text-sky-500" : "text-text-primary hover:text-sky-500"
                  }`}
                >
                  {zone.Name}
                </button>
              ),
            },
            {
              key: "id",
              header: "ID",
              render: (zone: HostedZone) => <span className="font-mono text-[10px] text-text-faint">{zone.Id}</span>,
            },
            { key: "records", header: "Records", render: (zone: HostedZone) => zone.ResourceRecordSetCount || "-" },
            {
              key: "actions",
              header: "Actions",
              render: (zone: HostedZone) => (
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-text-muted hover:text-red-500"
                    onClick={() => handleDeleteZone(zone)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ),
              className: "w-20",
            },
          ]}
          rows={hostedZones}
          rowKey={(zone: HostedZone) => zone.Id || ""}
          loading={loading}
          emptyIcon={Globe}
          emptyTitle="No hosted zones"
          emptyDescription="Create a hosted zone to manage DNS records for a domain."
          emptyAction={{ label: "Create Zone", onClick: () => setIsZoneModalOpen(true) }}
        />
      </div>

      {selectedZone && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-500" />
              Records for "{selectedZone.Name}"
            </h3>
          </div>

          <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
            <DataTable
              columns={[
                {
                  key: "name",
                  header: "Record Name",
                  render: (r: ResourceRecordSet) => <span className="text-text-primary font-medium">{r.Name}</span>,
                },
                {
                  key: "type",
                  header: "Type",
                  render: (r: ResourceRecordSet) => (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated border border-border-subtle font-bold text-text-muted">
                      {r.Type}
                    </span>
                  ),
                },
                { key: "ttl", header: "TTL", render: (r: ResourceRecordSet) => r.TTL || "-" },
                {
                  key: "value",
                  header: "Value",
                  render: (r: ResourceRecordSet) => (
                    <span className="text-xs text-text-secondary truncate block max-w-[300px]">
                      {r.ResourceRecords?.map((v) => v.Value).join(", ") || r.AliasTarget?.DNSName || "-"}
                    </span>
                  ),
                },
              ]}
              rows={records}
              rowKey={(r: ResourceRecordSet) => `${r.Name}-${r.Type}`}
              loading={recordsLoading}
              emptyIcon={Search}
              emptyTitle="No records found"
              emptyDescription="Add DNS records to this hosted zone."
            />
          </div>
        </div>
      )}

      <Modal open={isZoneModalOpen} onClose={() => setIsZoneModalOpen(false)} title="Create Hosted Zone">
        <form onSubmit={handleCreateZone} className="space-y-4 pt-2">
          <Input
            label="Domain Name"
            placeholder="e.g. example.com"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            required
            autoFocus
            accentColor="blue"
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsZoneModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="sky">
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Zap, RefreshCw, Plus, Trash2, Send, Filter, Activity } from "lucide-react";
import { useEventBridge } from "../hooks/useEventBridge";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { Modal } from "../components/ui/Modal";
import { Input, TextArea } from "../components/ui/Input";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { EventBus, Rule } from "@aws-sdk/client-eventbridge";

export const EventBridge = () => {
  const events = useEventBridge();
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newBusName, setNewBusName] = useState("");
  const [eventForm, setEventForm] = useState({ source: "my.app", detailType: "UserCreated", detail: "{}" });

  useEffect(() => {
    events.fetchEventBuses();
  }, [events]);

  useEffect(() => {
    const loadRules = async () => {
      if (selectedBus) {
        setRulesLoading(true);
        const fetchedRules = await events.fetchRules(selectedBus);
        setRules(fetchedRules);
        setRulesLoading(false);
      }
    };
    loadRules();
  }, [selectedBus, events]);

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusName) return;
    await events.createEventBus(newBusName);
    setIsBusModalOpen(false);
    setNewBusName("");
  };

  const handleSendEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBus) return;
    await events.putEvents(selectedBus, eventForm.source, eventForm.detailType, eventForm.detail);
    setIsEventModalOpen(false);
  };

  const handleDeleteBus = (name: string) => {
    confirm({
      title: "Delete Event Bus?",
      description: `Are you sure you want to delete "${name}"?`,
      action: () => events.deleteEventBus(name),
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="EventBridge"
        subtitle="Manage event buses and rules for event-driven architecture"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => events.fetchEventBuses()} title="Refresh">
              <RefreshCw className={`w-4 h-4 ${events.loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="teal"
              size="sm"
              onClick={() => setIsBusModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Bus
            </Button>
          </>
        }
      />

      <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
        <DataTable
          columns={[
            {
              key: "name",
              header: "Name",
              render: (bus: EventBus) => (
                <button
                  onClick={() => setSelectedBus(bus.Name || null)}
                  className={`font-medium transition-colors text-left ${
                    selectedBus === bus.Name ? "text-teal-500" : "text-text-primary hover:text-teal-500"
                  }`}
                >
                  {bus.Name}
                </button>
              ),
            },
            { key: "state", header: "State", render: () => "Active" },
            {
              key: "actions",
              header: "Actions",
              render: (bus: EventBus) => (
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedBus(bus.Name || null);
                      setIsEventModalOpen(true);
                    }}
                    title="Send Event"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                  {bus.Name !== "default" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-text-muted hover:text-red-500"
                      onClick={() => handleDeleteBus(bus.Name!)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ),
              className: "w-24",
            },
          ]}
          rows={events.eventBuses}
          rowKey={(bus: EventBus) => bus.Name || ""}
          loading={events.loading}
          emptyIcon={Zap}
          emptyTitle="No event buses"
          emptyDescription="Create an event bus to start sending and routing events."
          emptyAction={{ label: "Create Event Bus", onClick: () => setIsBusModalOpen(true) }}
        />
      </div>

      {selectedBus && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Filter className="w-4 h-4 text-teal-500" />
              Rules for "{selectedBus}"
            </h3>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setIsEventModalOpen(true)}
              leftIcon={<Send className="w-3 h-3" />}
            >
              Send Test Event
            </Button>
          </div>

          <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
            <DataTable
              columns={[
                {
                  key: "name",
                  header: "Rule Name",
                  render: (rule: Rule) => <span className="text-text-primary font-medium">{rule.Name}</span>,
                },
                {
                  key: "state",
                  header: "State",
                  render: (rule: Rule) => <span className="capitalize">{rule.State?.toLowerCase()}</span>,
                },
                {
                  key: "pattern",
                  header: "Pattern",
                  render: (rule: Rule) => (
                    <code className="text-[10px] bg-surface-elevated px-1 py-0.5 rounded text-text-muted max-w-[300px] truncate block">
                      {rule.EventPattern}
                    </code>
                  ),
                },
              ]}
              rows={rules}
              rowKey={(rule: Rule) => rule.Name || ""}
              loading={rulesLoading}
              emptyIcon={Activity}
              emptyTitle="No rules"
              emptyDescription={`No rules configured for event bus "${selectedBus}".`}
            />
          </div>
        </div>
      )}

      <Modal open={isBusModalOpen} onClose={() => setIsBusModalOpen(false)} title="Create Event Bus">
        <form onSubmit={handleCreateBus} className="space-y-4 pt-2">
          <Input
            label="Event Bus Name"
            placeholder="e.g. orders-bus"
            value={newBusName}
            onChange={(e) => setNewBusName(e.target.value)}
            required
            autoFocus
            accentColor="emerald"
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsBusModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal">
              Create
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={`Send Event to "${selectedBus}"`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSendEvent} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Source"
              placeholder="e.g. my.microservice"
              value={eventForm.source}
              onChange={(e) => setEventForm({ ...eventForm, source: e.target.value })}
              required
              accentColor="emerald"
            />
            <Input
              label="Detail Type"
              placeholder="e.g. UserCreated"
              value={eventForm.detailType}
              onChange={(e) => setEventForm({ ...eventForm, detailType: e.target.value })}
              required
              accentColor="emerald"
            />
          </div>
          <TextArea
            label="Detail (JSON)"
            placeholder="{}"
            value={eventForm.detail}
            onChange={(e) => setEventForm({ ...eventForm, detail: e.target.value })}
            required
            rows={5}
            accentColor="emerald"
            className="font-mono text-xs"
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsEventModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" leftIcon={<Send className="w-3.5 h-3.5" />}>
              Send Event
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
};

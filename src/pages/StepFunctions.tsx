import { useState } from "react";
import { GitMerge, RefreshCw, Plus, Trash2 } from "lucide-react";
import { useStepFunctions } from "../hooks/useStepFunctions";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";

export default function StepFunctions() {
  const { stateMachines, loading, createStateMachine, deleteStateMachine, refresh } = useStepFunctions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [definition, setDefinition] = useState(
    '{\n  "StartAt": "Hello",\n  "States": {\n    "Hello": {\n      "Type": "Pass",\n      "Result": "Hello MiniStack!",\n      "End": true\n    }\n  }\n}',
  );
  const [roleArn, setRoleArn] = useState("arn:aws:iam::000000000000:role/service-role/StepFunctions-Role");
  const [isCreating, setIsCreating] = useState(false);
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    await createStateMachine(name, definition, roleArn);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setName("");
  };

  const handleDelete = (arn: string, name: string) => {
    confirm({
      title: "Delete State Machine",
      description: `Are you sure you want to delete state machine "${name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      confirmVariant: "danger",
      action: () => deleteStateMachine(arn),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Step Functions"
        subtitle="Orchestrate complex workflows with state machines"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create State Machine
            </Button>
          </>
        }
      />

      {loading && stateMachines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="rose" />
          <p className="mt-4 text-gray-500">Loading state machines...</p>
        </div>
      ) : stateMachines.length === 0 ? (
        <EmptyState
          title="No State Machines"
          description="Create a state machine to orchestrate complex workflows."
          icon={GitMerge}
          action={{
            label: "Create State Machine",
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <DataTable
          rows={stateMachines}
          rowKey={(p) => p.stateMachineArn || ""}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (p: any) => (
                <div className="flex items-center">
                  <GitMerge className="w-4 h-4 mr-2 text-rose-600" />
                  <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                </div>
              ),
            },
            {
              key: "type",
              header: "Type",
              render: (p: any) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {p.type || "STANDARD"}
                </span>
              ),
            },
            {
              key: "date",
              header: "Creation Date",
              render: (p: any) => (p.creationDate ? new Date(p.creationDate).toLocaleString() : "-"),
            },
            {
              key: "arn",
              header: "ARN",
              render: (p: any) => (
                <span className="text-xs text-gray-500 break-all max-w-xs block" title={p.stateMachineArn}>
                  {p.stateMachineArn}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (p: any) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(p.stateMachineArn!, p.name!)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ),
            },
          ]}
        />
      )}

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create State Machine">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name"
            placeholder="my-workflow"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <Input label="Execution Role ARN" value={roleArn} onChange={(e) => setRoleArn(e.target.value)} required />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Definition (ASL)</label>
            <textarea
              className="w-full h-64 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} color="rose">
              Create State Machine
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}

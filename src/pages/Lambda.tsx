import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Zap,
  RefreshCw,
  Play,
  ArrowLeft,
  Code2,
  FileJson,
  Terminal,
  Plus,
  Edit2,
  Save,
  Trash2,
  Upload,
  Shield,
  Settings,
  AlertCircle,
  Waves,
  Table,
  MessageSquare,
  Activity,
  FileText,
  Sparkles,
} from "lucide-react";
import {
  useLambda,
  type UpdateFunctionConfigurationForm,
  type EventSourceMappingConfiguration,
} from "../hooks/useLambda";
import { useIAM } from "../hooks/useIAM";
import { useToast } from "../hooks/useToast";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { Input, TextArea } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { Badge } from "../components/ui/Badge";
import { CreateTriggerModal } from "../components/lambda/CreateTriggerModal";
import { formatJson } from "../utils/format";

const RUNTIMES = [
  { value: "nodejs20.x", label: "Node.js 20.x" },
  { value: "nodejs18.x", label: "Node.js 18.x" },
  { value: "python3.12", label: "Python 3.12" },
  { value: "python3.11", label: "Python 3.11" },
  { value: "python3.10", label: "Python 3.10" },
  { value: "go1.x", label: "Go 1.x" },
  { value: "ruby3.3", label: "Ruby 3.3" },
  { value: "java17", label: "Java 17" },
  { value: "dotnet8", label: " .NET 8" },
];

const Lambda: React.FC = () => {
  const { functionName } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm, ConfirmModalComponent } = useConfirmModal();
  const {
    functions,
    loading,
    fetchFunctions,
    invokeFunction,
    updateFunctionConfiguration,
    updateFunctionCode,
    deleteFunction,
    listEventSourceMappings,
    createEventSourceMapping,
    deleteEventSourceMapping,
    updateEventSourceMapping,
  } = useLambda();
  const { roles, loading: iamLoading } = useIAM();

  const [activeTab, setActiveTab] = useState<"invoke" | "settings" | "triggers">("invoke");
  const [invoking, setInvoking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingCode, setUpdatingCode] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [codeFile, setCodeFile] = useState<File | null>(null);

  const [triggers, setTriggers] = useState<EventSourceMappingConfiguration[]>([]);
  const [triggersLoading, setTriggersLoading] = useState(false);
  const [isAddingTrigger, setIsAddingTrigger] = useState(false);

  const selectedFunction = functions.find((f) => f.FunctionName === functionName);

  const fetchTriggers = React.useCallback(async () => {
    if (!functionName) return;
    setTriggersLoading(true);
    try {
      const result = await listEventSourceMappings(functionName);
      setTriggers(result);
    } finally {
      setTriggersLoading(false);
    }
  }, [functionName, listEventSourceMappings]);

  React.useEffect(() => {
    if (activeTab === "triggers" && functionName) {
      fetchTriggers();
    }
  }, [activeTab, functionName, fetchTriggers]);

  const handleCreateTrigger = async (params: any) => {
    const success = await createEventSourceMapping(params);
    if (success) {
      fetchTriggers();
    }
    return success;
  };

  const handleDeleteTrigger = (uuid: string) => {
    confirm({
      title: "Delete Trigger",
      description:
        "Are you sure you want to remove this trigger mapping? This will stop event processing from the source.",
      confirmLabel: "Delete",
      confirmVariant: "danger",
      action: async () => {
        const success = await deleteEventSourceMapping(uuid);
        if (success) {
          fetchTriggers();
        }
      },
    });
  };

  const handleToggleTrigger = async (uuid: string, enabled: boolean) => {
    const success = await updateEventSourceMapping(uuid, enabled);
    if (success) {
      fetchTriggers();
    }
  };

  const [payload, setPayload] = useState("{}");
  const [invokeResult, setInvokeResult] = useState<{
    payload: string | null;
    logs: string | null;
    statusCode?: number;
    functionError?: string;
  } | null>(null);

  const [editForm, setEditForm] = useState<UpdateFunctionConfigurationForm>({
    FunctionName: functionName || "",
    Runtime: "",
    Handler: "",
    Role: "",
    Description: "",
    Timeout: 3,
    MemorySize: 128,
    Environment: { Variables: {} },
    LoggingConfig: {
      LogFormat: "Text",
      ApplicationLogLevel: "INFO",
      SystemLogLevel: "INFO",
      LogGroup: "",
    },
  });

  // Sync edit form with selected function
  React.useEffect(() => {
    if (selectedFunction && !editing) {
      setEditForm({
        FunctionName: selectedFunction.FunctionName || "",
        Runtime: selectedFunction.Runtime || "",
        Handler: selectedFunction.Handler || "",
        Role: selectedFunction.Role || "",
        Description: selectedFunction.Description || "",
        Timeout: selectedFunction.Timeout || 3,
        MemorySize: selectedFunction.MemorySize || 128,
        Environment: {
          Variables: selectedFunction.Environment?.Variables || {},
        },
        LoggingConfig: {
          LogFormat: selectedFunction.LoggingConfig?.LogFormat || "Text",
          ApplicationLogLevel: selectedFunction.LoggingConfig?.ApplicationLogLevel || "INFO",
          SystemLogLevel: selectedFunction.LoggingConfig?.SystemLogLevel || "INFO",
          LogGroup: selectedFunction.LoggingConfig?.LogGroup || "",
        },
      });
    }
  }, [selectedFunction, editing]);

  const handleInvoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!functionName) return;

    setInvoking(true);
    setInvokeResult(null);
    try {
      const result = await invokeFunction(functionName, payload);
      if (result) {
        setInvokeResult(result);
        if (result.functionError) {
          toast.error(`Function error: ${result.functionError}`);
        } else {
          toast.success("Function invoked successfully");
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to invoke function");
    } finally {
      setInvoking(false);
    }
  };

  const handleUpdateConfiguration = async () => {
    if (!functionName) return;
    setSaving(true);
    try {
      const success = await updateFunctionConfiguration({
        ...editForm,
        LoggingConfig: {
          ...editForm.LoggingConfig,
          LogGroup: editForm.LoggingConfig?.LogGroup || undefined,
        },
      });
      if (success) {
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCode = async () => {
    if (!functionName || !codeFile) return;
    setUpdatingCode(true);
    try {
      const arrayBuffer = await codeFile.arrayBuffer();
      const success = await updateFunctionCode(functionName, new Uint8Array(arrayBuffer));
      if (success) {
        setCodeFile(null);
      }
    } finally {
      setUpdatingCode(false);
    }
  };

  const handleDelete = async () => {
    if (!functionName) return;
    confirm({
      title: "Delete Function",
      description: `Are you sure you want to delete function "${functionName}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      confirmVariant: "danger",
      action: async () => {
        const success = await deleteFunction(functionName);
        if (success) {
          navigate("/lambda");
        }
      },
    });
  };

  const handleEnvVarChange = (key: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      Environment: {
        Variables: {
          ...(prev.Environment?.Variables || {}),
          [key]: value,
        },
      },
    }));
  };

  const removeEnvVar = (keyToRemove: string) => {
    setEditForm((prev) => {
      const newVars = { ...(prev.Environment?.Variables || {}) };
      delete newVars[keyToRemove];
      return {
        ...prev,
        Environment: {
          Variables: newVars,
        },
      };
    });
  };

  const addEnvVar = () => {
    setEditForm((prev) => ({
      ...prev,
      Environment: {
        Variables: {
          ...(prev.Environment?.Variables || {}),
          "": "",
        },
      },
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.name.toLowerCase().endsWith(".zip")) {
        setCodeFile(droppedFile);
      } else {
        toast.error("Please upload a .zip file");
      }
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lambda Functions"
        subtitle="Manage and invoke your serverless functions in your local environment"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={fetchFunctions} title="Refresh" aria-label="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {!functionName && (
              <Button
                variant="warning"
                size="sm"
                onClick={() => navigate("/lambda/create")}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Function
              </Button>
            )}
          </>
        }
      />

      {!functionName ? (
        loading ? (
          <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated border-b border-border-subtle text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-medium text-text-muted">Function Name</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted">Runtime</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted">Last Modified</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <div className="h-3 w-32 bg-surface-skeleton rounded animate-pulse" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3 w-24 bg-surface-skeleton rounded animate-pulse" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3 w-32 bg-surface-skeleton rounded animate-pulse" />
                      </td>
                      <td className="px-4 py-3" />
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : functions.length === 0 ? (
          <div className="bg-surface-card rounded-card border border-border-subtle">
            <EmptyState
              icon={Zap}
              title="No functions found"
              description="Deploy your first Lambda function to get started."
              action={{ label: "Create Function", onClick: () => navigate("/lambda/create") }}
            />
          </div>
        ) : (
          <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated border-b border-border-subtle text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-medium text-text-muted">Function Name</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted">Runtime</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted">Last Modified</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {functions.map((fn) => (
                  <tr
                    key={fn.FunctionArn}
                    className="hover:bg-surface-hover cursor-pointer transition-colors group"
                    onClick={() => navigate(`/lambda/${fn.FunctionName}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-amber-500/10 rounded">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="text-sm font-medium text-text-primary">{fn.FunctionName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{fn.Runtime}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">
                      {fn.LastModified ? new Date(fn.LastModified).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="xs" className="opacity-0 group-hover:opacity-100 transition-all">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-1 border-b border-border-subtle mb-5">
            <button
              onClick={() => setActiveTab("invoke")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === "invoke"
                  ? "border-amber-500 text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              Invoke
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === "settings"
                  ? "border-amber-500 text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab("triggers")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === "triggers"
                  ? "border-amber-500 text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              Triggers
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/lambda")}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Functions
            </button>
            <span className="text-text-faint">/</span>
            <button
              onClick={() => {
                navigate(`/lambda/${functionName}`);
                setActiveTab("invoke");
              }}
              className="text-sm font-medium text-amber-500 hover:text-amber-600 transition-colors"
            >
              {functionName}
            </button>
          </div>

          {activeTab === "invoke" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="space-y-4">
                <div className="bg-surface-card rounded-card border border-border-subtle p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-semibold text-text-secondary flex items-center gap-2 uppercase tracking-wider">
                      <Play className="w-3.5 h-3.5 text-amber-500" />
                      Invoke Function
                    </h2>
                    <button
                      type="button"
                      onClick={() => setPayload(formatJson(payload))}
                      className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium text-amber-600 hover:text-amber-700 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 rounded transition-colors group"
                      title="Format JSON (Prettier)"
                    >
                      <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform" />
                      Format
                    </button>
                  </div>
                  <form onSubmit={handleInvoke} className="space-y-3">
                    <TextArea
                      label="Payload (JSON)"
                      rows={6}
                      accentColor="amber"
                      placeholder="{}"
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                    />
                    <Button
                      type="submit"
                      variant="warning"
                      size="sm"
                      className="w-full !justify-center"
                      isLoading={invoking}
                      leftIcon={<Play className="w-3.5 h-3.5" />}
                    >
                      Invoke
                    </Button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden min-h-[400px] flex flex-col">
                  <div className="bg-surface-elevated px-4 py-3 border-b border-border-subtle flex justify-between items-center">
                    <h2 className="text-xs font-semibold text-text-secondary flex items-center gap-2 uppercase tracking-wider">
                      <Terminal className="w-3.5 h-3.5 text-amber-500" />
                      Invocation Result
                    </h2>
                    {invokeResult && (
                      <div className="flex gap-2">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${invokeResult.functionError ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}
                        >
                          Status: {invokeResult.statusCode}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-0 flex flex-col">
                    {!invokeResult && !invoking ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-10 text-center">
                        <div className="p-3 bg-surface-elevated rounded-full mb-3">
                          <Code2 className="w-6 h-6 text-text-faint" />
                        </div>
                        <p className="text-sm">Invoke the function to see results and logs.</p>
                      </div>
                    ) : invoking ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-10">
                        <Spinner size="lg" color="text-amber-500" label="Invoking function..." />
                      </div>
                    ) : (
                      <div className="flex-1 divide-y divide-border-subtle overflow-auto">
                        <div className="p-4 space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <FileJson className="w-3.5 h-3.5 text-text-muted" />
                            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                              Response Payload
                            </span>
                          </div>
                          <pre className="bg-surface-elevated border border-border-subtle p-3 rounded text-xs font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
                            {invokeResult?.payload || "No payload returned"}
                          </pre>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Terminal className="w-3.5 h-3.5 text-text-muted" />
                            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                              Execution Logs
                            </span>
                          </div>
                          <pre className="bg-surface-elevated border border-border-subtle p-3 rounded text-xs font-mono text-text-muted overflow-x-auto whitespace-pre-wrap break-all min-h-[150px]">
                            {invokeResult?.logs || "No logs available"}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "settings" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
                  <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-elevated/30">
                    <h2 className="text-xs font-semibold text-text-secondary flex items-center gap-2 uppercase tracking-wider">
                      <Settings className="w-3.5 h-3.5 text-amber-500" />
                      Function Configuration
                    </h2>
                    {!editing ? (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setEditing(true)}
                        leftIcon={<Edit2 className="w-3 h-3" />}
                      >
                        Edit Configuration
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="xs" onClick={() => setEditing(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="warning"
                          size="xs"
                          onClick={handleUpdateConfiguration}
                          isLoading={saving}
                          leftIcon={<Save className="w-3 h-3" />}
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-6">
                    {editing ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">
                                Runtime
                              </label>
                              <select
                                className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors text-sm"
                                value={editForm.Runtime}
                                onChange={(e) => setEditForm({ ...editForm, Runtime: e.target.value })}
                              >
                                {RUNTIMES.map((rt) => (
                                  <option key={rt.value} value={rt.value}>
                                    {rt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <Input
                              label="Handler"
                              value={editForm.Handler}
                              onChange={(e) => setEditForm({ ...editForm, Handler: e.target.value })}
                              accentColor="amber"
                            />

                            <div className="space-y-1.5">
                              <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">
                                Execution Role
                              </label>
                              <select
                                className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors text-sm"
                                value={editForm.Role}
                                onChange={(e) => setEditForm({ ...editForm, Role: e.target.value })}
                                disabled={iamLoading}
                              >
                                <option value="" disabled>
                                  {iamLoading ? "Loading roles..." : "Select a role..."}
                                </option>
                                {roles.map((role) => (
                                  <option key={role.Arn} value={role.Arn}>
                                    {role.RoleName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                label="Memory (MB)"
                                type="number"
                                value={editForm.MemorySize}
                                onChange={(e) => setEditForm({ ...editForm, MemorySize: parseInt(e.target.value) })}
                                accentColor="amber"
                              />
                              <Input
                                label="Timeout (sec)"
                                type="number"
                                value={editForm.Timeout}
                                onChange={(e) => setEditForm({ ...editForm, Timeout: parseInt(e.target.value) })}
                                accentColor="amber"
                              />
                            </div>
                            <TextArea
                              label="Description"
                              value={editForm.Description}
                              onChange={(e) => setEditForm({ ...editForm, Description: e.target.value })}
                              accentColor="amber"
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="pt-6 border-t border-border-subtle">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-4 h-4 text-amber-500" />
                            <h3 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                              Logging Settings
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">
                                  Log Format
                                </label>
                                <select
                                  className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors text-sm"
                                  value={editForm.LoggingConfig?.LogFormat}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      LoggingConfig: {
                                        ...editForm.LoggingConfig,
                                        LogFormat: e.target.value as any,
                                      },
                                    })
                                  }
                                >
                                  <option value="Text">Text</option>
                                  <option value="JSON">JSON</option>
                                </select>
                              </div>

                              <Input
                                label="Log Group"
                                value={editForm.LoggingConfig?.LogGroup}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    LoggingConfig: { ...editForm.LoggingConfig, LogGroup: e.target.value },
                                  })
                                }
                                accentColor="amber"
                                placeholder="/aws/lambda/..."
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">
                                  Application Log Level
                                </label>
                                <select
                                  className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors text-sm"
                                  value={editForm.LoggingConfig?.ApplicationLogLevel}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      LoggingConfig: {
                                        ...editForm.LoggingConfig,
                                        ApplicationLogLevel: e.target.value as any,
                                      },
                                    })
                                  }
                                >
                                  <option value="TRACE">TRACE</option>
                                  <option value="DEBUG">DEBUG</option>
                                  <option value="INFO">INFO</option>
                                  <option value="WARN">WARN</option>
                                  <option value="ERROR">ERROR</option>
                                  <option value="FATAL">FATAL</option>
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">
                                  System Log Level
                                </label>
                                <select
                                  className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors text-sm"
                                  value={editForm.LoggingConfig?.SystemLogLevel}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      LoggingConfig: {
                                        ...editForm.LoggingConfig,
                                        SystemLogLevel: e.target.value as any,
                                      },
                                    })
                                  }
                                >
                                  <option value="DEBUG">DEBUG</option>
                                  <option value="INFO">INFO</option>
                                  <option value="WARN">WARN</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-border-subtle">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                              Environment Variables
                            </h3>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={addEnvVar}
                              leftIcon={<Plus className="w-3 h-3" />}
                            >
                              Add Variable
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(editForm.Environment?.Variables || {}).map(([key, value], idx) => (
                              <div key={idx} className="flex gap-2 items-start">
                                <div className="flex-1">
                                  <input
                                    className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors text-xs font-mono"
                                    placeholder="Key"
                                    value={key}
                                    onChange={(e) => {
                                      const newKey = e.target.value;
                                      setEditForm((prev) => {
                                        const vars = { ...(prev.Environment?.Variables || {}) };
                                        const val = vars[key];
                                        delete vars[key];
                                        vars[newKey] = val;
                                        return { ...prev, Environment: { Variables: vars } };
                                      });
                                    }}
                                  />
                                </div>
                                <div className="flex-[2]">
                                  <input
                                    className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors text-xs font-mono"
                                    placeholder="Value"
                                    value={value}
                                    onChange={(e) => handleEnvVarChange(key, e.target.value)}
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEnvVar(key)}
                                  className="text-red-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                            {Object.keys(editForm.Environment?.Variables || {}).length === 0 && (
                              <p className="text-xs text-text-faint italic text-center py-4 bg-surface-elevated rounded-lg border border-dashed border-border-subtle">
                                No environment variables defined.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                                Runtime
                              </span>
                              <Badge variant="warning">{selectedFunction?.Runtime}</Badge>
                            </div>
                            <div>
                              <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                                Handler
                              </span>
                              <span className="text-sm text-text-primary font-medium">{selectedFunction?.Handler}</span>
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                              Description
                            </span>
                            <p className="text-sm text-text-secondary">
                              {selectedFunction?.Description || "No description provided."}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                              Execution Role
                            </span>
                            <div className="flex items-center gap-2 text-xs text-text-muted font-mono bg-surface-elevated p-2 rounded border border-border-subtle break-all">
                              <Shield className="w-3 h-3 flex-shrink-0" />
                              {selectedFunction?.Role}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                                Memory Size
                              </span>
                              <span className="text-sm text-text-primary font-medium">
                                {selectedFunction?.MemorySize} MB
                              </span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                                Timeout
                              </span>
                              <span className="text-sm text-text-primary font-medium">
                                {selectedFunction?.Timeout} seconds
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                              Code Size
                            </span>
                            <span className="text-sm text-text-primary font-medium">
                              {formatSize(selectedFunction?.CodeSize)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                              Last Modified
                            </span>
                            <span className="text-sm text-text-primary font-medium">
                              {selectedFunction?.LastModified
                                ? new Date(selectedFunction.LastModified).toLocaleString()
                                : "-"}
                            </span>
                          </div>
                        </div>

                        <div className="md:col-span-2 pt-6 border-t border-border-subtle">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-4 h-4 text-amber-500" />
                            <h3 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                              Logging Configuration
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                                    Log Format
                                  </span>
                                  <span className="text-sm text-text-primary font-medium">
                                    {selectedFunction?.LoggingConfig?.LogFormat || "Text"}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                                    Log Group
                                  </span>
                                  <span className="text-sm text-text-primary font-medium truncate block">
                                    {selectedFunction?.LoggingConfig?.LogGroup || "Default"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                                    App Log Level
                                  </span>
                                  <Badge variant="default">
                                    {selectedFunction?.LoggingConfig?.ApplicationLogLevel || "INFO"}
                                  </Badge>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">
                                    System Log Level
                                  </span>
                                  <Badge variant="default">
                                    {selectedFunction?.LoggingConfig?.SystemLogLevel || "INFO"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2 pt-6 border-t border-border-subtle">
                          <h3 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
                            Environment Variables
                          </h3>
                          {Object.keys(selectedFunction?.Environment?.Variables || {}).length > 0 ? (
                            <div className="bg-surface-elevated rounded-lg p-3 border border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                              {Object.entries(selectedFunction?.Environment?.Variables || {}).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between py-1 text-xs border-b border-border-subtle/30 last:border-0 md:odd:border-r md:odd:pr-6 md:even:pl-6"
                                >
                                  <span className="font-mono text-text-secondary font-medium">{key}</span>
                                  <span className="font-mono text-text-muted truncate ml-4" title={value}>
                                    {value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-text-faint italic">No environment variables configured.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 rounded-card p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                      <p className="text-xs text-text-muted">
                        Once you delete a function, there is no going back. Please be certain.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:bg-red-500/10"
                    onClick={handleDelete}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Delete Function
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
                  <div className="px-6 py-4 border-b border-border-subtle bg-surface-elevated/30 flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-amber-500" />
                    <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Function Code
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer ${
                        isDragging
                          ? "border-amber-500 bg-amber-500/10"
                          : codeFile
                            ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
                            : "border-border-default hover:border-amber-500/40 hover:bg-amber-500/5"
                      }`}
                      onClick={() => document.getElementById("code-upload")?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className={`p-3 rounded-full ${codeFile ? "bg-amber-500/20" : "bg-surface-elevated"}`}>
                        <Upload className={`w-6 h-6 ${codeFile ? "text-amber-500" : "text-text-muted"}`} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-text-primary">
                          {codeFile ? codeFile.name : "Select new ZIP file"}
                        </p>
                        {codeFile && (
                          <p className="text-[10px] text-text-muted mt-0.5">{(codeFile.size / 1024).toFixed(2)} KB</p>
                        )}
                      </div>
                      <input
                        id="code-upload"
                        type="file"
                        accept=".zip"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setCodeFile(e.target.files[0]);
                        }}
                      />
                    </div>
                    {codeFile && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => setCodeFile(null)}>
                          Clear
                        </Button>
                        <Button
                          variant="warning"
                          size="sm"
                          className="flex-[2]"
                          onClick={handleUpdateCode}
                          isLoading={updatingCode}
                          leftIcon={<Upload className="w-3.5 h-3.5" />}
                        >
                          Update Code
                        </Button>
                      </div>
                    )}
                    <p className="text-[10px] text-text-faint text-center">
                      Upload a .zip file containing your function code and dependencies.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-card rounded-card border border-border-subtle p-5">
                  <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Metadata</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-muted">Version</span>
                      <span className="text-text-primary font-medium">{selectedFunction?.Version || "$LATEST"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-muted">Package Type</span>
                      <span className="text-text-primary font-medium">{selectedFunction?.PackageType || "Zip"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-muted">Arch</span>
                      <span className="text-text-primary font-medium">
                        {selectedFunction?.Architectures?.[0] || "x86_64"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-text-primary">Event Source Triggers</h2>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => setIsAddingTrigger(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Trigger
                </Button>
              </div>

              <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-elevated border-b border-border-subtle text-[11px] uppercase tracking-wider">
                      <th className="px-4 py-2.5 font-medium text-text-muted">Source</th>
                      <th className="px-4 py-2.5 font-medium text-text-muted">Type</th>
                      <th className="px-4 py-2.5 font-medium text-text-muted">Status</th>
                      <th className="px-4 py-2.5 font-medium text-text-muted text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {triggersLoading ? (
                      Array(2)
                        .fill(0)
                        .map((_, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3">
                              <div className="h-3 w-48 bg-surface-skeleton rounded animate-pulse" />
                            </td>
                            <td className="px-4 py-3">
                              <div className="h-3 w-20 bg-surface-skeleton rounded animate-pulse" />
                            </td>
                            <td className="px-4 py-3">
                              <div className="h-3 w-16 bg-surface-skeleton rounded animate-pulse" />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="h-8 w-8 ml-auto bg-surface-skeleton rounded animate-pulse" />
                            </td>
                          </tr>
                        ))
                    ) : triggers.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <EmptyState
                            icon={Activity}
                            title="No triggers configured"
                            description="Connect your function to event sources like SQS or DynamoDB Streams."
                            action={{ label: "Add Trigger", onClick: () => setIsAddingTrigger(true) }}
                          />
                        </td>
                      </tr>
                    ) : (
                      triggers.map((trigger) => {
                        const isSQS = trigger.EventSourceArn?.includes(":sqs:");
                        const isDynamoDB = trigger.EventSourceArn?.includes(":dynamodb:");
                        const isKinesis = trigger.EventSourceArn?.includes(":kinesis:");

                        return (
                          <tr key={trigger.UUID} className="hover:bg-surface-hover transition-colors group">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-1.5 rounded ${isSQS ? "bg-orange-500/10 text-orange-500" : isDynamoDB ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"}`}
                                >
                                  {isSQS ? (
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  ) : isDynamoDB ? (
                                    <Table className="w-3.5 h-3.5" />
                                  ) : (
                                    <Waves className="w-3.5 h-3.5" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="block text-sm font-medium text-text-primary truncate max-w-[300px]">
                                    {trigger.EventSourceArn?.split(":").pop()?.split("/").pop()}
                                  </span>
                                  <span className="block text-[10px] text-text-faint truncate max-w-[400px]">
                                    {trigger.EventSourceArn}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-text-secondary">
                                {isSQS ? "SQS" : isDynamoDB ? "DynamoDB" : isKinesis ? "Kinesis" : "Unknown"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleTrigger(trigger.UUID!, trigger.State !== "Enabled")}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                                    trigger.State === "Enabled"
                                      ? "bg-emerald-500"
                                      : "bg-surface-elevated border border-border-subtle"
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                      trigger.State === "Enabled" ? "translate-x-5" : "translate-x-1"
                                    }`}
                                  />
                                </button>
                                <span
                                  className={`text-[10px] font-bold uppercase ${trigger.State === "Enabled" ? "text-emerald-500" : "text-text-faint"}`}
                                >
                                  {trigger.State}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteTrigger(trigger.UUID!)}
                                className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete Trigger"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedFunction && (
        <CreateTriggerModal
          open={isAddingTrigger}
          onClose={() => setIsAddingTrigger(false)}
          onConfirm={handleCreateTrigger}
          functionName={functionName!}
        />
      )}

      {ConfirmModalComponent}
    </div>
  );
};

export default Lambda;

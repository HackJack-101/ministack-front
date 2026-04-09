import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Zap, RefreshCw, Play, ArrowLeft, Info, Code2, FileJson, Terminal, Plus } from "lucide-react";
import { useLambda } from "../hooks/useLambda";
import { useToast } from "../hooks/useToast";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { TextArea } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";

const Lambda: React.FC = () => {
  const { functionName } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { functions, loading, fetchFunctions, invokeFunction } = useLambda();

  const [invoking, setInvoking] = useState(false);
  const [payload, setPayload] = useState("{}");
  const [invokeResult, setInvokeResult] = useState<{
    payload: string | null;
    logs: string | null;
    statusCode?: number;
    functionError?: string;
  } | null>(null);

  const selectedFunction = functions.find(f => f.FunctionName === functionName);

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
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchFunctions}
              title="Refresh"
              aria-label="Refresh"
            >
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
                {Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="h-3 w-32 bg-surface-skeleton rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-24 bg-surface-skeleton rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-32 bg-surface-skeleton rounded animate-pulse" /></td>
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
                  <tr key={fn.FunctionArn} className="hover:bg-surface-hover cursor-pointer transition-colors group"
                    onClick={() => navigate(`/lambda/${fn.FunctionName}`)}>
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
                      <Button variant="ghost" size="xs" className="opacity-0 group-hover:opacity-100 transition-all">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/lambda")}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Functions
            </button>
            <span className="text-text-faint">/</span>
            <span className="text-sm font-medium text-amber-500">{functionName}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="space-y-4">
              <div className="bg-surface-card rounded-card border border-border-subtle p-4">
                <h2 className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                  Function Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">ARN</span>
                    <span className="text-xs text-text-muted font-mono break-all">{selectedFunction?.FunctionArn}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">Runtime</span>
                      <span className="text-sm text-text-primary font-medium">{selectedFunction?.Runtime}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">Memory</span>
                      <span className="text-sm text-text-primary font-medium">{selectedFunction?.MemorySize} MB</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">Handler</span>
                    <span className="text-sm text-text-primary font-medium">{selectedFunction?.Handler}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">Code Size</span>
                    <span className="text-sm text-text-primary font-medium">{formatSize(selectedFunction?.CodeSize)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-card rounded-card border border-border-subtle p-4">
                <h2 className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Play className="w-3.5 h-3.5 text-amber-500" />
                  Invoke Function
                </h2>
                <form onSubmit={handleInvoke} className="space-y-3">
                  <TextArea label="Payload (JSON)" rows={6} accentColor="amber"
                    placeholder="{}" value={payload} onChange={(e) => setPayload(e.target.value)} />
                  <Button type="submit" variant="warning" size="sm" className="w-full !justify-center"
                    isLoading={invoking} leftIcon={<Play className="w-3.5 h-3.5" />}>
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
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${invokeResult.functionError ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
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
                          <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Response Payload</span>
                        </div>
                        <pre className="bg-surface-elevated border border-border-subtle p-3 rounded text-xs font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
                          {invokeResult?.payload || "No payload returned"}
                        </pre>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Terminal className="w-3.5 h-3.5 text-text-muted" />
                          <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Execution Logs</span>
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
        </div>
      )}
    </div>
  );
};

export default Lambda;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowLeft, Upload, Settings, Shield } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { useLambda } from "../hooks/useLambda";
import { useToast } from "../hooks/useToast";

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

export const LambdaCreateFunction = () => {
  const navigate = useNavigate();
  const lambda = useLambda();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    FunctionName: "",
    Runtime: "nodejs20.x",
    Handler: "index.handler",
    Role: "arn:aws:iam::000000000000:role/lambda-role",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleCreate = async () => {
    if (!formData.FunctionName || !file) {
      toast.error("Function name and ZIP file are required");
      return;
    }

    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const success = await lambda.createFunction({
        ...formData,
        ZipFile: new Uint8Array(arrayBuffer),
      });
      if (success) {
        toast.success(`Function "${formData.FunctionName}" created successfully`);
        navigate(`/lambda/${formData.FunctionName}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create function");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/lambda")}
          className="p-2 hover:bg-surface-hover rounded-full transition-colors text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title="Create Lambda Function" subtitle="Deploy new serverless code to your environment" />
      </div>

      <div className="bg-surface-card border border-border-default rounded-card shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border-subtle bg-surface-elevated/30">
          <div className="max-w-md">
            <Input
              label="Function Name"
              placeholder="e.g. my-awesome-function"
              value={formData.FunctionName}
              onChange={(e) => setFormData({ ...formData, FunctionName: e.target.value })}
              accentColor="amber"
              autoFocus
              required
            />
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Runtime Settings</h3>
              </div>

              <div className="space-y-4 bg-surface-elevated p-5 rounded-xl border border-border-subtle">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">
                    Runtime
                  </label>
                  <select
                    className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors text-sm"
                    value={formData.Runtime}
                    onChange={(e) => setFormData({ ...formData, Runtime: e.target.value })}
                    required
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
                  placeholder="index.handler"
                  value={formData.Handler}
                  onChange={(e) => setFormData({ ...formData, Handler: e.target.value })}
                  required
                  accentColor="amber"
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Permissions</h3>
              </div>
              <div className="bg-surface-elevated p-5 rounded-xl border border-border-subtle">
                <Input
                  label="Execution Role ARN"
                  placeholder="arn:aws:iam::000000000000:role/lambda-role"
                  value={formData.Role}
                  onChange={(e) => setFormData({ ...formData, Role: e.target.value })}
                  required
                  accentColor="amber"
                />
                <p className="mt-2 text-[10px] text-text-muted">
                  The IAM role that Lambda assumes when it executes your function.
                </p>
              </div>
            </section>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Function Code</h3>
            </div>
            <div
              className={`border-2 border-dashed rounded-xl p-10 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer ${
                file
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-border-default hover:border-amber-500/40 hover:bg-amber-500/5"
              }`}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <div className={`p-4 rounded-full ${file ? "bg-amber-500/20" : "bg-surface-elevated"}`}>
                <Upload className={`w-8 h-8 ${file ? "text-amber-500" : "text-text-muted"}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-primary">{file ? file.name : "Click to upload ZIP file"}</p>
                <p className="text-xs text-text-muted mt-1">
                  {file ? `${(file.size / 1024).toFixed(2)} KB` : "Maximum size 50MB"}
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
              />
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-border-subtle bg-surface-elevated/30 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate("/lambda")} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleCreate}
            isLoading={loading}
            disabled={!formData.FunctionName || !file}
            leftIcon={!loading && <Zap className="w-3.5 h-3.5" />}
          >
            Create Function
          </Button>
        </div>
      </div>
    </div>
  );
};

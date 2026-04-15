import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  ArrowLeft,
  Upload,
  Settings,
  Shield,
  FileText,
  Plus,
  Trash2,
  XCircle,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { useLambda } from "../hooks/useLambda";
import { useIAM, type PolicyDocument, type PolicyStatement } from "../hooks/useIAM";
import { useToast } from "../hooks/useToast";
import { Spinner } from "../components/ui/Spinner";
import { MINISTACK_ENDPOINT } from "../services/awsClients";

const RUNTIMES = [
  { value: "nodejs22.x", label: "Node.js 22.x" },
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

const LAMBDA_TRUST_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: {
        Service: "lambda.amazonaws.com",
      },
      Action: "sts:AssumeRole",
    },
  ],
};

const SECRETS_MANAGER_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Action: ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret", "secretsmanager:ListSecrets"],
      Resource: "*",
    },
    {
      Effect: "Allow",
      Action: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      Resource: "arn:aws:logs:*:*:*",
    },
  ],
};

export const LambdaCreateFunction = () => {
  const navigate = useNavigate();
  const lambda = useLambda();
  const {
    roles,
    loading: iamLoading,
    getRole,
    updateRoleTrustPolicy,
    createRole,
    listAttachedRolePolicies,
    listRolePolicies,
    getPolicyDocument,
    getRolePolicy,
    createPolicy,
    attachRolePolicy,
  } = useIAM();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [roleTrustValid, setRoleTrustValid] = useState<boolean | null>(null);
  const [permissionsValid, setPermissionsValid] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(false);
  const [fixingRole, setFixingRole] = useState(false);
  const [fixingPermissions, setFixingPermissions] = useState(false);

  const [formData, setFormData] = useState({
    FunctionName: "",
    Runtime: "nodejs20.x",
    Handler: "index.handler",
    Role: "",
    LoggingConfig: {
      LogFormat: "Text",
      ApplicationLogLevel: "INFO",
      SystemLogLevel: "INFO",
      LogGroup: "",
    },
  });
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  const handleEnvVarChange = (key: string, value: string) => {
    setEnvVars((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeEnvVar = (keyToRemove: string) => {
    setEnvVars((prev) => {
      const newVars = { ...prev };
      delete newVars[keyToRemove];
      return newVars;
    });
  };

  const addEnvVar = () => {
    setEnvVars((prev) => ({
      ...prev,
      [`VAR_${Object.keys(prev).length + 1}`]: "",
    }));
  };

  const quickAddAwsVariables = () => {
    setEnvVars((prev) => ({
      ...prev,
      AWS_REGION: "us-east-1",
      AWS_ACCESS_KEY_ID: "test",
      AWS_SECRET_ACCESS_KEY: "test",
      AWS_ENDPOINT_URL: MINISTACK_ENDPOINT,
    }));
    toast.success("AWS environment variables added");
  };

  const resetLoggingSettings = () => {
    setFormData((prev) => ({
      ...prev,
      LoggingConfig: {
        LogFormat: "Text",
        ApplicationLogLevel: "INFO",
        SystemLogLevel: "INFO",
        LogGroup: "",
      },
    }));
    toast.success("Logging settings reset to defaults");
  };

  const checkRoleTrustPolicy = useCallback(
    async (roleArn: string) => {
      if (!roleArn) return;
      setCheckingRole(true);
      try {
        const roleName = roleArn.split("/").pop();
        if (!roleName) return;

        const role = await getRole(roleName);
        if (role?.AssumeRolePolicyDocument) {
          const doc: PolicyDocument =
            typeof role.AssumeRolePolicyDocument === "string"
              ? JSON.parse(decodeURIComponent(role.AssumeRolePolicyDocument))
              : role.AssumeRolePolicyDocument;

          const statements = Array.isArray(doc.Statement) ? doc.Statement : [doc.Statement];
          const isValid = statements.some((s: PolicyStatement) => {
            const principal = s.Principal?.Service;
            const services = Array.isArray(principal) ? principal : [principal];
            return s.Effect === "Allow" && s.Action === "sts:AssumeRole" && services.includes("lambda.amazonaws.com");
          });
          setRoleTrustValid(isValid);
        }
      } catch (err) {
        console.error("Failed to check role trust policy", err);
        setRoleTrustValid(null);
      } finally {
        setCheckingRole(false);
      }
    },
    [getRole],
  );

  const checkPermissions = useCallback(
    async (roleArn: string) => {
      if (!roleArn) return;
      setCheckingPermissions(true);
      try {
        const roleName = roleArn.split("/").pop();
        if (!roleName) return;

        const [attachedPolicies, inlinePolicyNames] = await Promise.all([
          listAttachedRolePolicies(roleName),
          listRolePolicies(roleName),
        ]);

        let hasSecretsManagerAccess = false;
        let hasCloudWatchLogsAccess = false;

        const checkStatement = (s: PolicyStatement) => {
          if (s.Effect !== "Allow") return { sm: false, cw: false };
          const actions = Array.isArray(s.Action) ? s.Action : [s.Action];

          const sm = actions.some(
            (a: string) =>
              a === "*" ||
              a === "secretsmanager:*" ||
              a === "secretsmanager:GetSecretValue" ||
              a.startsWith("secretsmanager:Get"),
          );

          const cw = actions.some(
            (a: string) =>
              a === "*" ||
              a === "logs:*" ||
              a === "logs:CreateLogGroup" ||
              a === "logs:PutLogEvents" ||
              a === "logs:CreateLogStream",
          );

          return { sm, cw };
        };

        const processPolicyDocument = (doc: PolicyDocument | string) => {
          const policyObj: PolicyDocument = typeof doc === "string" ? JSON.parse(doc) : doc;
          const statements = Array.isArray(policyObj.Statement) ? policyObj.Statement : [policyObj.Statement];

          for (const s of statements) {
            const { sm, cw } = checkStatement(s);
            if (sm) hasSecretsManagerAccess = true;
            if (cw) hasCloudWatchLogsAccess = true;
          }
        };

        await Promise.all(
          attachedPolicies.map(async (policy) => {
            if (!policy.PolicyArn || (hasSecretsManagerAccess && hasCloudWatchLogsAccess)) return;
            try {
              const doc = await getPolicyDocument(policy.PolicyArn);
              if (doc) processPolicyDocument(doc as PolicyDocument);
            } catch (err) {
              console.error(`Failed to check attached policy ${policy.PolicyArn}`, err);
            }
          }),
        );

        if (!hasSecretsManagerAccess || !hasCloudWatchLogsAccess) {
          await Promise.all(
            inlinePolicyNames.map(async (policyName) => {
              if (hasSecretsManagerAccess && hasCloudWatchLogsAccess) return;
              try {
                const doc = await getRolePolicy(roleName, policyName);
                if (doc) processPolicyDocument(doc);
              } catch (err) {
                console.error(`Failed to check inline policy ${policyName}`, err);
              }
            }),
          );
        }

        setPermissionsValid(hasSecretsManagerAccess && hasCloudWatchLogsAccess);
      } catch (err) {
        console.error("Failed to check permissions", err);
        setPermissionsValid(null);
      } finally {
        setCheckingPermissions(false);
      }
    },
    [getPolicyDocument, getRolePolicy, listAttachedRolePolicies, listRolePolicies],
  );

  const handleFixPermissions = async () => {
    if (!formData.Role) return;
    const roleName = formData.Role.split("/").pop();
    if (!roleName) return;

    setFixingPermissions(true);
    try {
      const policyName = `LambdaSecretsManagerAccess-${roleName}`;
      try {
        await createPolicy(policyName, JSON.stringify(SECRETS_MANAGER_POLICY));
      } catch {
        // Already exists is fine
      }

      const policyArn = `arn:aws:iam::000000000000:policy/${policyName}`;
      await attachRolePolicy(roleName, policyArn);

      setPermissionsValid(true);
      toast.success("Secrets Manager and CloudWatch Logs permissions attached to role");
    } catch {
      // Error handled by hook
    } finally {
      setFixingPermissions(false);
    }
  };

  const handleFixRoleTrustPolicy = async () => {
    if (!formData.Role) return;
    const roleName = formData.Role.split("/").pop();
    if (!roleName) return;

    setFixingRole(true);
    try {
      await updateRoleTrustPolicy(roleName, JSON.stringify(LAMBDA_TRUST_POLICY));
      setRoleTrustValid(true);
      toast.success("Role trust policy updated for Lambda execution");
    } catch {
      // Error handled by hook
    } finally {
      setFixingRole(false);
    }
  };

  const handleCreateExecutionRole = async () => {
    const roleName = window.prompt("Enter a name for the new execution role:");
    if (!roleName) return;

    setLoading(true);
    try {
      await createRole(roleName, JSON.stringify(LAMBDA_TRUST_POLICY));
      // Note: useIAM hook will automatically refresh roles list
      toast.success(`Role "${roleName}" created and trust policy configured`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.Role) {
      checkRoleTrustPolicy(formData.Role);
      checkPermissions(formData.Role);
    } else {
      setRoleTrustValid(null);
      setPermissionsValid(null);
    }
  }, [formData.Role, checkRoleTrustPolicy, checkPermissions]);

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
        LoggingConfig: {
          ...formData.LoggingConfig,
          LogFormat: formData.LoggingConfig.LogFormat as unknown as any,
          ApplicationLogLevel: formData.LoggingConfig.ApplicationLogLevel as unknown as any,
          SystemLogLevel: formData.LoggingConfig.SystemLogLevel as unknown as any,
          LogGroup: formData.LoggingConfig.LogGroup || undefined,
        },
        Environment:
          Object.keys(envVars).length > 0
            ? {
                Variables: Object.fromEntries(Object.entries(envVars).filter(([k]) => k.trim() !== "")),
              }
            : undefined,
      });
      if (success) {
        navigate(`/lambda/${formData.FunctionName}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create function");
    } finally {
      setLoading(false);
    }
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
        setFile(droppedFile);
      } else {
        toast.error("Please upload a .zip file");
      }
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
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">
                      Execution Role
                    </label>
                    <div className="flex items-center gap-2">
                      {checkingRole && <Spinner size="sm" />}
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={handleCreateExecutionRole}
                        leftIcon={<Plus className="w-3 h-3" />}
                        className="h-6 text-[10px]"
                      >
                        Create Role
                      </Button>
                    </div>
                  </div>
                  <select
                    className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors text-sm disabled:opacity-50"
                    value={formData.Role}
                    onChange={(e) => setFormData({ ...formData, Role: e.target.value })}
                    required
                    disabled={iamLoading}
                  >
                    <option value="" disabled>
                      {iamLoading ? "Loading roles..." : "Select a role..."}
                    </option>
                    {roles.map((role) => (
                      <option key={role.Arn} value={role.Arn}>
                        {role.RoleName} ({role.Arn})
                      </option>
                    ))}
                  </select>
                  {roleTrustValid === false && (
                    <div className="flex flex-col gap-2 mt-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-[11px] text-red-500 font-medium">Role cannot be assumed by Lambda</p>
                      </div>
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={handleFixRoleTrustPolicy}
                        isLoading={fixingRole}
                        className="w-fit h-6 text-[10px]"
                      >
                        Fix Trust Policy
                      </Button>
                    </div>
                  )}
                  {roleTrustValid === true && (
                    <div className="flex items-center gap-1.5 px-1 mt-1 text-[10px] text-green-500 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Role trust policy is valid for Lambda
                    </div>
                  )}

                  {checkingPermissions && (
                    <div className="flex items-center gap-1.5 px-1 mt-1 text-[10px] text-text-muted italic">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Checking permissions...
                    </div>
                  )}

                  {permissionsValid === false && (
                    <div className="flex flex-col gap-2 mt-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <p className="text-[11px] text-amber-500 font-medium leading-relaxed flex-1">
                          Missing Permissions: This role might not have access to Secrets Manager or CloudWatch Logs.
                        </p>
                      </div>
                      <Button
                        size="xs"
                        variant="warning"
                        onClick={handleFixPermissions}
                        isLoading={fixingPermissions}
                        className="w-fit h-6 text-[10px]"
                      >
                        Fix Permissions
                      </Button>
                    </div>
                  )}

                  {permissionsValid === true && (
                    <div className="flex items-center gap-1.5 px-1 mt-1 text-[10px] text-green-500 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Required permissions are present
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[10px] text-text-muted">
                  The IAM role that Lambda assumes when it executes your function.
                </p>
              </div>
            </section>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Logging Settings</h3>
              </div>
              <button
                type="button"
                onClick={resetLoggingSettings}
                className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-text-muted hover:text-amber-500 transition-colors uppercase tracking-wider bg-surface-elevated hover:bg-surface-hover border border-border-subtle rounded-md"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to Defaults
              </button>
            </div>

            <div className="space-y-4 bg-surface-elevated p-5 rounded-xl border border-border-subtle">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">
                    Log Format
                  </label>
                  <select
                    className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors text-sm"
                    value={formData.LoggingConfig.LogFormat}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        LoggingConfig: { ...formData.LoggingConfig, LogFormat: e.target.value },
                      })
                    }
                  >
                    <option value="Text">Text</option>
                    <option value="JSON">JSON</option>
                  </select>
                </div>

                <Input
                  label="Log Group"
                  placeholder="/aws/lambda/..."
                  value={formData.LoggingConfig.LogGroup}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      LoggingConfig: { ...formData.LoggingConfig, LogGroup: e.target.value },
                    })
                  }
                  accentColor="amber"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium px-0.5">
                    Application Log Level
                  </label>
                  <select
                    className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors text-sm"
                    value={formData.LoggingConfig.ApplicationLogLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        LoggingConfig: { ...formData.LoggingConfig, ApplicationLogLevel: e.target.value },
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
                    value={formData.LoggingConfig.SystemLogLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        LoggingConfig: { ...formData.LoggingConfig, SystemLogLevel: e.target.value },
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
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Environment Variables
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={quickAddAwsVariables}
                  leftIcon={<Sparkles className="w-3 h-3 text-amber-500" />}
                >
                  Quick Add AWS
                </Button>
                <Button variant="ghost" size="xs" onClick={addEnvVar} leftIcon={<Plus className="w-3 h-3" />}>
                  Add Variable
                </Button>
              </div>
            </div>
            <div className="bg-surface-elevated p-5 rounded-xl border border-border-subtle space-y-3 min-h-[155px]">
              {Object.entries(envVars).map(([key, value], idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      className="w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors text-xs font-mono"
                      placeholder="Key"
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        setEnvVars((prev) => {
                          const vars = { ...prev };
                          const val = vars[key];
                          delete vars[key];
                          vars[newKey] = val;
                          return vars;
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
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              {Object.keys(envVars).length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-6">
                  <p className="text-xs text-text-muted italic">No environment variables defined.</p>
                  <p className="text-[10px] text-text-faint mt-1">Variables will be available to your function.</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Function Code</h3>
            </div>
            <div
              className={`border-2 border-dashed rounded-xl p-10 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer ${
                isDragging
                  ? "border-amber-500 bg-amber-500/10"
                  : file
                    ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
                    : "border-border-default hover:border-amber-500/40 hover:bg-amber-500/5"
              }`}
              onClick={() => document.getElementById("file-upload")?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
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
            variant="amber"
            onClick={handleCreate}
            isLoading={loading}
            disabled={!formData.FunctionName || !file || !formData.Role}
            leftIcon={!loading && <Zap className="w-3.5 h-3.5" />}
          >
            Create Function
          </Button>
        </div>
      </div>
    </div>
  );
};

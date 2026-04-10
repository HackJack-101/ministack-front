import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Database,
  ArrowLeft,
  Shield,
  Lock,
  FileJson,
  Layers,
  Repeat,
  Tag as TagIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { useS3 } from "../hooks/useS3";
import { useToast } from "../hooks/useToast";

type TabType = "general" | "permissions" | "management" | "tags";

export const S3CreateBucket = () => {
  const navigate = useNavigate();
  const s3 = useS3();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [versioning, setVersioning] = useState<"Enabled" | "Suspended" | "Disabled">("Disabled");
  const [encryption, setEncryption] = useState(false);
  const [objectLock, setObjectLock] = useState(false);
  const [policy, setPolicy] = useState("");
  const [cors, setCors] = useState("");
  const [lifecycle, setLifecycle] = useState("");
  const [tags, setTags] = useState<{ Key: string; Value: string }[]>([]);

  const handleCreate = async () => {
    if (!name) {
      toast.error("Bucket name is required");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Bucket
      await s3.createBucket(name, objectLock);

      // 2. Apply settings sequentially (if configured)
      const tasks = [];

      if (versioning !== "Disabled") {
        tasks.push(s3.putBucketVersioning(name, versioning as any));
      }

      if (encryption) {
        tasks.push(s3.putBucketEncryption(name));
      }

      if (policy.trim()) {
        tasks.push(s3.putBucketPolicy(name, policy));
      }

      if (cors.trim() && cors !== "[]") {
        tasks.push(s3.putBucketCors(name, JSON.parse(cors)));
      }

      if (lifecycle.trim() && lifecycle !== "[]") {
        tasks.push(s3.putBucketLifecycle(name, JSON.parse(lifecycle)));
      }

      if (tags.length > 0) {
        tasks.push(s3.putBucketTagging(name, tags));
      }

      if (tasks.length > 0) {
        await Promise.all(tasks);
      }

      toast.success(`Bucket "${name}" created successfully`);
      navigate(`/s3/${name}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create bucket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/s3")}
          className="p-2 hover:bg-surface-hover rounded-full transition-colors text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title="Create S3 Bucket" subtitle="Configure your new storage bucket with custom settings" />
      </div>

      <div className="bg-surface-card border border-border-default rounded-card shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Header with Name Input */}
        <div className="p-6 border-b border-border-subtle bg-surface-elevated/30">
          <div className="max-w-md">
            <Input
              label="Bucket Name"
              placeholder="e.g. my-awesome-bucket"
              value={name}
              onChange={(e) => setName(e.target.value)}
              accentColor="blue"
              autoFocus
              required
            />
            <p className="mt-2 text-[11px] text-text-muted">
              Bucket names must be unique and follow DNS naming conventions.
            </p>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Tabs Sidebar */}
          <div className="w-48 border-r border-border-subtle bg-surface-elevated/20 p-3 space-y-1">
            <TabButton
              active={activeTab === "general"}
              onClick={() => setActiveTab("general")}
              icon={Shield}
              label="General"
            />
            <TabButton
              active={activeTab === "permissions"}
              onClick={() => setActiveTab("permissions")}
              icon={Lock}
              label="Permissions"
            />
            <TabButton
              active={activeTab === "management"}
              onClick={() => setActiveTab("management")}
              icon={Layers}
              label="Management"
            />
            <TabButton active={activeTab === "tags"} onClick={() => setActiveTab("tags")} icon={TagIcon} label="Tags" />
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-8">
              {activeTab === "general" && (
                <>
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Versioning</h3>
                    </div>
                    <div className="flex items-center gap-4 bg-surface-elevated p-4 rounded-lg border border-border-subtle">
                      <select
                        value={versioning}
                        onChange={(e) => setVersioning(e.target.value as any)}
                        className="bg-surface-input border border-border-default rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-blue-500 transition-colors min-w-[140px]"
                      >
                        <option value="Disabled">Disabled</option>
                        <option value="Enabled">Enabled</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                      <p className="text-xs text-text-muted leading-relaxed">
                        Keep multiple variants of an object in the same bucket. Once enabled, you cannot disable it,
                        only suspend it.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Encryption</h3>
                    </div>
                    <div className="flex items-center gap-3 bg-surface-elevated p-4 rounded-lg border border-border-subtle">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={encryption}
                          onChange={(e) => setEncryption(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-border-default peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm text-text-primary font-medium">Default Encryption (AES256)</span>
                      </label>
                      <p className="ml-auto text-xs text-text-muted italic">Automatically encrypt new objects.</p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Object Lock
                      </h3>
                    </div>
                    <div className="flex flex-col gap-3 bg-surface-elevated p-4 rounded-lg border border-border-subtle">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={objectLock}
                          onChange={(e) => setObjectLock(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-border-default peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm text-text-primary font-medium">Enable Object Lock</span>
                      </label>
                      <p className="text-xs text-text-muted">
                        Store objects using a write-once-read-many (WORM) model to help you prevent objects from being
                        deleted or overwritten.
                        <strong className="text-blue-500 ml-1">
                          Object lock can only be enabled during bucket creation.
                        </strong>
                      </p>
                    </div>
                  </section>
                </>
              )}

              {activeTab === "permissions" && (
                <>
                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between">
                      Bucket Policy
                      <FileJson className="w-3 h-3 text-text-faint" />
                    </h3>
                    <textarea
                      value={policy}
                      onChange={(e) => setPolicy(e.target.value)}
                      placeholder='{ "Version": "2012-10-17", "Statement": [...] }'
                      className="w-full h-40 bg-surface-input border border-border-default rounded-btn p-4 font-mono text-xs focus:outline-none focus:border-blue-500 text-text-primary resize-none transition-colors"
                    />
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between">
                      CORS configuration
                      <Repeat className="w-3 h-3 text-text-faint" />
                    </h3>
                    <textarea
                      value={cors}
                      onChange={(e) => setCors(e.target.value)}
                      placeholder="[]"
                      className="w-full h-32 bg-surface-input border border-border-default rounded-btn p-4 font-mono text-xs focus:outline-none focus:border-blue-500 text-text-primary resize-none transition-colors"
                    />
                  </section>
                </>
              )}

              {activeTab === "management" && (
                <>
                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between">
                      Lifecycle rules
                      <Layers className="w-3 h-3 text-text-faint" />
                    </h3>
                    <textarea
                      value={lifecycle}
                      onChange={(e) => setLifecycle(e.target.value)}
                      placeholder="[]"
                      className="w-full h-40 bg-surface-input border border-border-default rounded-btn p-4 font-mono text-xs focus:outline-none focus:border-blue-500 text-text-primary resize-none transition-colors"
                    />
                  </section>
                </>
              )}

              {activeTab === "tags" && (
                <section className="space-y-4">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between">
                    Tags
                    <TagIcon className="w-3 h-3 text-text-faint" />
                  </h3>
                  <div className="space-y-3">
                    {tags.length === 0 ? (
                      <div className="p-8 border-2 border-dashed border-border-subtle rounded-xl text-center">
                        <p className="text-xs text-text-muted">No tags added yet.</p>
                      </div>
                    ) : (
                      tags.map((tag, idx) => (
                        <div key={idx} className="flex gap-3 animate-in slide-in-from-left-2 duration-200">
                          <input
                            placeholder="Key"
                            value={tag.Key}
                            onChange={(e) => {
                              const newTags = [...tags];
                              newTags[idx].Key = e.target.value;
                              setTags(newTags);
                            }}
                            className="flex-1 bg-surface-input border border-border-default rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          />
                          <input
                            placeholder="Value"
                            value={tag.Value}
                            onChange={(e) => {
                              const newTags = [...tags];
                              newTags[idx].Value = e.target.value;
                              setTags(newTags);
                            }}
                            className="flex-1 bg-surface-input border border-border-default rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTags([...tags, { Key: "", Value: "" }])}
                      className="w-full !justify-center gap-2 border border-dashed border-border-subtle hover:border-blue-500/50"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Tag
                    </Button>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-subtle bg-surface-elevated/30 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate("/s3")} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} isLoading={loading} disabled={!name}>
            Create Bucket
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}

const TabButton = ({ active, onClick, icon: Icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
        : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

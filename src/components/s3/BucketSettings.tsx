import { useState, useEffect, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Shield,
  Lock,
  FileJson,
  RefreshCw,
  Trash2,
  Plus,
  Activity,
  Bell,
  Layers,
  Repeat,
  Tag as TagIcon,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import {
  useS3,
  type NotificationConfiguration,
  type ServerSideEncryptionRule,
  type LoggingEnabled,
  type ReplicationConfiguration,
  type ObjectLockConfiguration,
  type BucketVersioningStatus,
} from "../../hooks/useS3";
import { useToast } from "../../hooks/useToast";
import { NotificationSettings } from "./NotificationSettings";

interface BucketSettingsProps {
  bucketName: string;
}

type TabType = "general" | "permissions" | "management" | "notifications" | "logging" | "tags";

export const BucketSettings = ({ bucketName }: BucketSettingsProps) => {
  const {
    getBucketVersioning,
    getBucketEncryption,
    getBucketPolicy,
    getBucketCors,
    getBucketLifecycle,
    getBucketLogging,
    getBucketNotification,
    getBucketReplication,
    getObjectLockConfiguration,
    getBucketTagging,
    putBucketVersioning,
    putBucketEncryption,
    deleteBucketEncryption,
    putBucketPolicy,
    deleteBucketPolicy,
    putBucketCors,
    deleteBucketCors,
    putBucketLifecycle,
    deleteBucketLifecycle,
    putBucketNotification,
    putBucketTagging,
    deleteBucketTagging,
  } = useS3();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [versioning, setVersioning] = useState<BucketVersioningStatus | "Disabled">("Disabled");
  const [encryption, setEncryption] = useState<ServerSideEncryptionRule | null | undefined>(null);
  const [policy, setPolicy] = useState("");
  const [cors, setCors] = useState("");
  const [lifecycle, setLifecycle] = useState("");
  const [logging, setLogging] = useState<LoggingEnabled | null>(null);
  const [notifications, setNotifications] = useState<NotificationConfiguration | null>(null);
  const [replication, setReplication] = useState<ReplicationConfiguration | null>(null);
  const [objectLock, setObjectLock] = useState<ObjectLockConfiguration | null>(null);
  const [tags, setTags] = useState<{ Key: string; Value: string }[]>([]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [v, enc, pol, c, l, log, n, r, ol, t] = await Promise.all([
        getBucketVersioning(bucketName),
        getBucketEncryption(bucketName),
        getBucketPolicy(bucketName),
        getBucketCors(bucketName),
        getBucketLifecycle(bucketName),
        getBucketLogging(bucketName),
        getBucketNotification(bucketName),
        getBucketReplication(bucketName),
        getObjectLockConfiguration(bucketName),
        getBucketTagging(bucketName),
      ]);

      setVersioning(v as BucketVersioningStatus | "Disabled");
      setEncryption(enc || null);
      setPolicy(pol);
      setCors(JSON.stringify(c, null, 2));
      setLifecycle(JSON.stringify(l, null, 2));
      setLogging(log || null);
      setNotifications(n);
      setReplication(r || null);
      setObjectLock(ol || null);
      setTags((t || []).map((tag) => ({ Key: tag.Key || "", Value: tag.Value || "" })));
    } catch (err) {
      console.error("Failed to load bucket settings", err);
    } finally {
      setLoading(false);
    }
  }, [
    bucketName,
    getBucketVersioning,
    getBucketEncryption,
    getBucketPolicy,
    getBucketCors,
    getBucketLifecycle,
    getBucketLogging,
    getBucketNotification,
    getBucketReplication,
    getObjectLockConfiguration,
    getBucketTagging,
  ]);

  useEffect(() => {
    if (bucketName) {
      loadSettings();
    }
  }, [bucketName, loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "general") {
        if (versioning !== "Disabled") {
          await putBucketVersioning(bucketName, versioning as BucketVersioningStatus);
        }
        if (encryption) {
          await putBucketEncryption(bucketName);
        } else {
          await deleteBucketEncryption(bucketName);
        }
      } else if (activeTab === "permissions") {
        if (policy.trim()) {
          await putBucketPolicy(bucketName, policy);
        } else {
          await deleteBucketPolicy(bucketName);
        }

        if (cors.trim() && cors !== "[]") {
          await putBucketCors(bucketName, JSON.parse(cors));
        } else {
          await deleteBucketCors(bucketName);
        }
      } else if (activeTab === "management") {
        if (lifecycle.trim() && lifecycle !== "[]") {
          await putBucketLifecycle(bucketName, JSON.parse(lifecycle));
        } else {
          await deleteBucketLifecycle(bucketName);
        }
      } else if (activeTab === "notifications") {
        if (notifications) {
          await putBucketNotification(bucketName, notifications);
        }
      } else if (activeTab === "tags") {
        if (tags.length > 0) {
          await putBucketTagging(bucketName, tags);
        } else {
          await deleteBucketTagging(bucketName);
        }
      }
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface-card border border-border-default rounded-card shadow-sm flex flex-col overflow-hidden min-h-[500px]">
      <div className="flex-1 flex overflow-hidden">
        {/* Tabs Sidebar */}
        <div className="w-48 border-r border-border-subtle bg-surface-elevated/50 p-3 space-y-1">
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
          <TabButton
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
            icon={Bell}
            label="Notifications"
          />
          <TabButton
            active={activeTab === "logging"}
            onClick={() => setActiveTab("logging")}
            icon={Activity}
            label="Logging"
          />
          <TabButton active={activeTab === "tags"} onClick={() => setActiveTab("tags")} icon={TagIcon} label="Tags" />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="h-full flex items-center justify-center py-20">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="space-y-8 max-w-2xl">
              {activeTab === "general" && (
                <>
                  <section className="space-y-4">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Versioning</h3>
                    <div className="flex items-center gap-4 bg-surface-elevated p-4 rounded-xl border border-border-subtle">
                      <select
                        value={versioning}
                        onChange={(e) => setVersioning(e.target.value as BucketVersioningStatus)}
                        className="bg-surface-input border border-border-default rounded px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-blue-500/60 transition-colors"
                      >
                        <option value="Disabled">Disabled</option>
                        <option value="Enabled">Enabled</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                      <p className="text-xs text-text-muted">Keep multiple variants of an object in the same bucket.</p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Encryption</h3>
                    <div className="flex items-center gap-4 bg-surface-elevated p-4 rounded-xl border border-border-subtle">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!encryption}
                          onChange={(e) =>
                            setEncryption(
                              e.target.checked
                                ? { ApplyServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } }
                                : null,
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-border-default peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm text-text-primary font-medium">Default Encryption (AES256)</span>
                      </label>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Object Lock</h3>
                    <div className="p-4 rounded-xl border border-border-subtle bg-surface-elevated flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Object Lock status:</span>
                      <span
                        className={`text-xs font-mono px-2 py-1 rounded-md ${objectLock?.ObjectLockEnabled === "Enabled" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-text-faint/10 text-text-faint border border-border-subtle"}`}
                      >
                        {objectLock?.ObjectLockEnabled || "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted italic px-1">
                      * Object lock can only be enabled during bucket creation.
                    </p>
                  </section>
                </>
              )}

              {activeTab === "permissions" && (
                <>
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Bucket Policy
                      </h3>
                      <FileJson className="w-4 h-4 text-text-faint" />
                    </div>
                    <textarea
                      value={policy}
                      onChange={(e) => setPolicy(e.target.value)}
                      placeholder='{ "Version": "2012-10-17", "Statement": [...] }'
                      className="w-full h-48 bg-surface-input border border-border-default rounded-btn p-4 font-mono text-xs focus:outline-none focus:border-blue-500/60 text-text-primary resize-none transition-colors"
                    />
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        CORS configuration
                      </h3>
                      <Repeat className="w-4 h-4 text-text-faint" />
                    </div>
                    <textarea
                      value={cors}
                      onChange={(e) => setCors(e.target.value)}
                      placeholder="[]"
                      className="w-full h-48 bg-surface-input border border-border-default rounded-btn p-4 font-mono text-xs focus:outline-none focus:border-blue-500/60 text-text-primary resize-none transition-colors"
                    />
                  </section>
                </>
              )}

              {activeTab === "management" && (
                <>
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Lifecycle rules
                      </h3>
                      <Layers className="w-4 h-4 text-text-faint" />
                    </div>
                    <textarea
                      value={lifecycle}
                      onChange={(e) => setLifecycle(e.target.value)}
                      placeholder="[]"
                      className="w-full h-48 bg-surface-input border border-border-default rounded-btn p-4 font-mono text-xs focus:outline-none focus:border-blue-500/60 text-text-primary resize-none transition-colors"
                    />
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Replication
                      </h3>
                      <Repeat className="w-4 h-4 text-text-faint" />
                    </div>
                    <div className="bg-surface-elevated border border-border-subtle p-4 rounded-xl">
                      <p className="text-sm text-text-muted">
                        {replication ? "Replication is configured." : "No replication rules configured."}
                      </p>
                    </div>
                  </section>
                </>
              )}

              {activeTab === "notifications" && (
                <NotificationSettings config={notifications} onChange={setNotifications} />
              )}

              {activeTab === "logging" && (
                <>
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Logging</h3>
                      <Activity className="w-4 h-4 text-text-faint" />
                    </div>
                    <div className="bg-surface-elevated border border-border-subtle p-4 rounded-xl">
                      <p className="text-sm text-text-muted">
                        {logging ? "Server access logging is enabled." : "Server access logging is disabled."}
                      </p>
                    </div>
                  </section>
                </>
              )}

              {activeTab === "tags" && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Tags</h3>
                    <TagIcon className="w-4 h-4 text-text-faint" />
                  </div>
                  <div className="space-y-3">
                    {tags.map((tag, idx) => (
                      <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
                        <input
                          placeholder="Key"
                          value={tag.Key}
                          onChange={(e) => {
                            const newTags = [...tags];
                            newTags[idx].Key = e.target.value;
                            setTags(newTags);
                          }}
                          className="flex-1 bg-surface-input border border-border-default rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-blue-500/60"
                        />
                        <input
                          placeholder="Value"
                          value={tag.Value}
                          onChange={(e) => {
                            const newTags = [...tags];
                            newTags[idx].Value = e.target.value;
                            setTags(newTags);
                          }}
                          className="flex-1 bg-surface-input border border-border-default rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-blue-500/60"
                        />
                        <button
                          onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-btn transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTags([...tags, { Key: "", Value: "" }])}
                      className="w-full !justify-center gap-2 border border-dashed border-border-default hover:border-blue-500/50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Tag
                    </Button>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border-subtle flex justify-between items-center bg-surface-elevated/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSettings}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
        >
          Reload Settings
        </Button>
        <div className="flex gap-3">
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
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

import { useState, useEffect } from "react";
import { 
  X, 
  Settings, 
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
  Tag as TagIcon
} from "lucide-react";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { useS3 } from "../../hooks/useS3";
import { useToast } from "../../hooks/useToast";

interface BucketSettingsModalProps {
  bucketName: string;
  open: boolean;
  onClose: () => void;
}

type TabType = "general" | "permissions" | "management" | "logging" | "tags";

export const BucketSettingsModal = ({ bucketName, open, onClose }: BucketSettingsModalProps) => {
  const s3 = useS3();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [versioning, setVersioning] = useState<"Enabled" | "Suspended" | "Disabled">("Disabled");
  const [encryption, setEncryption] = useState<any>(null);
  const [policy, setPolicy] = useState("");
  const [cors, setCors] = useState("");
  const [lifecycle, setLifecycle] = useState("");
  const [logging, setLogging] = useState<any>(null);
  const [notifications, setNotifications] = useState<any>(null);
  const [replication, setReplication] = useState<any>(null);
  const [objectLock, setObjectLock] = useState<any>(null);
  const [tags, setTags] = useState<{ Key: string; Value: string }[]>([]);

  useEffect(() => {
    if (open && bucketName) {
      loadSettings();
    }
  }, [open, bucketName]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [
        v, enc, pol, c, l, log, n, r, ol, t
      ] = await Promise.all([
        s3.getBucketVersioning(bucketName),
        s3.getBucketEncryption(bucketName),
        s3.getBucketPolicy(bucketName),
        s3.getBucketCors(bucketName),
        s3.getBucketLifecycle(bucketName),
        s3.getBucketLogging(bucketName),
        s3.getBucketNotification(bucketName),
        s3.getBucketReplication(bucketName),
        s3.getObjectLockConfiguration(bucketName),
        s3.getBucketTagging(bucketName)
      ]);

      setVersioning(v as any);
      setEncryption(enc);
      setPolicy(pol);
      setCors(JSON.stringify(c, null, 2));
      setLifecycle(JSON.stringify(l, null, 2));
      setLogging(log);
      setNotifications(n);
      setReplication(r);
      setObjectLock(ol);
      setTags((t || []).map(tag => ({ Key: tag.Key || "", Value: tag.Value || "" })));
    } catch (err) {
      console.error("Failed to load bucket settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "general") {
        if (versioning !== "Disabled") {
          await s3.putBucketVersioning(bucketName, versioning as any);
        }
        // Simplified encryption save: just toggle default AES256 for now
        if (encryption) {
          await s3.putBucketEncryption(bucketName);
        } else {
          await s3.deleteBucketEncryption(bucketName);
        }
      } else if (activeTab === "permissions") {
        if (policy.trim()) {
          await s3.putBucketPolicy(bucketName, policy);
        } else {
          await s3.deleteBucketPolicy(bucketName);
        }
        
        if (cors.trim() && cors !== "[]") {
          await s3.putBucketCors(bucketName, JSON.parse(cors));
        } else {
          await s3.deleteBucketCors(bucketName);
        }
      } else if (activeTab === "management") {
        if (lifecycle.trim() && lifecycle !== "[]") {
          await s3.putBucketLifecycle(bucketName, JSON.parse(lifecycle));
        } else {
          await s3.deleteBucketLifecycle(bucketName);
        }
      } else if (activeTab === "tags") {
        if (tags.length > 0) {
          await s3.putBucketTagging(bucketName, tags);
        } else {
          await s3.deleteBucketTagging(bucketName);
        }
      }
      toast.success("Settings updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-default rounded-card shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Settings className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Bucket Settings</h2>
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">{bucketName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-text-faint hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Tabs Sidebar */}
          <div className="w-40 border-r border-border-subtle bg-surface-elevated/50 p-2 space-y-1">
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
              active={activeTab === "logging"} 
              onClick={() => setActiveTab("logging")} 
              icon={Activity} 
              label="Logging" 
            />
            <TabButton 
              active={activeTab === "tags"} 
              onClick={() => setActiveTab("tags")} 
              icon={TagIcon} 
              label="Tags" 
            />
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : (
              <div className="space-y-6">
                {activeTab === "general" && (
                  <>
                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Versioning</h3>
                      <div className="flex items-center gap-3 bg-surface-elevated p-3 rounded-lg border border-border-subtle">
                        <select 
                          value={versioning}
                          onChange={(e) => setVersioning(e.target.value as any)}
                          className="bg-surface-input border border-border-default rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-blue-500/60 transition-colors"
                        >
                          <option value="Disabled">Disabled</option>
                          <option value="Enabled">Enabled</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                        <p className="text-[10px] text-text-muted">
                          Keep multiple variants of an object in the same bucket.
                        </p>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Encryption</h3>
                      <div className="flex items-center gap-3 bg-surface-elevated p-3 rounded-lg border border-border-subtle">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={!!encryption} 
                            onChange={(e) => setEncryption(e.target.checked ? { SSEAlgorithm: "AES256" } : null)}
                            className="sr-only peer" 
                          />
                          <div className="w-8 h-4 bg-border-default peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-2 text-xs text-text-primary">Default Encryption (AES256)</span>
                        </label>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Object Lock</h3>
                      <div className="p-3 rounded-lg border border-border-subtle bg-surface-elevated flex items-center justify-between">
                        <span className="text-xs text-text-muted">Object Lock status:</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${objectLock?.ObjectLockEnabled === "Enabled" ? "bg-emerald-500/10 text-emerald-500" : "bg-text-faint/10 text-text-faint"}`}>
                          {objectLock?.ObjectLockEnabled || "Disabled"}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted italic">
                        * Object lock can only be enabled during bucket creation.
                      </p>
                    </section>
                  </>
                )}

                {activeTab === "permissions" && (
                  <>
                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between">
                        Bucket Policy
                        <FileJson className="w-3 h-3" />
                      </h3>
                      <textarea
                        value={policy}
                        onChange={(e) => setPolicy(e.target.value)}
                        placeholder='{ "Version": "2012-10-17", "Statement": [...] }'
                        className="w-full h-32 bg-surface-input border border-border-default rounded-btn p-3 font-mono text-[11px] focus:outline-none focus:border-blue-500/60 text-text-primary resize-none transition-colors"
                      />
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between">
                        CORS configuration
                        <Repeat className="w-3 h-3" />
                      </h3>
                      <textarea
                        value={cors}
                        onChange={(e) => setCors(e.target.value)}
                        placeholder="[]"
                        className="w-full h-32 bg-surface-input border border-border-default rounded-btn p-3 font-mono text-[11px] focus:outline-none focus:border-blue-500/60 text-text-primary resize-none transition-colors"
                      />
                    </section>
                  </>
                )}

                {activeTab === "management" && (
                  <>
                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between">
                        Lifecycle rules
                        <Layers className="w-3 h-3" />
                      </h3>
                      <textarea
                        value={lifecycle}
                        onChange={(e) => setLifecycle(e.target.value)}
                        placeholder="[]"
                        className="w-full h-32 bg-surface-input border border-border-default rounded-btn p-3 font-mono text-[11px] focus:outline-none focus:border-blue-500/60 text-text-primary resize-none transition-colors"
                      />
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between">
                        Replication
                        <Repeat className="w-3 h-3" />
                      </h3>
                      <div className="bg-surface-elevated border border-border-subtle p-3 rounded-lg">
                        <p className="text-xs text-text-muted">
                          {replication ? "Replication is configured." : "No replication rules configured."}
                        </p>
                      </div>
                    </section>
                  </>
                )}

                {activeTab === "logging" && (
                  <>
                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between">
                        Logging
                        <Activity className="w-3 h-3" />
                      </h3>
                      <div className="bg-surface-elevated border border-border-subtle p-3 rounded-lg">
                        <p className="text-xs text-text-muted">
                          {logging ? "Server access logging is enabled." : "Server access logging is disabled."}
                        </p>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between">
                        Event notifications
                        <Bell className="w-3 h-3" />
                      </h3>
                      <div className="bg-surface-elevated border border-border-subtle p-3 rounded-lg">
                        <p className="text-xs text-text-muted">
                          {notifications ? "Notifications are configured." : "No event notifications configured."}
                        </p>
                      </div>
                    </section>
                  </>
                )}

                {activeTab === "tags" && (
                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center justify-between">
                      Tags
                      <TagIcon className="w-3 h-3" />
                    </h3>
                    <div className="space-y-2">
                      {tags.map((tag, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            placeholder="Key"
                            value={tag.Key}
                            onChange={(e) => {
                              const newTags = [...tags];
                              newTags[idx].Key = e.target.value;
                              setTags(newTags);
                            }}
                            className="flex-1 bg-surface-input border border-border-default rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500/60"
                          />
                          <input 
                            placeholder="Value"
                            value={tag.Value}
                            onChange={(e) => {
                              const newTags = [...tags];
                              newTags[idx].Value = e.target.value;
                              setTags(newTags);
                            }}
                            className="flex-1 bg-surface-input border border-border-default rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500/60"
                          />
                          <button 
                            onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setTags([...tags, { Key: "", Value: "" }])}
                        className="w-full !justify-center gap-1.5"
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

        <div className="p-4 border-t border-border-subtle flex justify-between bg-surface-elevated/30">
          <Button variant="ghost" size="sm" onClick={loadSettings} leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}>
            Reload
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
              Save Changes
            </Button>
          </div>
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
    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      active 
        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
        : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
    }`}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

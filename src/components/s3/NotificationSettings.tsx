import React, { useState, useEffect } from "react";
import { Trash2, Plus, Zap, MessageSquare, BellRing, Globe } from "lucide-react";
import { Button } from "../ui/Button";
import { useLambda } from "../../hooks/useLambda";
import { useSQS } from "../../hooks/useSQS";
import { useSNS } from "../../hooks/useSNS";
import type { NotificationConfiguration, Event } from "@aws-sdk/client-s3";

interface NotificationSettingsProps {
  config: NotificationConfiguration | null;
  onChange: (config: NotificationConfiguration) => void;
}

const COMMON_EVENTS: { label: string; value: Event }[] = [
  { label: "All object create events", value: "s3:ObjectCreated:*" },
  { label: "Put", value: "s3:ObjectCreated:Put" },
  { label: "Post", value: "s3:ObjectCreated:Post" },
  { label: "Copy", value: "s3:ObjectCreated:Copy" },
  { label: "Complete Multipart Upload", value: "s3:ObjectCreated:CompleteMultipartUpload" },
  { label: "All object removal events", value: "s3:ObjectRemoved:*" },
  { label: "Delete", value: "s3:ObjectRemoved:Delete" },
  { label: "Delete Marker Created", value: "s3:ObjectRemoved:DeleteMarkerCreated" },
  { label: "All restore events", value: "s3:ObjectRestore:*" },
  { label: "All replication events", value: "s3:Replication:*" },
];

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ config, onChange }) => {
  const { functions } = useLambda();
  const { queues } = useSQS();
  const { topics } = useSNS();

  const [localConfig, setLocalConfig] = useState<NotificationConfiguration>(config || {});

  useEffect(() => {
    setLocalConfig(config || {});
  }, [config]);

  const updateConfig = (newConfig: NotificationConfiguration) => {
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const addLambdaConfig = () => {
    const newConfig = { ...localConfig };
    newConfig.LambdaFunctionConfigurations = [
      ...(newConfig.LambdaFunctionConfigurations || []),
      { LambdaFunctionArn: "", Events: ["s3:ObjectCreated:*"] as Event[], Id: `lambda-${Date.now()}` },
    ];
    updateConfig(newConfig);
  };

  const addQueueConfig = () => {
    const newConfig = { ...localConfig };
    newConfig.QueueConfigurations = [
      ...(newConfig.QueueConfigurations || []),
      { QueueArn: "", Events: ["s3:ObjectCreated:*"] as Event[], Id: `queue-${Date.now()}` },
    ];
    updateConfig(newConfig);
  };

  const addTopicConfig = () => {
    const newConfig = { ...localConfig };
    newConfig.TopicConfigurations = [
      ...(newConfig.TopicConfigurations || []),
      { TopicArn: "", Events: ["s3:ObjectCreated:*"] as Event[], Id: `topic-${Date.now()}` },
    ];
    updateConfig(newConfig);
  };

  const removeConfig = (type: "lambda" | "queue" | "topic", index: number) => {
    const newConfig = { ...localConfig };
    if (type === "lambda") {
      newConfig.LambdaFunctionConfigurations = newConfig.LambdaFunctionConfigurations?.filter((_, i) => i !== index);
    } else if (type === "queue") {
      newConfig.QueueConfigurations = newConfig.QueueConfigurations?.filter((_, i) => i !== index);
    } else if (type === "topic") {
      newConfig.TopicConfigurations = newConfig.TopicConfigurations?.filter((_, i) => i !== index);
    }
    updateConfig(newConfig);
  };

  const updateItem = (type: "lambda" | "queue" | "topic", index: number, field: string, value: any) => {
    const newConfig = { ...localConfig };
    if (type === "lambda") {
      const items = [...(newConfig.LambdaFunctionConfigurations || [])];
      items[index] = { ...items[index], [field]: value };
      newConfig.LambdaFunctionConfigurations = items;
    } else if (type === "queue") {
      const items = [...(newConfig.QueueConfigurations || [])];
      items[index] = { ...items[index], [field]: value };
      newConfig.QueueConfigurations = items;
    } else if (type === "topic") {
      const items = [...(newConfig.TopicConfigurations || [])];
      items[index] = { ...items[index], [field]: value };
      newConfig.TopicConfigurations = items;
    }
    updateConfig(newConfig);
  };

  const updateFilter = (
    type: "lambda" | "queue" | "topic",
    index: number,
    filterType: "Prefix" | "Suffix",
    value: string,
  ) => {
    const newConfig = { ...localConfig };
    let item: any;
    if (type === "lambda") item = { ...newConfig.LambdaFunctionConfigurations![index] };
    else if (type === "queue") item = { ...newConfig.QueueConfigurations![index] };
    else if (type === "topic") item = { ...newConfig.TopicConfigurations![index] };

    const rules = [...(item.Filter?.Key?.FilterRules || [])];
    const existingIdx = rules.findIndex((r) => r.Name === filterType);

    if (value) {
      if (existingIdx >= 0) {
        rules[existingIdx] = { Name: filterType, Value: value };
      } else {
        rules.push({ Name: filterType, Value: value });
      }
    } else {
      if (existingIdx >= 0) {
        rules.splice(existingIdx, 1);
      }
    }

    item.Filter = { Key: { FilterRules: rules } };

    if (type === "lambda") {
      const items = [...newConfig.LambdaFunctionConfigurations!];
      items[index] = item;
      newConfig.LambdaFunctionConfigurations = items;
    } else if (type === "queue") {
      const items = [...newConfig.QueueConfigurations!];
      items[index] = item;
      newConfig.QueueConfigurations = items;
    } else if (type === "topic") {
      const items = [...newConfig.TopicConfigurations!];
      items[index] = item;
      newConfig.TopicConfigurations = items;
    }
    updateConfig(newConfig);
  };

  const getFilterValue = (item: any, filterType: "Prefix" | "Suffix") => {
    return item.Filter?.Key?.FilterRules?.find((r: any) => r.Name === filterType)?.Value || "";
  };

  return (
    <div className="space-y-8">
      {/* Lambda Configurations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Lambda Function Notifications
            </h3>
          </div>
          <Button variant="ghost" size="xs" onClick={addLambdaConfig} leftIcon={<Plus className="w-3 h-3" />}>
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {(localConfig.LambdaFunctionConfigurations || []).map((config, idx) => (
            <NotificationItem
              key={config.Id || idx}
              icon={Zap}
              color="amber"
              title="Lambda Function"
              onRemove={() => removeConfig("lambda", idx)}
            >
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase">Target Function</label>
                  <select
                    value={config.LambdaFunctionArn}
                    onChange={(e) => updateItem("lambda", idx, "LambdaFunctionArn", e.target.value)}
                    className="w-full bg-surface-input border border-border-default rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors"
                  >
                    <option value="">Select a function...</option>
                    {functions.map((f) => (
                      <option key={f.FunctionArn} value={f.FunctionArn}>
                        {f.FunctionName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase">Events</label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {COMMON_EVENTS.map((ev) => (
                      <label key={ev.value} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={config.Events?.includes(ev.value)}
                          onChange={(e) => {
                            const events = [...(config.Events || [])];
                            if (e.target.checked) events.push(ev.value);
                            else {
                              const i = events.indexOf(ev.value);
                              if (i >= 0) events.splice(i, 1);
                            }
                            updateItem("lambda", idx, "Events", events);
                          }}
                          className="w-3 h-3 rounded border-border-default text-amber-500 focus:ring-amber-500/20 bg-surface-input"
                        />
                        <span className="text-[10px] text-text-secondary group-hover:text-text-primary transition-colors">
                          {ev.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase">Prefix Filter</label>
                    <input
                      placeholder="images/"
                      value={getFilterValue(config, "Prefix")}
                      onChange={(e) => updateFilter("lambda", idx, "Prefix", e.target.value)}
                      className="w-full bg-surface-input border border-border-default rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase">Suffix Filter</label>
                    <input
                      placeholder=".jpg"
                      value={getFilterValue(config, "Suffix")}
                      onChange={(e) => updateFilter("lambda", idx, "Suffix", e.target.value)}
                      className="w-full bg-surface-input border border-border-default rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-amber-500/60 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </NotificationItem>
          ))}
          {(!localConfig.LambdaFunctionConfigurations || localConfig.LambdaFunctionConfigurations.length === 0) && (
            <div className="text-center py-6 bg-surface-elevated/30 border border-dashed border-border-subtle rounded-lg">
              <p className="text-[11px] text-text-faint italic">No Lambda notifications configured</p>
            </div>
          )}
        </div>
      </section>

      {/* SQS Configurations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              SQS Queue Notifications
            </h3>
          </div>
          <Button variant="ghost" size="xs" onClick={addQueueConfig} leftIcon={<Plus className="w-3 h-3" />}>
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {(localConfig.QueueConfigurations || []).map((config, idx) => (
            <NotificationItem
              key={config.Id || idx}
              icon={MessageSquare}
              color="orange"
              title="SQS Queue"
              onRemove={() => removeConfig("queue", idx)}
            >
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase">Target Queue</label>
                  <select
                    value={config.QueueArn}
                    onChange={(e) => updateItem("queue", idx, "QueueArn", e.target.value)}
                    className="w-full bg-surface-input border border-border-default rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-orange-500/60 transition-colors"
                  >
                    <option value="">Select a queue...</option>
                    {queues.map((q) => (
                      <option key={q.arn} value={q.arn}>
                        {q.url.split("/").pop()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase">Events</label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {COMMON_EVENTS.map((ev) => (
                      <label key={ev.value} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={config.Events?.includes(ev.value)}
                          onChange={(e) => {
                            const events = [...(config.Events || [])];
                            if (e.target.checked) events.push(ev.value);
                            else {
                              const i = events.indexOf(ev.value);
                              if (i >= 0) events.splice(i, 1);
                            }
                            updateItem("queue", idx, "Events", events);
                          }}
                          className="w-3 h-3 rounded border-border-default text-orange-500 focus:ring-orange-500/20 bg-surface-input"
                        />
                        <span className="text-[10px] text-text-secondary group-hover:text-text-primary transition-colors">
                          {ev.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase">Prefix Filter</label>
                    <input
                      placeholder="logs/"
                      value={getFilterValue(config, "Prefix")}
                      onChange={(e) => updateFilter("queue", idx, "Prefix", e.target.value)}
                      className="w-full bg-surface-input border border-border-default rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-orange-500/60 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase">Suffix Filter</label>
                    <input
                      placeholder=".log"
                      value={getFilterValue(config, "Suffix")}
                      onChange={(e) => updateFilter("queue", idx, "Suffix", e.target.value)}
                      className="w-full bg-surface-input border border-border-default rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-orange-500/60 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </NotificationItem>
          ))}
          {(!localConfig.QueueConfigurations || localConfig.QueueConfigurations.length === 0) && (
            <div className="text-center py-6 bg-surface-elevated/30 border border-dashed border-border-subtle rounded-lg">
              <p className="text-[11px] text-text-faint italic">No SQS notifications configured</p>
            </div>
          )}
        </div>
      </section>

      {/* SNS Configurations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              SNS Topic Notifications
            </h3>
          </div>
          <Button variant="ghost" size="xs" onClick={addTopicConfig} leftIcon={<Plus className="w-3 h-3" />}>
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {(localConfig.TopicConfigurations || []).map((config, idx) => (
            <NotificationItem
              key={config.Id || idx}
              icon={BellRing}
              color="red"
              title="SNS Topic"
              onRemove={() => removeConfig("topic", idx)}
            >
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase">Target Topic</label>
                  <select
                    value={config.TopicArn}
                    onChange={(e) => updateItem("topic", idx, "TopicArn", e.target.value)}
                    className="w-full bg-surface-input border border-border-default rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-red-500/60 transition-colors"
                  >
                    <option value="">Select a topic...</option>
                    {topics.map((t) => (
                      <option key={t.TopicArn} value={t.TopicArn}>
                        {t.TopicArn?.split(":").pop()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase">Events</label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {COMMON_EVENTS.map((ev) => (
                      <label key={ev.value} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={config.Events?.includes(ev.value)}
                          onChange={(e) => {
                            const events = [...(config.Events || [])];
                            if (e.target.checked) events.push(ev.value);
                            else {
                              const i = events.indexOf(ev.value);
                              if (i >= 0) events.splice(i, 1);
                            }
                            updateItem("topic", idx, "Events", events);
                          }}
                          className="w-3 h-3 rounded border-border-default text-red-500 focus:ring-red-500/20 bg-surface-input"
                        />
                        <span className="text-[10px] text-text-secondary group-hover:text-text-primary transition-colors">
                          {ev.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase">Prefix Filter</label>
                    <input
                      placeholder="uploads/"
                      value={getFilterValue(config, "Prefix")}
                      onChange={(e) => updateFilter("topic", idx, "Prefix", e.target.value)}
                      className="w-full bg-surface-input border border-border-default rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-red-500/60 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase">Suffix Filter</label>
                    <input
                      placeholder=".png"
                      value={getFilterValue(config, "Suffix")}
                      onChange={(e) => updateFilter("topic", idx, "Suffix", e.target.value)}
                      className="w-full bg-surface-input border border-border-default rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-red-500/60 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </NotificationItem>
          ))}
          {(!localConfig.TopicConfigurations || localConfig.TopicConfigurations.length === 0) && (
            <div className="text-center py-6 bg-surface-elevated/30 border border-dashed border-border-subtle rounded-lg">
              <p className="text-[11px] text-text-faint italic">No SNS notifications configured</p>
            </div>
          )}
        </div>
      </section>

      {/* EventBridge */}
      <section className="space-y-4 pt-4 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-500" />
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Amazon EventBridge</h3>
          </div>
        </div>
        <div className="bg-surface-elevated p-4 rounded-lg border border-border-subtle">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!localConfig.EventBridgeConfiguration}
              onChange={(e) =>
                updateConfig({ ...localConfig, EventBridgeConfiguration: e.target.checked ? {} : undefined })
              }
              className="w-4 h-4 rounded border-border-default text-sky-500 focus:ring-sky-500/20 bg-surface-input"
            />
            <div>
              <p className="text-xs font-medium text-text-primary">Send notifications to Amazon EventBridge</p>
              <p className="text-[10px] text-text-muted">
                Enabling this sends all S3 bucket events to the default EventBridge bus.
              </p>
            </div>
          </label>
        </div>
      </section>
    </div>
  );
};

interface NotificationItemProps {
  icon: any;
  color: string;
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ icon: Icon, color, title, onRemove, children }) => {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden shadow-sm">
      <div className={`px-3 py-2 border-b border-border-subtle flex items-center justify-between bg-surface-elevated/50`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 text-${color}-500`} />
          <span className="text-[11px] font-semibold text-text-primary">{title}</span>
        </div>
        <button
          onClick={onRemove}
          className="p-1 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="p-4 bg-surface-card/50">{children}</div>
    </div>
  );
};

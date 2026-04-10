import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreateTopicCommand } from "@aws-sdk/client-sns";
import { snsClient } from "../services/awsClients";
import { Plus, RefreshCw, Bell, Send, ArrowLeft, Users, Info, Trash2 } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { useSNS } from "../hooks/useSNS";
import { useLambda } from "../hooks/useLambda";
import { useSQS } from "../hooks/useSQS";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { Input, TextArea } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { CreateTopicModal } from "../components/sns/CreateTopicModal";
import type { Subscription } from "@aws-sdk/client-sns";

const SNS: React.FC = () => {
  const { topicArn } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm, ConfirmModalComponent } = useConfirmModal();
  const { topics, loading, fetchTopics, deleteTopic, listSubscriptions, subscribe, unsubscribe, publish } = useSNS();
  const { functions } = useLambda();
  const { queues } = useSQS();
  const [activeTab, setActiveTab] = useState<"publish" | "subscriptions">("publish");
  const [selectedTopicArn, setSelectedTopicArn] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [publishSubject, setPublishSubject] = useState("");
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [newSubProtocol, setNewSubProtocol] = useState("sqs");
  const [newSubEndpoint, setNewSubEndpoint] = useState("");

  const fetchSubscriptions = useCallback(async (arn: string) => {
    setLoadingSubscriptions(true);
    try {
      const subs = await listSubscriptions(arn);
      setSubscriptions(subs);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch subscriptions");
    } finally {
      setLoadingSubscriptions(false);
    }
  }, [listSubscriptions, toast]);

  useEffect(() => {
    if (topicArn && topics.length > 0) {
      const found = topics.find((t) => t.TopicArn === topicArn || t.TopicArn?.endsWith(`:${topicArn}`));
      if (found) setSelectedTopicArn(found.TopicArn!);
    } else if (!topicArn) {
      setSelectedTopicArn(null);
    }
  }, [topicArn, topics]);

  useEffect(() => {
    if (selectedTopicArn) fetchSubscriptions(selectedTopicArn);
  }, [selectedTopicArn, fetchSubscriptions]);

  const handleDeleteTopic = (arn: string) => {
    const name = arn.split(":").pop();
    confirm({
      title: `Delete topic "${name}"?`,
      description: "All subscriptions will be removed. This action cannot be undone.",
      action: async () => {
        try {
          await deleteTopic(arn);
          if (selectedTopicArn === arn) setSelectedTopicArn(null);
          toast.success("Topic deleted successfully");
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to delete topic");
        }
      },
    });
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicArn) return;
    try {
      await publish(selectedTopicArn, publishMessage, publishSubject || undefined);
      setPublishMessage("");
      setPublishSubject("");
      toast.success("Message published successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to publish message");
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicArn) return;
    try {
      await subscribe(selectedTopicArn, newSubProtocol, newSubEndpoint);
      setNewSubEndpoint("");
      setShowSubscribe(false);
      toast.success("Subscribed successfully");
      fetchSubscriptions(selectedTopicArn);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to subscribe");
    }
  };

  const handleUnsubscribe = (subscriptionArn: string) => {
    if (subscriptionArn === "PendingConfirmation") {
      toast.warning("Cannot unsubscribe pending confirmation");
      return;
    }
    confirm({
      title: "Unsubscribe?",
      description: "This subscription will be removed from the topic.",
      confirmLabel: "Unsubscribe",
      action: async () => {
        try {
          await unsubscribe(subscriptionArn);
          toast.success("Unsubscribed successfully");
          if (selectedTopicArn) fetchSubscriptions(selectedTopicArn);
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to unsubscribe");
        }
      },
    });
  };

  const getTopicName = (arn: string) => arn.split(":").pop() || arn;

  const selectClass = "w-full bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-rose-500/60 transition-colors text-sm";

  return (
    <div className="space-y-5">
      <PageHeader
        title="SNS Topics"
        subtitle="Manage pub/sub topics and subscriptions in your local environment"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={fetchTopics} title="Refresh" aria-label="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {!selectedTopicArn && (
              <Button variant="rose" size="sm" onClick={() => setShowCreateTopic(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Create Topic
              </Button>
            )}
          </>
        }
      />

      <CreateTopicModal
        open={showCreateTopic}
        onClose={() => setShowCreateTopic(false)}
        onConfirm={async (name) => {
          await snsClient.send(new CreateTopicCommand({ Name: name }));
          fetchTopics();
        }}
        isLoading={loading}
      />

      {!selectedTopicArn ? (
        loading ? (
          <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated border-b border-border-subtle text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-medium text-text-muted">Topic Name</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted">ARN</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="h-3 w-32 bg-surface-skeleton rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-64 bg-surface-skeleton rounded animate-pulse" /></td>
                    <td className="px-4 py-3" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-surface-card rounded-card border border-border-subtle">
            <EmptyState icon={Bell} title="No topics found" description="Create your first SNS topic to get started."
              action={{ label: "Create Topic", onClick: () => setShowCreateTopic(true) }} />
          </div>
        ) : (
          <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated border-b border-border-subtle text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-medium text-text-muted">Topic Name</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted">ARN</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {topics.map((topic) => (
                  <tr key={topic.TopicArn} className="hover:bg-surface-hover cursor-pointer transition-colors group"
                    onClick={() => navigate(`/sns/${getTopicName(topic.TopicArn!)}`)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-rose-500/10 rounded">
                          <Bell className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <span className="text-sm font-medium text-text-primary">{getTopicName(topic.TopicArn!)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted font-mono truncate max-w-xs block">{topic.TopicArn}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.TopicArn!); }}
                        className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Topic" aria-label="Delete Topic">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
              onClick={() => setActiveTab("publish")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === "publish"
                  ? "border-rose-500 text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              Publish
            </button>
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === "subscriptions"
                  ? "border-rose-500 text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              Subscriptions
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/sns")}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Topics
            </button>
            <span className="text-text-faint">/</span>
            <button
              onClick={() => {
                navigate(`/sns/${getTopicName(selectedTopicArn)}`);
                setActiveTab("publish");
              }}
              className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
            >
              {getTopicName(selectedTopicArn)}
            </button>
          </div>

          {activeTab === "publish" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="space-y-4">
                <div className="bg-surface-card rounded-card border border-border-subtle p-4">
                  <h2 className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-rose-500" />
                    Topic Details
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">Name</span>
                      <span className="text-sm text-text-primary font-medium break-all">{getTopicName(selectedTopicArn)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-medium text-text-muted uppercase tracking-[0.15em] mb-1">ARN</span>
                      <span className="text-xs text-text-muted font-mono break-all">{selectedTopicArn}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-surface-card rounded-card border border-border-subtle p-6">
                  <h2 className="text-xs font-semibold text-text-secondary mb-5 flex items-center gap-2 uppercase tracking-wider">
                    <Send className="w-3.5 h-3.5 text-rose-500" />
                    Publish Message
                  </h2>
                  <form onSubmit={handlePublish} className="space-y-4 max-w-xl">
                    <Input label="Subject (optional)" type="text" accentColor="rose"
                      placeholder="Message Subject" value={publishSubject} onChange={(e) => setPublishSubject(e.target.value)} />
                    <TextArea label="Message" required rows={8} accentColor="rose"
                      placeholder='{"key": "value"} or just text' value={publishMessage}
                      onChange={(e) => setPublishMessage(e.target.value)} />
                    <Button type="submit" variant="rose" size="sm" className="w-40 !justify-center"
                      leftIcon={<Send className="w-3.5 h-3.5" />}>
                      Publish
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
              <div className="bg-surface-elevated px-4 py-3 border-b border-border-subtle flex justify-between items-center">
                <h2 className="text-xs font-semibold text-text-secondary flex items-center gap-2 uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-rose-500" />
                  Subscriptions
                </h2>
                <Button variant="ghost" size="xs" onClick={() => setShowSubscribe(true)}
                  leftIcon={<Plus className="w-3 h-3" />}>
                  Add Subscription
                </Button>
              </div>

              {showSubscribe && (
                <div className="p-4 bg-rose-500/[0.03] border-b border-rose-500/10">
                  <form onSubmit={handleSubscribe} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium">Protocol</label>
                      <select className={selectClass} value={newSubProtocol} onChange={(e) => { setNewSubProtocol(e.target.value); setNewSubEndpoint(""); }}>
                        <option value="sqs">SQS</option>
                        <option value="lambda">Lambda</option>
                        <option value="sns">SNS</option>
                        <option value="http">HTTP</option>
                        <option value="https">HTTPS</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium">Endpoint</label>
                      <div className="flex gap-2">
                        {newSubProtocol === "sqs" ? (
                          <select
                            className={selectClass}
                            value={newSubEndpoint}
                            onChange={(e) => setNewSubEndpoint(e.target.value)}
                            required
                          >
                            <option value="">Select a queue...</option>
                            {queues.map((q) => (
                              <option key={q.arn} value={q.arn}>
                                {q.url.split("/").pop()}
                              </option>
                            ))}
                          </select>
                        ) : newSubProtocol === "lambda" ? (
                          <select
                            className={selectClass}
                            value={newSubEndpoint}
                            onChange={(e) => setNewSubEndpoint(e.target.value)}
                            required
                          >
                            <option value="">Select a function...</option>
                            {functions.map((f) => (
                              <option key={f.FunctionArn} value={f.FunctionArn}>
                                {f.FunctionName}
                              </option>
                            ))}
                          </select>
                        ) : newSubProtocol === "sns" ? (
                          <select
                            className={selectClass}
                            value={newSubEndpoint}
                            onChange={(e) => setNewSubEndpoint(e.target.value)}
                            required
                          >
                            <option value="">Select a topic...</option>
                            {topics
                              .filter((t) => t.TopicArn !== selectedTopicArn)
                              .map((t) => (
                                <option key={t.TopicArn} value={t.TopicArn}>
                                  {getTopicName(t.TopicArn!)}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            required
                            className="flex-1 bg-surface-input border border-border-default rounded-btn px-3 py-1.5 text-text-primary placeholder:text-text-faint focus:outline-none focus:border-rose-500/60 text-sm transition-colors"
                            placeholder={
                              newSubProtocol === "email"
                                ? "example@email.com"
                                : newSubProtocol === "sms"
                                ? "+1234567890"
                                : "https://example.com/webhook"
                            }
                            value={newSubEndpoint}
                            onChange={(e) => setNewSubEndpoint(e.target.value)}
                          />
                        )}
                        <Button type="submit" variant="rose" size="sm" disabled={!newSubEndpoint}>
                          Subscribe
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowSubscribe(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-elevated border-b border-border-subtle text-[11px] uppercase tracking-wider">
                      <th className="px-4 py-2.5 font-medium text-text-muted">Protocol</th>
                      <th className="px-4 py-2.5 font-medium text-text-muted">Endpoint</th>
                      <th className="px-4 py-2.5 font-medium text-text-muted text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {loadingSubscriptions ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center">
                          <Spinner size="md" color="text-rose-500" label="Loading subscriptions..." />
                        </td>
                      </tr>
                    ) : subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-text-muted text-xs">
                          No subscriptions found for this topic.
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((sub) => (
                        <tr key={sub.SubscriptionArn} className="hover:bg-surface-hover transition-colors group">
                          <td className="px-4 py-3">
                            <span className="px-1.5 py-0.5 bg-surface-elevated text-text-secondary rounded text-xs font-mono uppercase border border-border-subtle">
                              {sub.Protocol}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-text-secondary truncate max-w-xs xl:max-w-md font-mono" title={sub.Endpoint}>
                              {sub.Endpoint}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleUnsubscribe(sub.SubscriptionArn!)}
                              className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                              title="Unsubscribe" aria-label="Unsubscribe">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {ConfirmModalComponent}
    </div>
  );
};

export default SNS;

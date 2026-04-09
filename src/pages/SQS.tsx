import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ListQueuesCommand,
  DeleteQueueCommand,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  PurgeQueueCommand,
  GetQueueAttributesCommand,
  SetQueueAttributesCommand,
  TagQueueCommand,
  UntagQueueCommand,
  ListQueueTagsCommand,
  ChangeMessageVisibilityCommand,
  SendMessageBatchCommand,
  DeleteMessageBatchCommand,
  ChangeMessageVisibilityBatchCommand,
  type Message,
} from "@aws-sdk/client-sqs";
import { sqsClient } from "../services/awsClients";
import { Plus, RefreshCw, MessageSquare, Send, Inbox, ArrowLeft, Trash2, Trash, Edit2, Timer } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { Input, TextArea } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { Badge } from "../components/ui/Badge";
import { EditQueueModal } from "../components/sqs/EditQueueModal";
import { TagManager } from "../components/sqs/TagManager";
import { Settings, Clock, ShieldAlert } from "lucide-react";

export const SQS = () => {
  const { queueName } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm, ConfirmModalComponent } = useConfirmModal();
  const [queues, setQueues] = useState<string[]>([]);
  const [selectedQueueUrl, setSelectedQueueUrl] = useState<string | null>(null);
  const [queueAttributes, setQueueAttributes] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isEditingQueue, setIsEditingQueue] = useState(false);
  const [tagLoading, setTagLoading] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [messageGroupId, setMessageGroupId] = useState("");
  const [messageDeduplicationId, setMessageDeduplicationId] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [isBulkSend, setIsBulkSend] = useState(false);
  const [bulkBody, setBulkBody] = useState("");

  const fetchQueues = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sqsClient.send(new ListQueuesCommand({}));
      setQueues(response.QueueUrls || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch queues");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMessages = useCallback(async (queueUrl: string) => {
    setMessagesLoading(true);
    try {
      const response = await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 0,
          AttributeNames: ["All"],
          MessageAttributeNames: ["All"],
        }),
      );
      setMessages(response.Messages || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setMessagesLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQueueAttributes = useCallback(async (queueUrl: string) => {
    try {
      const response = await sqsClient.send(
        new GetQueueAttributesCommand({
          QueueUrl: queueUrl,
          AttributeNames: ["All"],
        }),
      );
      setQueueAttributes(response.Attributes || {});
    } catch (err: unknown) {
      console.error("Failed to fetch queue attributes:", err);
    }
  }, []);

  const fetchQueueTags = useCallback(async (queueUrl: string) => {
    try {
      const response = await sqsClient.send(
        new ListQueueTagsCommand({
          QueueUrl: queueUrl,
        }),
      );
      setTags(response.Tags || {});
    } catch (err: unknown) {
      console.error("Failed to fetch queue tags:", err);
    }
  }, []);

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  useEffect(() => {
    if (queueName && queues.length > 0) {
      const found = queues.find((url) => url.endsWith(`/${queueName}`));
      if (found) {
        setSelectedQueueUrl(found);
      }
    } else if (!queueName) {
      setSelectedQueueUrl(null);
      setQueueAttributes({});
    }
  }, [queueName, queues]);

  useEffect(() => {
    if (selectedQueueUrl) {
      fetchMessages(selectedQueueUrl);
      fetchQueueAttributes(selectedQueueUrl);
      fetchQueueTags(selectedQueueUrl);
    }
  }, [selectedQueueUrl, fetchMessages, fetchQueueAttributes, fetchQueueTags]);

  const handleDeleteQueue = (queueUrl: string) => {
    const name = queueUrl.split("/").pop();
    confirm({
      title: `Delete queue "${name}"?`,
      description: "All messages will be lost. This action cannot be undone.",
      action: async () => {
        try {
          await sqsClient.send(new DeleteQueueCommand({ QueueUrl: queueUrl }));
          if (selectedQueueUrl === queueUrl) setSelectedQueueUrl(null);
          fetchQueues();
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to delete queue");
        }
      },
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueueUrl || !messageBody) return;
    setSendingMessage(true);
    try {
      const isFifo = selectedQueueUrl.endsWith(".fifo") || queueAttributes.FifoQueue === "true";
      await sqsClient.send(
        new SendMessageCommand({
          QueueUrl: selectedQueueUrl,
          MessageBody: messageBody,
          MessageGroupId: isFifo ? messageGroupId || "default" : undefined,
          MessageDeduplicationId: isFifo ? messageDeduplicationId || undefined : undefined,
        }),
      );
      setMessageBody("");
      setMessageGroupId("");
      setMessageDeduplicationId("");
      fetchMessages(selectedQueueUrl);
      fetchQueueAttributes(selectedQueueUrl);
      toast.success("Message sent successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleBulkSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueueUrl || !bulkBody) return;
    setSendingMessage(true);
    try {
      const bodies = bulkBody.split("\n").filter(b => b.trim().length > 0);
      const isFifo = selectedQueueUrl.endsWith(".fifo") || queueAttributes.FifoQueue === "true";
      
      const entries = bodies.map((body, i) => ({
        Id: i.toString(),
        MessageBody: body,
        MessageGroupId: isFifo ? messageGroupId || "default" : undefined,
        MessageDeduplicationId: isFifo ? `bulk-${Date.now()}-${i}` : undefined,
      }));

      for (let i = 0; i < entries.length; i += 10) {
        const chunk = entries.slice(i, i + 10);
        await sqsClient.send(new SendMessageBatchCommand({
          QueueUrl: selectedQueueUrl,
          Entries: chunk,
        }));
      }

      setBulkBody("");
      fetchMessages(selectedQueueUrl);
      fetchQueueAttributes(selectedQueueUrl);
      toast.success(`Successfully sent ${bodies.length} messages`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send messages");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (receiptHandle: string) => {
    if (!selectedQueueUrl) return;
    try {
      await sqsClient.send(new DeleteMessageCommand({ QueueUrl: selectedQueueUrl, ReceiptHandle: receiptHandle }));
      setMessages((prev) => prev.filter((m) => m.ReceiptHandle !== receiptHandle));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete message");
    }
  };

  const handlePurgeQueue = () => {
    if (!selectedQueueUrl) return;
    const name = selectedQueueUrl.split("/").pop();
    confirm({
      title: `Purge queue "${name}"?`,
      description: "All messages in this queue will be permanently deleted.",
      confirmLabel: "Purge",
      action: async () => {
        try {
          await sqsClient.send(new PurgeQueueCommand({ QueueUrl: selectedQueueUrl }));
          setMessages([]);
          toast.success("Queue purged successfully");
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to purge queue");
        }
      },
    });
  };

  const handleUpdateAttributes = async (attributes: Record<string, string>) => {
    if (!selectedQueueUrl) return;
    try {
      await sqsClient.send(new SetQueueAttributesCommand({ QueueUrl: selectedQueueUrl, Attributes: attributes }));
      fetchQueueAttributes(selectedQueueUrl);
      toast.success("Queue attributes updated successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update queue attributes");
    }
  };

  const handleAddTag = async (key: string, value: string) => {
    if (!selectedQueueUrl) return;
    setTagLoading(true);
    try {
      await sqsClient.send(new TagQueueCommand({ QueueUrl: selectedQueueUrl, Tags: { [key]: value } }));
      fetchQueueTags(selectedQueueUrl);
      toast.success("Tag added successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add tag");
    } finally {
      setTagLoading(false);
    }
  };

  const handleRemoveTag = async (key: string) => {
    if (!selectedQueueUrl) return;
    setTagLoading(true);
    try {
      await sqsClient.send(new UntagQueueCommand({ QueueUrl: selectedQueueUrl, TagKeys: [key] }));
      fetchQueueTags(selectedQueueUrl);
      toast.success("Tag removed successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove tag");
    } finally {
      setTagLoading(false);
    }
  };

  const handleChangeVisibility = async (receiptHandle: string) => {
    if (!selectedQueueUrl) return;
    const timeout = prompt("Enter new visibility timeout (seconds):", "30");
    if (timeout === null) return;
    
    try {
      await sqsClient.send(new ChangeMessageVisibilityCommand({
        QueueUrl: selectedQueueUrl,
        ReceiptHandle: receiptHandle,
        VisibilityTimeout: parseInt(timeout)
      }));
      toast.success("Message visibility updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update visibility");
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedQueueUrl || selectedMessageIds.length === 0) return;
    
    confirm({
      title: `Delete ${selectedMessageIds.length} messages?`,
      description: "This action cannot be undone.",
      action: async () => {
        setBatchActionLoading(true);
        try {
          const selectedMessages = messages.filter(m => selectedMessageIds.includes(m.MessageId!));
          const entries = selectedMessages.map((m, i) => ({
            Id: i.toString(),
            ReceiptHandle: m.ReceiptHandle!
          }));

          // SQS Batch allows up to 10 entries
          for (let i = 0; i < entries.length; i += 10) {
            const chunk = entries.slice(i, i + 10);
            await sqsClient.send(new DeleteMessageBatchCommand({
              QueueUrl: selectedQueueUrl,
              Entries: chunk
            }));
          }

          setMessages(prev => prev.filter(m => !selectedMessageIds.includes(m.MessageId!)));
          setSelectedMessageIds([]);
          toast.success(`Deleted ${selectedMessageIds.length} messages`);
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to delete messages in batch");
        } finally {
          setBatchActionLoading(false);
        }
      }
    });
  };

  const handleBatchVisibility = async () => {
    if (!selectedQueueUrl || selectedMessageIds.length === 0) return;
    const timeoutStr = prompt("Enter new visibility timeout (seconds) for selected messages:", "30");
    if (timeoutStr === null) return;
    const timeout = parseInt(timeoutStr);

    setBatchActionLoading(true);
    try {
      const selectedMessages = messages.filter(m => selectedMessageIds.includes(m.MessageId!));
      const entries = selectedMessages.map((m, i) => ({
        Id: i.toString(),
        ReceiptHandle: m.ReceiptHandle!,
        VisibilityTimeout: timeout
      }));

      for (let i = 0; i < entries.length; i += 10) {
        const chunk = entries.slice(i, i + 10);
        await sqsClient.send(new ChangeMessageVisibilityBatchCommand({
          QueueUrl: selectedQueueUrl,
          Entries: chunk
        }));
      }

      toast.success(`Updated visibility for ${selectedMessageIds.length} messages`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update visibility in batch");
    } finally {
      setBatchActionLoading(false);
    }
  };

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessageIds(prev => 
      prev.includes(messageId) ? prev.filter(id => id !== messageId) : [...prev, messageId]
    );
  };

  const toggleAllMessages = () => {
    if (selectedMessageIds.length === messages.length) {
      setSelectedMessageIds([]);
    } else {
      setSelectedMessageIds(messages.map(m => m.MessageId!));
    }
  };

  const getQueueName = (url: string) => url.split("/").pop() || url;

  return (
    <div className="space-y-5">
      <PageHeader
        title="SQS Queues"
        subtitle="Manage message queues and process messages in your local environment"
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (selectedQueueUrl ? fetchMessages(selectedQueueUrl) : fetchQueues())}
              title="Refresh"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading || messagesLoading ? "animate-spin" : ""}`} />
            </Button>
            {!selectedQueueUrl && (
              <Button
                variant="warning"
                size="sm"
                onClick={() => navigate("/sqs/create")}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Queue
              </Button>
            )}
          </>
        }
      />


      <EditQueueModal
        open={isEditingQueue}
        onClose={() => setIsEditingQueue(false)}
        onConfirm={handleUpdateAttributes}
        initialAttributes={queueAttributes}
        isLoading={loading}
      />

      {selectedQueueUrl ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/sqs")}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Queues
            </button>
            <span className="text-text-faint">/</span>
            <span className="text-sm font-medium text-orange-500">{getQueueName(selectedQueueUrl)}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="space-y-4">
              <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
                <div className="bg-surface-elevated px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{getQueueName(selectedQueueUrl)}</p>
                    <p className="text-xs text-text-muted mt-0.5 truncate font-mono">{selectedQueueUrl}</p>
                  </div>
                  {queueAttributes.FifoQueue === "true" && (
                    <Badge variant="mono" className="ml-2 uppercase tracking-tighter text-[10px] shrink-0">FIFO</Badge>
                  )}
                </div>
                <div className="p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePurgeQueue}
                    className="w-full !justify-center hover:!text-red-500 hover:!bg-red-500/10"
                    leftIcon={<Trash className="w-3.5 h-3.5" />}
                  >
                    Purge Queue
                  </Button>
                </div>
              </div>

              <div className="bg-surface-card rounded-card border border-border-subtle p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-text-secondary flex items-center gap-2 uppercase tracking-wider">
                    <Settings className="w-3.5 h-3.5 text-orange-500" />
                    Queue Settings
                  </h3>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsEditingQueue(true)}
                    className="text-text-muted hover:text-orange-500"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Visibility Timeout
                    </span>
                    <span className="text-text-secondary font-medium">{queueAttributes.VisibilityTimeout}s</span>
                  </div>
                  
                  {queueAttributes.RedrivePolicy && (
                    <div className="pt-2 border-t border-border-subtle">
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-3 h-3 text-red-500" />
                        Dead Letter Queue
                      </p>
                      <div className="space-y-1.5 pl-4.5 border-l border-border-subtle">
                        <p className="text-[10px] text-text-primary font-mono break-all leading-relaxed">
                          {JSON.parse(queueAttributes.RedrivePolicy).deadLetterTargetArn.split(":").pop()}
                        </p>
                        <p className="text-[10px] text-text-muted">
                          Max Receives: <span className="text-text-secondary font-medium">{JSON.parse(queueAttributes.RedrivePolicy).maxReceiveCount}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border-subtle grid grid-cols-2 gap-2">
                    <div className="bg-surface-elevated p-2 rounded border border-border-subtle text-center">
                      <p className="text-[9px] text-text-faint uppercase font-bold tracking-tighter">Available</p>
                      <p className="text-lg font-semibold text-orange-500 leading-none mt-1">
                        {queueAttributes.ApproximateNumberOfMessages || "0"}
                      </p>
                    </div>
                    <div className="bg-surface-elevated p-2 rounded border border-border-subtle text-center">
                      <p className="text-[9px] text-text-faint uppercase font-bold tracking-tighter">In Flight</p>
                      <p className="text-lg font-semibold text-text-secondary leading-none mt-1">
                        {queueAttributes.ApproximateNumberOfMessagesNotVisible || "0"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <TagManager
                tags={tags}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                isLoading={tagLoading}
              />

              <div className="bg-surface-card rounded-card border border-border-subtle p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-text-secondary flex items-center gap-2 uppercase tracking-wider">
                    <Send className="w-3.5 h-3.5 text-orange-500" />
                    Send Message
                  </h3>
                  <button
                    onClick={() => setIsBulkSend(!isBulkSend)}
                    className="text-[10px] text-text-muted hover:text-orange-500 transition-colors uppercase font-medium tracking-wider"
                  >
                    {isBulkSend ? "Single" : "Bulk Send"}
                  </button>
                </div>
                <form onSubmit={isBulkSend ? handleBulkSend : handleSendMessage} className="space-y-4">
                  {isBulkSend ? (
                    <TextArea
                      label="Message Bodies (one per line)"
                      required
                      rows={6}
                      accentColor="orange"
                      value={bulkBody}
                      onChange={(e) => setBulkBody(e.target.value)}
                      placeholder="Message 1&#10;Message 2&#10;Message 3"
                    />
                  ) : (
                    <TextArea
                      label="Message Body"
                      required
                      rows={4}
                      accentColor="orange"
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      placeholder='{"action": "process_order", "id": 123}'
                    />
                  )}
                  
                  {(selectedQueueUrl.endsWith(".fifo") || queueAttributes.FifoQueue === "true") && (
                    <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2">
                      <Input
                        label="Message Group ID"
                        value={messageGroupId}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageGroupId(e.target.value)}
                        placeholder="default"
                        required
                        accentColor="orange"
                        className="text-xs"
                      />
                      {!queueAttributes.ContentBasedDeduplication && (
                        <Input
                          label="Message Deduplication ID"
                          value={messageDeduplicationId}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageDeduplicationId(e.target.value)}
                          placeholder="unique-id"
                          accentColor="orange"
                          className="text-xs"
                        />
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="warning"
                    size="sm"
                    disabled={sendingMessage || !messageBody}
                    isLoading={sendingMessage}
                    className="w-full !justify-center"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
                <div className="bg-surface-elevated px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={messages.length > 0 && selectedMessageIds.length === messages.length}
                      onChange={toggleAllMessages}
                      className="w-3.5 h-3.5 rounded border-border-default text-orange-500 focus:ring-orange-500/30 bg-surface-input"
                    />
                    <h3 className="text-xs font-semibold text-text-secondary flex items-center gap-2 uppercase tracking-wider">
                      <Inbox className="w-3.5 h-3.5 text-orange-500" />
                      Messages
                      <span className="text-text-faint font-normal normal-case tracking-normal">(Recent)</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedMessageIds.length > 0 && (
                      <div className="flex items-center gap-2 mr-2 animate-in fade-in slide-in-from-right-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={handleBatchVisibility}
                          isLoading={batchActionLoading}
                          leftIcon={<Timer className="w-3 h-3" />}
                        >
                          Visibility ({selectedMessageIds.length})
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={handleBatchDelete}
                          isLoading={batchActionLoading}
                          className="hover:text-red-500"
                          leftIcon={<Trash2 className="w-3 h-3" />}
                        >
                          Delete ({selectedMessageIds.length})
                        </Button>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => fetchMessages(selectedQueueUrl)}
                      leftIcon={<RefreshCw className={`w-3 h-3 ${messagesLoading ? "animate-spin" : ""}`} />}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
                <div>
                  {messagesLoading && messages.length === 0 ? (
                    <div className="py-16 text-center">
                      <Spinner size="md" color="text-orange-500" label="Polling for messages..." />
                    </div>
                  ) : messages.length === 0 ? (
                    <EmptyState
                      icon={Inbox}
                      title="No messages available"
                      description="Polling might return nothing if messages are invisible."
                    />
                  ) : (
                    <div className="divide-y divide-border-subtle">
                      {messages.map((msg) => (
                        <div key={msg.MessageId} className="p-4 hover:bg-surface-hover transition-colors group flex gap-4">
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={selectedMessageIds.includes(msg.MessageId!)}
                              onChange={() => toggleMessageSelection(msg.MessageId!)}
                              className="w-3.5 h-3.5 rounded border-border-default text-orange-500 focus:ring-orange-500/30 bg-surface-input"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[11px] font-mono text-text-faint">ID: {msg.MessageId}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  onClick={() => handleChangeVisibility(msg.ReceiptHandle!)}
                                  className="p-1.5 text-text-faint hover:text-orange-500 hover:bg-orange-500/10 rounded transition-all"
                                  title="Change Visibility Timeout"
                                  aria-label="Change Visibility Timeout"
                                >
                                  <Timer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg.ReceiptHandle!)}
                                  className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                                  title="Delete Message"
                                  aria-label="Delete Message"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <pre className="bg-surface-elevated border border-border-subtle p-3 rounded text-xs font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
                              {msg.Body}
                            </pre>
                            {msg.Attributes && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {Object.entries(msg.Attributes).map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="text-[10px] bg-surface-elevated border border-border-subtle px-1.5 py-0.5 rounded text-text-muted"
                                  >
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-elevated border-b border-border-subtle text-[11px] uppercase tracking-wider">
                <th className="px-4 py-2.5 font-medium text-text-muted">Queue Name</th>
                <th className="px-4 py-2.5 font-medium text-text-muted">URL</th>
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
      ) : queues.length === 0 ? (
        <div className="bg-surface-card rounded-card border border-border-subtle">
          <EmptyState
            icon={MessageSquare}
            title="No queues found"
            description="Create your first SQS queue to start sending messages."
            action={{ label: "Create Queue", onClick: () => navigate("/sqs/create") }}
          />
        </div>
      ) : (
        <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-elevated border-b border-border-subtle text-[11px] uppercase tracking-wider">
                <th className="px-4 py-2.5 font-medium text-text-muted">Queue Name</th>
                <th className="px-4 py-2.5 font-medium text-text-muted">URL</th>
                <th className="px-4 py-2.5 font-medium text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {queues.map((url) => (
                <tr
                  key={url}
                  className="hover:bg-surface-hover cursor-pointer transition-colors group"
                  onClick={() => navigate(`/sqs/${getQueueName(url)}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-orange-500/10 rounded">
                        <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                      <span className="text-sm font-medium text-text-primary">{getQueueName(url)}</span>
                      {url.endsWith(".fifo") && (
                        <Badge variant="mono" className="uppercase tracking-tighter text-[9px] px-1 py-0">FIFO</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-muted font-mono truncate max-w-xs block">{url}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteQueue(url); }}
                      className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Queue"
                      aria-label="Delete Queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ConfirmModalComponent}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Mail, RefreshCw, Plus, Trash2, Send, Inbox } from "lucide-react";
import { useSES } from "../hooks/useSES";
import type { SentEmail } from "../hooks/useSES";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { Modal } from "../components/ui/Modal";
import { Input, TextArea } from "../components/ui/Input";
import { useConfirmModal } from "../hooks/useConfirmModal";

export const SES = () => {
  const ses = useSES();
  const { confirm, ConfirmModalComponent } = useConfirmModal();
  const [activeTab, setActiveTab] = useState<"identities" | "emails">("identities");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [sendForm, setSendForm] = useState({ source: "", to: "", subject: "", body: "" });

  useEffect(() => {
    ses.fetchIdentities();
    ses.fetchSentEmails();
  }, [ses.fetchIdentities, ses.fetchSentEmails]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyEmail) return;
    await ses.verifyIdentity(verifyEmail);
    setIsVerifyModalOpen(false);
    setVerifyEmail("");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const to = sendForm.to.split(",").map((s) => s.trim()).filter(Boolean);
    if (!sendForm.source || to.length === 0 || !sendForm.subject || !sendForm.body) return;
    await ses.sendEmail(sendForm.source, to, sendForm.subject, sendForm.body);
    setIsSendModalOpen(false);
    setSendForm({ source: "", to: "", subject: "", body: "" });
  };

  const handleDeleteIdentity = (identity: string) => {
    confirm({
      title: "Delete Identity?",
      description: `Are you sure you want to delete the identity "${identity}"?`,
      action: () => ses.deleteIdentity(identity),
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Simple Email Service"
        subtitle="Configure email identities and view sent messages"
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                ses.fetchIdentities();
                ses.fetchSentEmails();
              }}
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${ses.loading ? "animate-spin" : ""}`} />
            </Button>
            {activeTab === "identities" ? (
              <Button
                variant="pink"
                size="sm"
                onClick={() => setIsVerifyModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Verify Identity
              </Button>
            ) : (
              <Button
                variant="pink"
                size="sm"
                onClick={() => setIsSendModalOpen(true)}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send Email
              </Button>
            )}
          </>
        }
      />

      <div className="flex border-b border-border-subtle gap-6">
        <button
          onClick={() => setActiveTab("identities")}
          className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "identities"
              ? "text-pink-500 border-pink-500"
              : "text-text-muted border-transparent hover:text-text-primary"
          }`}
        >
          Identities ({ses.identities.length})
        </button>
        <button
          onClick={() => setActiveTab("emails")}
          className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "emails"
              ? "text-pink-500 border-pink-500"
              : "text-text-muted border-transparent hover:text-text-primary"
          }`}
        >
          Sent Emails ({ses.sentEmails.length})
        </button>
      </div>

      <div className="bg-surface-card rounded-card border border-border-subtle overflow-hidden">
        {activeTab === "identities" ? (
          <DataTable
            columns={[
              {
                key: "identity",
                header: "Identity",
                render: (id: string) => <span className="font-medium text-text-primary">{id}</span>,
              },
              {
                key: "status",
                header: "Status",
                render: () => (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Verified
                  </span>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                render: (id: string) => (
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-text-muted hover:text-red-500"
                      onClick={() => handleDeleteIdentity(id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ),
                className: "w-20",
              },
            ]}
            rows={ses.identities}
            rowKey={(id: string) => id}
            loading={ses.loading}
            emptyIcon={Mail}
            emptyTitle="No identities"
            emptyDescription="Verify an email address or domain to start sending emails."
            emptyAction={{ label: "Verify Identity", onClick: () => setIsVerifyModalOpen(true) }}
          />
        ) : (
          <DataTable
            columns={[
              {
                key: "timestamp",
                header: "Timestamp",
                render: (email: SentEmail) => (
                  <span className="text-xs text-text-muted">
                    {new Date(email.timestamp).toLocaleString()}
                  </span>
                ),
                className: "w-44",
              },
              {
                key: "from",
                header: "From",
                render: (email: SentEmail) => (
                  <span className="text-xs font-medium truncate max-w-[150px]" title={email.source}>
                    {email.source}
                  </span>
                ),
              },
              {
                key: "to",
                header: "To",
                render: (email: SentEmail) => (
                  <span className="text-xs text-text-secondary truncate max-w-[150px]" title={email.destination.toAddresses.join(", ")}>
                    {email.destination.toAddresses.join(", ")}
                  </span>
                ),
              },
              {
                key: "subject",
                header: "Subject",
                render: (email: SentEmail) => (
                  <span className="text-sm font-medium text-text-primary truncate" title={email.subject}>
                    {email.subject}
                  </span>
                ),
              },
            ]}
            rows={ses.sentEmails}
            rowKey={(email: SentEmail) => email.id}
            emptyIcon={Inbox}
            emptyTitle="No sent emails"
            emptyDescription="Emails sent via SES will appear here (stored in-memory)."
            emptyAction={{ label: "Send Test Email", onClick: () => setIsSendModalOpen(true) }}
          />
        )}
      </div>

      <Modal
        open={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Verify Identity"
      >
        <form onSubmit={handleVerify} className="space-y-4 pt-2">
          <Input
            label="Email Address"
            placeholder="e.g. contact@example.com"
            value={verifyEmail}
            onChange={(e) => setVerifyEmail(e.target.value)}
            required
            type="email"
            accentColor="rose"
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="pink">
              Verify
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        title="Send Test Email"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSend} className="space-y-4 pt-2">
          <Input
            label="From (Source)"
            placeholder="e.g. sender@example.com"
            value={sendForm.source}
            onChange={(e) => setSendForm({ ...sendForm, source: e.target.value })}
            required
            accentColor="rose"
          />
          <Input
            label="To (Destination)"
            placeholder="e.g. recipient@example.com (comma separated)"
            value={sendForm.to}
            onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
            required
            accentColor="rose"
          />
          <Input
            label="Subject"
            placeholder="Email subject"
            value={sendForm.subject}
            onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
            required
            accentColor="rose"
          />
          <TextArea
            label="Body (Text)"
            placeholder="Email message..."
            value={sendForm.body}
            onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
            required
            rows={6}
            accentColor="rose"
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsSendModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="pink" leftIcon={<Send className="w-3.5 h-3.5" />}>
              Send Email
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
};

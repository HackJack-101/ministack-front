import { useState } from "react";
import { FolderSync, RefreshCw, Trash2, Users, Play, Square } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useTransferFamily } from "../hooks/useTransferFamily";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { ListedServer, ListedUser } from "@aws-sdk/client-transfer";

type Tab = "servers" | "users";

const SERVER_STATE_VARIANT = (state: string | undefined) => {
  if (state === "ONLINE") return "success";
  if (state === "STARTING") return "warning";
  if (state === "STOPPING" || state === "STOP_FAILED") return "warning";
  if (state === "OFFLINE") return "error";
  if (state === "START_FAILED") return "error";
  return "default";
};

export default function TransferFamily() {
  const {
    servers,
    users,
    selectedServerId,
    loading,
    fetchUsers,
    startServer,
    stopServer,
    deleteServer,
    deleteUser,
    refresh,
  } = useTransferFamily();
  const [activeTab, setActiveTab] = useState<Tab>("servers");
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  const handleDeleteServer = (server: ListedServer) => {
    confirm({
      title: `Delete server "${server.ServerId}"?`,
      description: "The SFTP server and all its users will be permanently deleted.",
      confirmVariant: "danger",
      action: () => deleteServer(server.ServerId!),
    });
  };

  const handleDeleteUser = (user: ListedUser) => {
    confirm({
      title: `Delete user "${user.UserName}"?`,
      description: "This user will be permanently removed from the server.",
      confirmVariant: "danger",
      action: () => deleteUser(selectedServerId!, user.UserName!),
    });
  };

  const handleViewUsers = async (server: ListedServer) => {
    await fetchUsers(server.ServerId!);
    setActiveTab("users");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "servers", label: `Servers${servers.length > 0 ? ` (${servers.length})` : ""}` },
    {
      key: "users",
      label: `Users${selectedServerId ? ` — ${selectedServerId.slice(0, 12)}` : ""}${users.length > 0 ? ` (${users.length})` : ""}`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transfer Family"
        subtitle="Managed SFTP/FTPS/FTP file transfer servers"
        actions={
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        }
      />

      <div className="flex items-center gap-1 border-b border-border-subtle mb-5">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === key
                ? "border-sky-600 text-text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && servers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" color="text-sky-600" />
          <p className="mt-4 text-text-muted">Loading Transfer servers...</p>
        </div>
      ) : (
        <>
          {activeTab === "servers" &&
            (servers.length === 0 ? (
              <EmptyState
                title="No Servers"
                description="No Transfer Family servers found. Use the AWS CLI or SDK to create one."
                icon={FolderSync}
              />
            ) : (
              <DataTable
                rows={servers}
                rowKey={(s: ListedServer) => s.ServerId || ""}
                accentColor="sky"
                columns={[
                  {
                    key: "serverId",
                    header: "Server ID",
                    render: (s: ListedServer) => <Badge variant="mono">{s.ServerId || "—"}</Badge>,
                  },
                  {
                    key: "state",
                    header: "State",
                    render: (s: ListedServer) => (
                      <Badge variant={SERVER_STATE_VARIANT(s.State)}>{s.State || "—"}</Badge>
                    ),
                  },
                  {
                    key: "endpointType",
                    header: "Endpoint Type",
                    render: (s: ListedServer) => (
                      <span className="text-sm text-text-secondary">{s.EndpointType || "—"}</span>
                    ),
                  },
                  {
                    key: "domain",
                    header: "Domain",
                    render: (s: ListedServer) => <span className="text-sm text-text-secondary">{s.Domain || "—"}</span>,
                  },
                  {
                    key: "userCount",
                    header: "Users",
                    render: (s: ListedServer) => (
                      <span className="text-sm text-text-secondary">{s.UserCount ?? "—"}</span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (s: ListedServer) => (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUsers(s)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-600"
                          title="View Users"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </Button>
                        {s.State === "OFFLINE" || s.State === "STOP_FAILED" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startServer(s.ServerId!)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-600"
                            title="Start Server"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </Button>
                        ) : s.State === "ONLINE" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => stopServer(s.ServerId!)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500"
                            title="Stop Server"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteServer(s)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            ))}

          {activeTab === "users" &&
            (users.length === 0 ? (
              <EmptyState
                title="No Users"
                description={
                  selectedServerId
                    ? "This server has no users."
                    : "Select a server and click the users icon to view its users."
                }
                icon={FolderSync}
              />
            ) : (
              <DataTable
                rows={users}
                rowKey={(u: ListedUser) => u.UserName || ""}
                accentColor="sky"
                columns={[
                  {
                    key: "userName",
                    header: "Username",
                    render: (u: ListedUser) => (
                      <span className="font-medium text-text-primary">{u.UserName || "—"}</span>
                    ),
                  },
                  {
                    key: "homeDirectory",
                    header: "Home Directory",
                    render: (u: ListedUser) => (
                      <span className="font-mono text-xs text-text-muted">{u.HomeDirectory || "—"}</span>
                    ),
                  },
                  {
                    key: "homeDirectoryType",
                    header: "Directory Type",
                    render: (u: ListedUser) => (
                      <span className="text-sm text-text-secondary">{u.HomeDirectoryType || "—"}</span>
                    ),
                  },
                  {
                    key: "sshKeys",
                    header: "SSH Keys",
                    render: (u: ListedUser) => (
                      <span className="text-sm text-text-secondary">{u.SshPublicKeyCount ?? 0}</span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (u: ListedUser) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(u)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    ),
                  },
                ]}
              />
            ))}
        </>
      )}

      {ConfirmModalComponent}
    </div>
  );
}

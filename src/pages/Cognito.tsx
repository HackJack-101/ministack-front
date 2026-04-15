import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, RefreshCw, Plus, Trash2, Key, Settings, Shield, UserPlus, Info } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import type { UserPoolDescriptionType } from "@aws-sdk/client-cognito-identity-provider";
import type { IdentityPoolShortDescription } from "@aws-sdk/client-cognito-identity";
import { useCognito } from "../hooks/useCognito";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useConfirmModal } from "../hooks/useConfirmModal";
import type { UserPoolType, UserType } from "@aws-sdk/client-cognito-identity-provider";

export default function Cognito() {
  const { poolId } = useParams();
  const navigate = useNavigate();
  const {
    userPools,
    identityPools,
    loading,
    createUserPool,
    deleteUserPool,
    describeUserPool,
    updateUserPool,
    listUsers,
    adminCreateUser,
    adminDeleteUser,
    refresh,
  } = useCognito();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPoolName, setNewPoolName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"user-pools" | "identity-pools">("user-pools");
  const { confirm, ConfirmModalComponent } = useConfirmModal();

  // Selected pool states
  const [poolActiveTab, setPoolActiveTab] = useState<"users" | "settings">("users");
  const [selectedPool, setSelectedPool] = useState<UserPoolType | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // User creation state
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Settings state
  const [minPasswordLength, setMinPasswordLength] = useState<string>("8");
  const [requireNumbers, setRequireNumbers] = useState(false);
  const [requireSymbols, setRequireSymbols] = useState(false);
  const [requireUppercase, setRequireUppercase] = useState(false);
  const [requireLowercase, setRequireLowercase] = useState(false);
  const [isUpdatingPool, setIsUpdatingPool] = useState(false);

  const loadPoolData = useCallback(
    async (id: string) => {
      setLoadingDetails(true);
      const details = await describeUserPool(id);
      setSelectedPool(details);
      if (details?.Policies?.PasswordPolicy) {
        const policy = details.Policies.PasswordPolicy;
        setMinPasswordLength(String(policy.MinimumLength || 8));
        setRequireNumbers(policy.RequireNumbers || false);
        setRequireSymbols(policy.RequireSymbols || false);
        setRequireUppercase(policy.RequireUppercase || false);
        setRequireLowercase(policy.RequireLowercase || false);
      }
      setLoadingDetails(false);

      setLoadingUsers(true);
      const poolUsers = await listUsers(id);
      setUsers(poolUsers);
      setLoadingUsers(false);
    },
    [describeUserPool, listUsers],
  );

  useEffect(() => {
    if (poolId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadPoolData(poolId);
    }
  }, [poolId, loadPoolData]);

  const handleSelectPool = (id: string) => {
    navigate(`/cognito/user-pools/${id}`);
  };

  const handleBack = () => {
    navigate("/cognito");
  };

  const handleCreateUserPool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoolName.trim()) return;

    setIsCreating(true);
    await createUserPool(newPoolName);
    setIsCreating(false);
    setIsCreateModalOpen(false);
    setNewPoolName("");
  };

  const handleDeleteUserPool = (id: string, name: string) => {
    confirm({
      title: "Delete User Pool",
      description: `Are you sure you want to delete user pool "${name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      confirmVariant: "danger",
      action: () => deleteUserPool(id),
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !poolId) return;

    setIsCreatingUser(true);
    await adminCreateUser(poolId, newUserName);
    setIsCreatingUser(false);
    setIsCreateUserModalOpen(false);
    setNewUserName("");
    // Refresh users
    const poolUsers = await listUsers(poolId);
    setUsers(poolUsers);
  };

  const handleDeleteUser = (username: string) => {
    if (!poolId) return;
    confirm({
      title: "Delete User",
      description: `Are you sure you want to delete user "${username}"?`,
      confirmLabel: "Delete",
      confirmVariant: "danger",
      action: async () => {
        await adminDeleteUser(poolId, username);
        const poolUsers = await listUsers(poolId);
        setUsers(poolUsers);
      },
    });
  };

  const handleUpdatePool = async () => {
    if (!poolId) return;
    setIsUpdatingPool(true);
    await updateUserPool(poolId, {
      Policies: {
        PasswordPolicy: {
          MinimumLength: parseInt(minPasswordLength),
          RequireNumbers: requireNumbers,
          RequireSymbols: requireSymbols,
          RequireUppercase: requireUppercase,
          RequireLowercase: requireLowercase,
        },
      },
    });
    setIsUpdatingPool(false);
    loadPoolData(poolId);
  };

  if (poolId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={selectedPool?.Name || "User Pool"}
          subtitle={poolId}
          backButton={{
            label: "Back to User Pools",
            onClick: handleBack,
          }}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPoolData(poolId)}
                disabled={loadingDetails || loadingUsers}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingDetails || loadingUsers ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {poolActiveTab === "users" && (
                <Button size="sm" onClick={() => setIsCreateUserModalOpen(true)} color="indigo">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              )}
            </>
          }
        />

        <div className="flex border-b border-border-subtle">
          <button
            onClick={() => setPoolActiveTab("users")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              poolActiveTab === "users"
                ? "border-indigo-500 text-indigo-500"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setPoolActiveTab("settings")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              poolActiveTab === "settings"
                ? "border-indigo-500 text-indigo-500"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {poolActiveTab === "users" ? (
          loadingUsers && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-card rounded-xl border border-border-subtle">
              <Spinner size="lg" color="indigo" />
              <p className="mt-4 text-text-muted">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              title="No Users"
              description="Create a user to get started with this user pool."
              icon={Users}
              action={{
                label: "Create User",
                onClick: () => setIsCreateUserModalOpen(true),
              }}
            />
          ) : (
            <DataTable
              rows={users}
              rowKey={(u) => u.Username || ""}
              columns={[
                {
                  key: "username",
                  header: "Username",
                  render: (u) => (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-indigo-500/10 rounded">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <span className="text-sm font-medium text-text-primary">{u.Username}</span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (u) => (
                    <Badge variant={u.UserStatus === "CONFIRMED" ? "success" : "warning"}>{u.UserStatus}</Badge>
                  ),
                },
                {
                  key: "enabled",
                  header: "Enabled",
                  render: (u) => (
                    <Badge variant={u.Enabled ? "success" : "error"}>{u.Enabled ? "True" : "False"}</Badge>
                  ),
                },
                {
                  key: "created",
                  header: "Created",
                  render: (u) => (u.UserCreateDate ? new Date(u.UserCreateDate).toLocaleString() : "-"),
                },
                {
                  key: "actions",
                  header: "",
                  className: "text-right",
                  render: (u) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(u.Username!)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  ),
                },
              ]}
            />
          )
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden">
                <div className="px-6 py-4 border-b border-border-subtle bg-surface-elevated/30 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-text-primary">Password Policy</h3>
                </div>
                <div className="p-6 space-y-4">
                  <Input
                    label="Minimum Password Length"
                    type="number"
                    min="6"
                    max="99"
                    value={minPasswordLength}
                    onChange={(e) => setMinPasswordLength(e.target.value)}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:bg-surface-hover cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={requireNumbers}
                        onChange={(e) => setRequireNumbers(e.target.checked)}
                        className="rounded border-border-default text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-text-primary font-medium">Require numbers</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:bg-surface-hover cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={requireSymbols}
                        onChange={(e) => setRequireSymbols(e.target.checked)}
                        className="rounded border-border-default text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-text-primary font-medium">Require symbols</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:bg-surface-hover cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={requireUppercase}
                        onChange={(e) => setRequireUppercase(e.target.checked)}
                        className="rounded border-border-default text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-text-primary font-medium">Require uppercase</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:bg-surface-hover cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={requireLowercase}
                        onChange={(e) => setRequireLowercase(e.target.checked)}
                        className="rounded border-border-default text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-text-primary font-medium">Require lowercase</span>
                    </label>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleUpdatePool} isLoading={isUpdatingPool} color="indigo">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden">
                <div className="px-6 py-4 border-b border-border-subtle bg-surface-elevated/30 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-text-primary">Pool Information</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase mb-1">Arn</p>
                    <p className="text-xs font-mono break-all text-text-primary bg-surface-elevated p-2 rounded border border-border-subtle">
                      {selectedPool?.Arn || "-"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-text-muted uppercase mb-1">Status</p>
                      <p className="text-sm text-text-primary font-medium">{selectedPool?.Status || "Active"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text-muted uppercase mb-1">Users</p>
                      <p className="text-sm text-text-primary font-medium">{users.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Modal open={isCreateUserModalOpen} onClose={() => setIsCreateUserModalOpen(false)} title="Create User">
          <form onSubmit={handleCreateUser} className="space-y-4">
            <Input
              label="Username"
              placeholder="jane.doe"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              required
              autoFocus
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsCreateUserModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isCreatingUser} color="indigo">
                Create User
              </Button>
            </div>
          </form>
        </Modal>

        {ConfirmModalComponent}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cognito"
        subtitle="Manage user authentication and identity pools"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {activeTab === "user-pools" && (
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)} color="indigo">
                <Plus className="w-4 h-4 mr-2" />
                Create User Pool
              </Button>
            )}
          </>
        }
      />

      <div className="flex border-b border-border-subtle">
        <button
          onClick={() => setActiveTab("user-pools")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "user-pools"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          User Pools
        </button>
        <button
          onClick={() => setActiveTab("identity-pools")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "identity-pools"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Identity Pools
        </button>
      </div>

      {loading && userPools.length === 0 && identityPools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-card rounded-xl border border-border-subtle">
          <Spinner size="lg" color="indigo" />
          <p className="mt-4 text-text-muted">Loading Cognito resources...</p>
        </div>
      ) : activeTab === "user-pools" ? (
        userPools.length === 0 ? (
          <EmptyState
            title="No User Pools"
            description="Create a user pool to manage your users and authentication."
            icon={Users}
            action={{
              label: "Create User Pool",
              onClick: () => setIsCreateModalOpen(true),
            }}
          />
        ) : (
          <DataTable
            rows={userPools}
            rowKey={(p: UserPoolDescriptionType) => p.Id || ""}
            onRowClick={(p: UserPoolDescriptionType) => handleSelectPool(p.Id!)}
            columns={[
              {
                key: "name",
                header: "Name",
                render: (p) => (
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-500/10 rounded">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <span className="text-sm font-medium text-text-primary group-hover:text-indigo-500 transition-colors">
                      {p.Name}
                    </span>
                  </div>
                ),
              },
              {
                key: "id",
                header: "Pool ID",
                render: (p) => (
                  <code className="text-xs bg-surface-elevated px-1.5 py-0.5 rounded text-text-primary border border-border-subtle">
                    {p.Id}
                  </code>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (p) => <Badge variant="success">{p.Status || "Enabled"}</Badge>,
              },
              {
                key: "modified",
                header: "Last Modified",
                render: (p) => (p.LastModifiedDate ? new Date(p.LastModifiedDate).toLocaleString() : "-"),
              },
              {
                key: "actions",
                header: "",
                className: "text-right",
                render: (p) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUserPool(p.Id!, p.Name!);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                ),
              },
            ]}
          />
        )
      ) : identityPools.length === 0 ? (
        <EmptyState
          title="No Identity Pools"
          description="Identity pools provide AWS credentials to your users."
          icon={Key}
        />
      ) : (
        <DataTable
          rows={identityPools}
          rowKey={(p: IdentityPoolShortDescription) => p.IdentityPoolId || ""}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (p) => (
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-500/10 rounded">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{p.IdentityPoolName}</span>
                </div>
              ),
            },
            {
              key: "id",
              header: "Pool ID",
              render: (p) => (
                <code className="text-xs bg-surface-elevated px-1.5 py-0.5 rounded text-text-primary border border-border-subtle">
                  {p.IdentityPoolId}
                </code>
              ),
            },
          ]}
        />
      )}

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create User Pool">
        <form onSubmit={handleCreateUserPool} className="space-y-4">
          <Input
            label="Pool Name"
            placeholder="my-user-pool"
            value={newPoolName}
            onChange={(e) => setNewPoolName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} color="indigo">
              Create Pool
            </Button>
          </div>
        </form>
      </Modal>

      {ConfirmModalComponent}
    </div>
  );
}

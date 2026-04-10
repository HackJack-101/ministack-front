import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield, Users, FileKey, RefreshCw, Plus, Edit2, Trash2 } from "lucide-react";
import { useIAM } from "../hooks/useIAM";
import { useConfirmModal } from "../hooks/useConfirmModal";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { CreateUserModal } from "../components/iam/CreateUserModal";
import { CreateGroupModal } from "../components/iam/CreateGroupModal";
import { EditUserModal } from "../components/iam/EditUserModal";
import { EditGroupModal } from "../components/iam/EditGroupModal";
import { EditRoleModal } from "../components/iam/EditRoleModal";
import { EditPolicyModal } from "../components/iam/EditPolicyModal";
import { pluralizeWord } from "../utils/format";

type Tab = "users" | "roles" | "groups" | "policies";

export const IAM: React.FC = () => {
  const {
    users,
    roles,
    groups,
    policies,
    loading,
    refresh,
    createUser,
    createGroup,
    deleteUser,
    deleteRole,
    deleteGroup,
    deletePolicy,
    updateUser,
    updateGroup,
    updateRoleTrustPolicy,
    updatePolicyDocument,
  } = useIAM();
  const navigate = useNavigate();
  const { confirm, ConfirmModalComponent } = useConfirmModal();
  const [activeTab, setActiveTab] = useState<Tab>("users");

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const [isEditPolicyModalOpen, setIsEditPolicyModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

  const tabs: { id: Tab; label: string; singular: string; plural?: string; icon: any; count: number }[] = [
    { id: "users", label: "Users", singular: "User", icon: User, count: users.length },
    { id: "roles", label: "Roles", singular: "Role", icon: Shield, count: roles.length },
    { id: "groups", label: "Groups", singular: "Group", icon: Users, count: groups.length },
    {
      id: "policies",
      label: "Policies",
      singular: "Policy",
      plural: "Policies",
      icon: FileKey,
      count: policies.length,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return (
          <DataTable
            columns={[
              {
                key: "UserName",
                header: "User Name",
                render: (u: any) => u.UserName,
                className: "font-medium text-text-primary",
              },
              { key: "UserId", header: "User ID", render: (u: any) => u.UserId, className: "font-mono text-[13px]" },
              {
                key: "CreateDate",
                header: "Created Date",
                render: (u: any) => (u.CreateDate ? new Date(u.CreateDate).toLocaleDateString() : "-"),
              },
              {
                key: "Arn",
                header: "ARN",
                render: (u: any) => (
                  <span className="truncate max-w-xs block" title={u.Arn}>
                    {u.Arn}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "",
                className: "w-20",
                render: (u: any) => (
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setSelectedUser(u);
                        setIsEditUserModalOpen(true);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:!bg-red-500/10 hover:!text-red-500"
                      onClick={() =>
                        confirm({
                          title: "Delete User",
                          description: `Are you sure you want to delete user "${u.UserName}"? This action cannot be undone.`,
                          action: () => deleteUser(u.UserName),
                          confirmLabel: "Delete",
                          confirmVariant: "danger",
                        })
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={users}
            rowKey={(u: any) => u.UserId}
            loading={loading}
            emptyIcon={User}
            emptyTitle="No users found"
            emptyDescription="Create your first IAM user to get started."
            accentColor="text-purple-500"
          />
        );
      case "roles":
        return (
          <DataTable
            columns={[
              {
                key: "RoleName",
                header: "Role Name",
                render: (r: any) => r.RoleName,
                className: "font-medium text-text-primary",
              },
              { key: "RoleId", header: "Role ID", render: (r: any) => r.RoleId, className: "font-mono text-[13px]" },
              {
                key: "CreateDate",
                header: "Created Date",
                render: (r: any) => (r.CreateDate ? new Date(r.CreateDate).toLocaleDateString() : "-"),
              },
              {
                key: "Arn",
                header: "ARN",
                render: (r: any) => (
                  <span className="truncate max-w-xs block" title={r.Arn}>
                    {r.Arn}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "",
                className: "w-20",
                render: (r: any) => (
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setSelectedRole(r);
                        setIsEditRoleModalOpen(true);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:!bg-red-500/10 hover:!text-red-500"
                      onClick={() =>
                        confirm({
                          title: "Delete Role",
                          description: `Are you sure you want to delete role "${r.RoleName}"? This action cannot be undone.`,
                          action: () => deleteRole(r.RoleName),
                          confirmLabel: "Delete",
                          confirmVariant: "danger",
                        })
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={roles}
            rowKey={(r: any) => r.RoleId}
            loading={loading}
            emptyIcon={Shield}
            emptyTitle="No roles found"
            emptyDescription="Create your first IAM role to get started."
            accentColor="text-purple-500"
          />
        );
      case "groups":
        return (
          <DataTable
            columns={[
              {
                key: "GroupName",
                header: "Group Name",
                render: (g: any) => g.GroupName,
                className: "font-medium text-text-primary",
              },
              { key: "GroupId", header: "Group ID", render: (g: any) => g.GroupId, className: "font-mono text-[13px]" },
              {
                key: "CreateDate",
                header: "Created Date",
                render: (g: any) => (g.CreateDate ? new Date(g.CreateDate).toLocaleDateString() : "-"),
              },
              {
                key: "Arn",
                header: "ARN",
                render: (g: any) => (
                  <span className="truncate max-w-xs block" title={g.Arn}>
                    {g.Arn}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "",
                className: "w-20",
                render: (g: any) => (
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setSelectedGroup(g);
                        setIsEditGroupModalOpen(true);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:!bg-red-500/10 hover:!text-red-500"
                      onClick={() =>
                        confirm({
                          title: "Delete Group",
                          description: `Are you sure you want to delete group "${g.GroupName}"? This action cannot be undone.`,
                          action: () => deleteGroup(g.GroupName),
                          confirmLabel: "Delete",
                          confirmVariant: "danger",
                        })
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={groups}
            rowKey={(g: any) => g.GroupId}
            loading={loading}
            emptyIcon={Users}
            emptyTitle="No groups found"
            emptyDescription="Create your first IAM group to get started."
            accentColor="text-purple-500"
          />
        );
      case "policies":
        return (
          <DataTable
            columns={[
              {
                key: "PolicyName",
                header: "Policy Name",
                render: (p: any) => p.PolicyName,
                className: "font-medium text-text-primary",
              },
              {
                key: "PolicyId",
                header: "Policy ID",
                render: (p: any) => p.PolicyId,
                className: "font-mono text-[13px]",
              },
              { key: "DefaultVersionId", header: "Default Version", render: (p: any) => p.DefaultVersionId },
              {
                key: "Arn",
                header: "ARN",
                render: (p: any) => (
                  <span className="truncate max-w-xs block" title={p.Arn}>
                    {p.Arn}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "",
                className: "w-20",
                render: (p: any) => (
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setSelectedPolicy(p);
                        setIsEditPolicyModalOpen(true);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:!bg-red-500/10 hover:!text-red-500"
                      onClick={() =>
                        confirm({
                          title: "Delete Policy",
                          description: `Are you sure you want to delete policy "${p.PolicyName}"? This action cannot be undone.`,
                          action: () => deletePolicy(p.Arn),
                          confirmLabel: "Delete",
                          confirmVariant: "danger",
                        })
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={policies}
            rowKey={(p: any) => p.PolicyId}
            loading={loading}
            emptyIcon={FileKey}
            emptyTitle="No policies found"
            emptyDescription="Create your first IAM policy to get started."
            accentColor="text-purple-500"
          />
        );
      default:
        return null;
    }
  };

  const createLabels: Record<Tab, string> = {
    users: "User",
    groups: "Group",
    roles: "Role",
    policies: "Policy",
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Identity & Access Management"
        subtitle="Manage users, roles, groups, and policies in your local environment"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={refresh} title="Refresh" aria-label="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="purple"
              size="sm"
              onClick={() => {
                if (activeTab === "users") setIsUserModalOpen(true);
                if (activeTab === "groups") setIsGroupModalOpen(true);
                if (activeTab === "roles") navigate("/iam/roles/create");
                if (activeTab === "policies") navigate("/iam/policies/create");
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create {createLabels[activeTab]}
            </Button>
          </>
        }
      />

      <div className="flex gap-2">
        {tabs.map(({ id, singular, plural, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-btn transition-colors duration-150 border ${
              activeTab === id
                ? "bg-purple-500/10 border-purple-500/20 text-purple-500"
                : "bg-surface-card border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{pluralizeWord(count, singular, plural)}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === id ? "bg-purple-500/20" : "bg-surface-hover"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {renderContent()}

      <CreateUserModal open={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onConfirm={createUser} />
      <CreateGroupModal open={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} onConfirm={createGroup} />

      <EditUserModal
        open={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setSelectedUser(null);
        }}
        initialUserName={selectedUser?.UserName || ""}
        onConfirm={(newName) => updateUser(selectedUser?.UserName, newName)}
      />

      <EditGroupModal
        open={isEditGroupModalOpen}
        onClose={() => {
          setIsEditGroupModalOpen(false);
          setSelectedGroup(null);
        }}
        initialGroupName={selectedGroup?.GroupName || ""}
        onConfirm={(newName) => updateGroup(selectedGroup?.GroupName, newName)}
      />

      <EditRoleModal
        open={isEditRoleModalOpen}
        onClose={() => {
          setIsEditRoleModalOpen(false);
          setSelectedRole(null);
        }}
        roleName={selectedRole?.RoleName || ""}
        onConfirm={(doc) => updateRoleTrustPolicy(selectedRole?.RoleName, doc)}
      />

      <EditPolicyModal
        open={isEditPolicyModalOpen}
        onClose={() => {
          setIsEditPolicyModalOpen(false);
          setSelectedPolicy(null);
        }}
        policyArn={selectedPolicy?.Arn || ""}
        policyName={selectedPolicy?.PolicyName || ""}
        defaultVersionId={selectedPolicy?.DefaultVersionId || ""}
        onConfirm={(doc) => updatePolicyDocument(selectedPolicy?.Arn, doc)}
      />

      {ConfirmModalComponent}
    </div>
  );
};

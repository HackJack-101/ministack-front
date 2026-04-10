import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ListUsersCommand,
  ListRolesCommand,
  ListGroupsCommand,
  ListPoliciesCommand,
  CreateUserCommand,
  CreateRoleCommand,
  CreateGroupCommand,
  CreatePolicyCommand,
  DeleteUserCommand,
  DeleteRoleCommand,
  DeleteGroupCommand,
  DeletePolicyCommand,
  UpdateUserCommand,
  UpdateGroupCommand,
  UpdateAssumeRolePolicyCommand,
  CreatePolicyVersionCommand,
  ListPolicyVersionsCommand,
  DeletePolicyVersionCommand,
  GetRoleCommand,
  GetPolicyVersionCommand,
  type User,
  type Role,
  type Group,
  type Policy,
} from "@aws-sdk/client-iam";
import { iamClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useIAM = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, groupsRes, policiesRes] = await Promise.all([
        iamClient.send(new ListUsersCommand({})),
        iamClient.send(new ListRolesCommand({})),
        iamClient.send(new ListGroupsCommand({})),
        iamClient.send(new ListPoliciesCommand({ Scope: "Local" })),
      ]);

      setUsers(usersRes.Users || []);
      setRoles(rolesRes.Roles || []);
      setGroups(groupsRes.Groups || []);
      setPolicies(policiesRes.Policies || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch IAM data");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createUser = useCallback(
    async (userName: string) => {
      try {
        await iamClient.send(new CreateUserCommand({ UserName: userName }));
        toast.success(`User "${userName}" created successfully`);
        await fetchData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create user");
        throw err;
      }
    },
    [fetchData, toast],
  );

  const createGroup = useCallback(
    async (groupName: string) => {
      try {
        await iamClient.send(new CreateGroupCommand({ GroupName: groupName }));
        toast.success(`Group "${groupName}" created successfully`);
        await fetchData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create group");
        throw err;
      }
    },
    [fetchData, toast],
  );

  const createRole = useCallback(
    async (roleName: string, assumeRolePolicyDocument: string) => {
      try {
        await iamClient.send(
          new CreateRoleCommand({
            RoleName: roleName,
            AssumeRolePolicyDocument: assumeRolePolicyDocument,
          }),
        );
        toast.success(`Role "${roleName}" created successfully`);
        await fetchData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create role");
        throw err;
      }
    },
    [fetchData, toast],
  );

  const createPolicy = useCallback(
    async (policyName: string, policyDocument: string) => {
      try {
        await iamClient.send(
          new CreatePolicyCommand({
            PolicyName: policyName,
            PolicyDocument: policyDocument,
          }),
        );
        toast.success(`Policy "${policyName}" created successfully`);
        await fetchData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create policy");
        throw err;
      }
    },
    [fetchData, toast],
  );

  const deleteUser = useCallback(
    async (userName: string) => {
      try {
        await iamClient.send(new DeleteUserCommand({ UserName: userName }));
        toast.success(`User "${userName}" deleted successfully`);
        await fetchData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to delete user");
      }
    },
    [fetchData, toast],
  );

  const deleteRole = useCallback(
    async (roleName: string) => {
      try {
        await iamClient.send(new DeleteRoleCommand({ RoleName: roleName }));
        toast.success(`Role "${roleName}" deleted successfully`);
        await fetchData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to delete role");
      }
    },
    [fetchData, toast],
  );

  const deleteGroup = useCallback(
    async (groupName: string) => {
      try {
        await iamClient.send(new DeleteGroupCommand({ GroupName: groupName }));
        toast.success(`Group "${groupName}" deleted successfully`);
        await fetchData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to delete group");
      }
    },
    [fetchData, toast],
  );

  const deletePolicy = useCallback(
    async (policyArn: string) => {
      try {
        await iamClient.send(new DeletePolicyCommand({ PolicyArn: policyArn }));
        toast.success("Policy deleted successfully");
        await fetchData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to delete policy");
      }
    },
    [fetchData, toast],
  );

  const updateUser = useCallback(
    async (userName: string, newUserName: string) => {
      try {
        await iamClient.send(
          new UpdateUserCommand({
            UserName: userName,
            NewUserName: newUserName,
          }),
        );
        toast.success(`User "${userName}" updated to "${newUserName}"`);
        await fetchData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update user");
        throw err;
      }
    },
    [fetchData, toast],
  );

  const updateGroup = useCallback(
    async (groupName: string, newGroupName: string) => {
      try {
        await iamClient.send(
          new UpdateGroupCommand({
            GroupName: groupName,
            NewGroupName: newGroupName,
          }),
        );
        toast.success(`Group "${groupName}" updated to "${newGroupName}"`);
        await fetchData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update group");
        throw err;
      }
    },
    [fetchData, toast],
  );

  const updateRoleTrustPolicy = useCallback(
    async (roleName: string, policyDocument: string) => {
      try {
        await iamClient.send(
          new UpdateAssumeRolePolicyCommand({
            RoleName: roleName,
            PolicyDocument: policyDocument,
          }),
        );
        toast.success(`Trust policy for role "${roleName}" updated successfully`);
        await fetchData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update trust policy");
        throw err;
      }
    },
    [fetchData, toast],
  );

  const updatePolicyDocument = useCallback(
    async (policyArn: string, policyDocument: string) => {
      try {
        // IAM policies support versions. We list versions, delete the oldest if necessary (limit is 5),
        // and create a new one as default.
        const versionsRes = await iamClient.send(new ListPolicyVersionsCommand({ PolicyArn: policyArn }));
        const versions = versionsRes.Versions || [];

        if (versions.length >= 5) {
          // Find the oldest non-default version to delete
          const nonDefaultVersions = versions.filter((v) => !v.IsDefaultVersion);
          if (nonDefaultVersions.length > 0) {
            const oldest = nonDefaultVersions.sort(
              (a, b) => (a.CreateDate?.getTime() || 0) - (b.CreateDate?.getTime() || 0),
            )[0];

            await iamClient.send(
              new DeletePolicyVersionCommand({
                PolicyArn: policyArn,
                VersionId: oldest.VersionId,
              }),
            );
          }
        }

        await iamClient.send(
          new CreatePolicyVersionCommand({
            PolicyArn: policyArn,
            PolicyDocument: policyDocument,
            SetAsDefault: true,
          }),
        );
        toast.success("Policy document updated successfully");
        await fetchData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update policy document");
        throw err;
      }
    },
    [fetchData, toast],
  );

  const getRole = useCallback(
    async (roleName: string) => {
      try {
        const res = await iamClient.send(new GetRoleCommand({ RoleName: roleName }));
        return res.Role;
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch role details");
        throw err;
      }
    },
    [toast],
  );

  const getPolicyVersion = useCallback(
    async (policyArn: string, versionId: string) => {
      try {
        const res = await iamClient.send(new GetPolicyVersionCommand({ PolicyArn: policyArn, VersionId: versionId }));
        return res.PolicyVersion;
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch policy version");
        throw err;
      }
    },
    [toast],
  );

  return useMemo(
    () => ({
      users,
      roles,
      groups,
      policies,
      loading,
      refresh: fetchData,
      createUser,
      createGroup,
      createRole,
      createPolicy,
      deleteUser,
      deleteRole,
      deleteGroup,
      deletePolicy,
      updateUser,
      updateGroup,
      updateRoleTrustPolicy,
      updatePolicyDocument,
      getRole,
      getPolicyVersion,
    }),
    [
      users,
      roles,
      groups,
      policies,
      loading,
      fetchData,
      createUser,
      createGroup,
      createRole,
      createPolicy,
      deleteUser,
      deleteRole,
      deleteGroup,
      deletePolicy,
      updateUser,
      updateGroup,
      updateRoleTrustPolicy,
      updatePolicyDocument,
      getRole,
      getPolicyVersion,
    ],
  );
};

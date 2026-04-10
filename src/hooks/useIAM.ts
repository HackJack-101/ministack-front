import { useState, useCallback, useEffect } from "react";
import {
  ListUsersCommand,
  ListRolesCommand,
  ListGroupsCommand,
  ListPoliciesCommand,
  CreateUserCommand,
  CreateRoleCommand,
  CreateGroupCommand,
  CreatePolicyCommand,
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

  const createUser = async (userName: string) => {
    try {
      await iamClient.send(new CreateUserCommand({ UserName: userName }));
      toast.success(`User "${userName}" created successfully`);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
      throw err;
    }
  };

  const createGroup = async (groupName: string) => {
    try {
      await iamClient.send(new CreateGroupCommand({ GroupName: groupName }));
      toast.success(`Group "${groupName}" created successfully`);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create group");
      throw err;
    }
  };

  const createRole = async (roleName: string, assumeRolePolicyDocument: string) => {
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
  };

  const createPolicy = async (policyName: string, policyDocument: string) => {
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
  };

  return {
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
  };
};

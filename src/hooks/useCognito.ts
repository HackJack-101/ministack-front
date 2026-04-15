import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListUserPoolsCommand,
  CreateUserPoolCommand,
  DeleteUserPoolCommand,
  DescribeUserPoolCommand,
  UpdateUserPoolCommand,
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  type UserPoolDescriptionType,
  type UserPoolType,
  type UserType,
  type AttributeType,
  type UpdateUserPoolCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { ListIdentityPoolsCommand, type IdentityPoolShortDescription } from "@aws-sdk/client-cognito-identity";
import { cognitoClient, cognitoIdentityClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useCognito = () => {
  const toast = useToast();
  const [userPools, setUserPools] = useState<UserPoolDescriptionType[]>([]);
  const [identityPools, setIdentityPools] = useState<IdentityPoolShortDescription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPools = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cognitoClient.send(new ListUserPoolsCommand({ MaxResults: 60 }));
      setUserPools(response.UserPools || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch user pools");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchIdentityPools = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cognitoIdentityClient.send(new ListIdentityPoolsCommand({ MaxResults: 60 }));
      setIdentityPools(response.IdentityPools || []);
    } catch (err) {
      console.error("Identity Pools fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUserPool = useCallback(
    async (name: string) => {
      try {
        await cognitoClient.send(new CreateUserPoolCommand({ PoolName: name }));
        toast.success(`User pool ${name} created`);
        await fetchUserPools();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create user pool");
      }
    },
    [fetchUserPools, toast],
  );

  const deleteUserPool = useCallback(
    async (id: string) => {
      try {
        await cognitoClient.send(new DeleteUserPoolCommand({ UserPoolId: id }));
        toast.success("User pool deleted");
        await fetchUserPools();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete user pool");
      }
    },
    [fetchUserPools, toast],
  );

  const describeUserPool = useCallback(
    async (id: string) => {
      try {
        const response = await cognitoClient.send(new DescribeUserPoolCommand({ UserPoolId: id }));
        return response.UserPool as UserPoolType;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to describe user pool");
        return null;
      }
    },
    [toast],
  );

  const updateUserPool = useCallback(
    async (id: string, config: Omit<UpdateUserPoolCommandInput, "UserPoolId">) => {
      try {
        await cognitoClient.send(new UpdateUserPoolCommand({ UserPoolId: id, ...config }));
        toast.success("User pool updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update user pool");
      }
    },
    [toast],
  );

  const listUsers = useCallback(
    async (id: string) => {
      try {
        const response = await cognitoClient.send(new ListUsersCommand({ UserPoolId: id }));
        return (response.Users || []) as UserType[];
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to list users");
        return [];
      }
    },
    [toast],
  );

  const adminCreateUser = useCallback(
    async (id: string, username: string, attributes: AttributeType[] = []) => {
      try {
        await cognitoClient.send(
          new AdminCreateUserCommand({
            UserPoolId: id,
            Username: username,
            UserAttributes: attributes,
            MessageAction: "SUPPRESS",
          }),
        );
        toast.success(`User ${username} created`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create user");
      }
    },
    [toast],
  );

  const adminDeleteUser = useCallback(
    async (id: string, username: string) => {
      try {
        await cognitoClient.send(new AdminDeleteUserCommand({ UserPoolId: id, Username: username }));
        toast.success(`User ${username} deleted`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete user");
      }
    },
    [toast],
  );

  const loadInitialData = useCallback(async () => {
    await Promise.all([fetchUserPools(), fetchIdentityPools()]);
  }, [fetchUserPools, fetchIdentityPools]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return useMemo(
    () => ({
      userPools,
      identityPools,
      loading,
      fetchUserPools,
      fetchIdentityPools,
      createUserPool,
      deleteUserPool,
      describeUserPool,
      updateUserPool,
      listUsers,
      adminCreateUser,
      adminDeleteUser,
      refresh: loadInitialData,
    }),
    [
      userPools,
      identityPools,
      loading,
      fetchUserPools,
      fetchIdentityPools,
      createUserPool,
      deleteUserPool,
      describeUserPool,
      updateUserPool,
      listUsers,
      adminCreateUser,
      adminDeleteUser,
      loadInitialData,
    ],
  );
};

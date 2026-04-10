import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListUserPoolsCommand,
  CreateUserPoolCommand,
  DeleteUserPoolCommand,
  type UserPoolDescriptionType,
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
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch user pools");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchIdentityPools = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cognitoIdentityClient.send(new ListIdentityPoolsCommand({ MaxResults: 60 }));
      setIdentityPools(response.IdentityPools || []);
    } catch (err: any) {
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
      } catch (err: any) {
        toast.error(err.message || "Failed to create user pool");
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
      } catch (err: any) {
        toast.error(err.message || "Failed to delete user pool");
      }
    },
    [fetchUserPools, toast],
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
      loadInitialData,
    ],
  );
};

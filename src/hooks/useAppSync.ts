import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListGraphqlApisCommand,
  CreateGraphqlApiCommand,
  DeleteGraphqlApiCommand,
  type GraphqlApi,
  AuthenticationType,
} from "@aws-sdk/client-appsync";
import { appSyncClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useAppSync = () => {
  const toast = useToast();
  const [apis, setApis] = useState<GraphqlApi[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApis = useCallback(async () => {
    setLoading(true);
    try {
      const response = await appSyncClient.send(new ListGraphqlApisCommand({}));
      setApis(response.graphqlApis || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch GraphQL APIs");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createApi = useCallback(
    async (name: string, authenticationType: AuthenticationType = AuthenticationType.API_KEY) => {
      try {
        await appSyncClient.send(
          new CreateGraphqlApiCommand({
            name,
            authenticationType,
          }),
        );
        toast.success("GraphQL API created successfully");
        await fetchApis();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create GraphQL API");
      }
    },
    [fetchApis, toast],
  );

  const deleteApi = useCallback(
    async (apiId: string) => {
      try {
        await appSyncClient.send(new DeleteGraphqlApiCommand({ apiId }));
        toast.success("GraphQL API deleted");
        await fetchApis();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete GraphQL API");
      }
    },
    [fetchApis, toast],
  );

  useEffect(() => {
    fetchApis();
  }, [fetchApis]);

  return useMemo(
    () => ({
      apis,
      loading,
      fetchApis,
      createApi,
      deleteApi,
      refresh: fetchApis,
    }),
    [apis, loading, fetchApis, createApi, deleteApi],
  );
};

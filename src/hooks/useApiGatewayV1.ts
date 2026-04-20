import { useState, useCallback, useMemo, useEffect } from "react";
import {
  GetRestApisCommand,
  CreateRestApiCommand,
  DeleteRestApiCommand,
  type RestApi,
} from "@aws-sdk/client-api-gateway";
import { apiGatewayClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useApiGatewayV1 = () => {
  const toast = useToast();
  const [restApis, setRestApis] = useState<RestApi[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestApis = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGatewayClient.send(new GetRestApisCommand({}));
      setRestApis(response.items || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch REST APIs");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createRestApi = useCallback(
    async (name: string) => {
      try {
        await apiGatewayClient.send(new CreateRestApiCommand({ name }));
        toast.success("REST API created successfully");
        await fetchRestApis();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create REST API");
      }
    },
    [fetchRestApis, toast],
  );

  const deleteRestApi = useCallback(
    async (restApiId: string) => {
      try {
        await apiGatewayClient.send(new DeleteRestApiCommand({ restApiId }));
        toast.success("REST API deleted");
        await fetchRestApis();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete REST API");
      }
    },
    [fetchRestApis, toast],
  );

  useEffect(() => {
    fetchRestApis();
  }, [fetchRestApis]);

  return useMemo(
    () => ({
      restApis,
      loading,
      fetchRestApis,
      createRestApi,
      deleteRestApi,
      refresh: fetchRestApis,
    }),
    [restApis, loading, fetchRestApis, createRestApi, deleteRestApi],
  );
};

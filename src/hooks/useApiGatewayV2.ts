import { useState, useCallback, useMemo, useEffect } from "react";
import {
  GetApisCommand,
  CreateApiCommand,
  DeleteApiCommand,
  type Api,
  ProtocolType,
} from "@aws-sdk/client-apigatewayv2";
import { apiGatewayV2Client } from "../services/awsClients";
import { useToast } from "./useToast";

export const useApiGatewayV2 = () => {
  const toast = useToast();
  const [apis, setApis] = useState<Api[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApis = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGatewayV2Client.send(new GetApisCommand({}));
      setApis(response.Items || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch APIs");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createApi = useCallback(
    async (name: string, protocolType: string) => {
      try {
        await apiGatewayV2Client.send(new CreateApiCommand({ Name: name, ProtocolType: protocolType as ProtocolType }));
        toast.success("API created successfully");
        await fetchApis();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create API");
      }
    },
    [fetchApis, toast],
  );

  const deleteApi = useCallback(
    async (apiId: string) => {
      try {
        await apiGatewayV2Client.send(new DeleteApiCommand({ ApiId: apiId }));
        toast.success("API deleted");
        await fetchApis();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete API");
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

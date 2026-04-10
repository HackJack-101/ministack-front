import { useState, useCallback, useMemo } from "react";
import {
  DescribeParametersCommand,
  GetParameterCommand,
  PutParameterCommand,
  DeleteParameterCommand,
} from "@aws-sdk/client-ssm";
import type { ParameterMetadata } from "@aws-sdk/client-ssm";
import { ssmClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useSSM = () => {
  const [parameters, setParameters] = useState<ParameterMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchParameters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ssmClient.send(new DescribeParametersCommand({}));
      setParameters(response.Parameters || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch parameters");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getParameterValue = useCallback(
    async (name: string) => {
      try {
        const response = await ssmClient.send(new GetParameterCommand({ Name: name, WithDecryption: true }));
        return response.Parameter?.Value || "";
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch parameter value");
        return "";
      }
    },
    [toast],
  );

  const putParameter = useCallback(
    async (name: string, value: string, type: "String" | "StringList" | "SecureString", overwrite = true) => {
      try {
        await ssmClient.send(
          new PutParameterCommand({
            Name: name,
            Value: value,
            Type: type,
            Overwrite: overwrite,
          }),
        );
        toast.success("Parameter saved successfully");
        await fetchParameters();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to save parameter");
      }
    },
    [fetchParameters, toast],
  );

  const deleteParameter = useCallback(
    async (name: string) => {
      try {
        await ssmClient.send(new DeleteParameterCommand({ Name: name }));
        toast.success("Parameter deleted successfully");
        await fetchParameters();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to delete parameter");
      }
    },
    [fetchParameters, toast],
  );

  return useMemo(
    () => ({
      parameters,
      loading,
      fetchParameters,
      getParameterValue,
      putParameter,
      deleteParameter,
    }),
    [parameters, loading, fetchParameters, getParameterValue, putParameter, deleteParameter],
  );
};

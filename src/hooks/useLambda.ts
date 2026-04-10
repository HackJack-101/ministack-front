import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ListFunctionsCommand,
  GetFunctionCommand,
  InvokeCommand,
  CreateFunctionCommand,
  type FunctionConfiguration,
} from "@aws-sdk/client-lambda";
import { lambdaClient } from "../services/awsClients";
import { useToast } from "./useToast";

export interface CreateFunctionForm {
  FunctionName: string;
  Runtime: string;
  Handler: string;
  Role: string;
  ZipFile: Uint8Array;
}

export const useLambda = () => {
  const [functions, setFunctions] = useState<FunctionConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchFunctions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await lambdaClient.send(new ListFunctionsCommand({}));
      setFunctions(response.Functions || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch Lambda functions");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createFunction = useCallback(async (params: CreateFunctionForm) => {
    try {
      await lambdaClient.send(
        new CreateFunctionCommand({
          FunctionName: params.FunctionName,
          Runtime: params.Runtime as any,
          Handler: params.Handler,
          Role: params.Role,
          Code: { ZipFile: params.ZipFile },
        }),
      );
      toast.success(`Function "${params.FunctionName}" created successfully`);
      await fetchFunctions();
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create function");
      return false;
    }
  }, [toast, fetchFunctions]);

  const getFunction = useCallback(async (functionName: string) => {
    try {
      const response = await lambdaClient.send(new GetFunctionCommand({ FunctionName: functionName }));
      return response;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch function details");
      return null;
    }
  }, [toast]);

  const invokeFunction = useCallback(async (functionName: string, payload: string) => {
    try {
      const response = await lambdaClient.send(
        new InvokeCommand({
          FunctionName: functionName,
          Payload: new TextEncoder().encode(payload),
          LogType: "Tail",
        }),
      );
      
      const result = {
        payload: response.Payload ? new TextDecoder().decode(response.Payload) : null,
        logs: response.LogResult ? atob(response.LogResult) : null,
        statusCode: response.StatusCode,
        executedVersion: response.ExecutedVersion,
        functionError: response.FunctionError,
      };
      
      return result;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to invoke function");
      return null;
    }
  }, [toast]);

  useEffect(() => {
    fetchFunctions();
  }, [fetchFunctions]);

  const value = useMemo(() => ({
    functions,
    loading,
    fetchFunctions,
    getFunction,
    createFunction,
    invokeFunction,
  }), [functions, loading, fetchFunctions, getFunction, createFunction, invokeFunction]);

  return value;
};

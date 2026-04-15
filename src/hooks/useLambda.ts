import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ListFunctionsCommand,
  GetFunctionCommand,
  InvokeCommand,
  CreateFunctionCommand,
  UpdateFunctionConfigurationCommand,
  UpdateFunctionCodeCommand,
  DeleteFunctionCommand,
  ListEventSourceMappingsCommand,
  CreateEventSourceMappingCommand,
  DeleteEventSourceMappingCommand,
  UpdateEventSourceMappingCommand,
  type FunctionConfiguration,
  type LoggingConfig,
} from "@aws-sdk/client-lambda";
export type { EventSourceMappingConfiguration } from "@aws-sdk/client-lambda";
import { lambdaClient } from "../services/awsClients";
import { useToast } from "./useToast";

export interface CreateFunctionForm {
  FunctionName: string;
  Runtime: string;
  Handler: string;
  Role: string;
  ZipFile: Uint8Array;
  LoggingConfig?: LoggingConfig;
  Environment?: {
    Variables?: Record<string, string>;
  };
}

export interface CreateEventSourceMappingForm {
  FunctionName: string;
  EventSourceArn: string;
  BatchSize?: number;
  Enabled?: boolean;
  StartingPosition?: "TRIM_HORIZON" | "LATEST" | "AT_TIMESTAMP";
}

export interface UpdateFunctionConfigurationForm {
  FunctionName: string;
  Runtime?: string;
  Handler?: string;
  Role?: string;
  Description?: string;
  Timeout?: number;
  MemorySize?: number;
  Environment?: {
    Variables?: Record<string, string>;
  };
  LoggingConfig?: LoggingConfig;
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

  const createFunction = useCallback(
    async (params: CreateFunctionForm) => {
      try {
        await lambdaClient.send(
          new CreateFunctionCommand({
            FunctionName: params.FunctionName,
            Runtime: params.Runtime as any,
            Handler: params.Handler,
            Role: params.Role,
            Code: { ZipFile: params.ZipFile },
            LoggingConfig: params.LoggingConfig,
            Environment: params.Environment,
          }),
        );
        toast.success(`Function "${params.FunctionName}" created successfully`);
        await fetchFunctions();
        return true;
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create function");
        return false;
      }
    },
    [toast, fetchFunctions],
  );

  const getFunction = useCallback(
    async (functionName: string) => {
      try {
        const response = await lambdaClient.send(new GetFunctionCommand({ FunctionName: functionName }));
        return response;
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch function details");
        return null;
      }
    },
    [toast],
  );

  const invokeFunction = useCallback(
    async (functionName: string, payload: string) => {
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
    },
    [toast],
  );

  const updateFunctionConfiguration = useCallback(
    async (params: UpdateFunctionConfigurationForm) => {
      try {
        await lambdaClient.send(
          new UpdateFunctionConfigurationCommand({
            FunctionName: params.FunctionName,
            Runtime: params.Runtime as any,
            Handler: params.Handler,
            Role: params.Role,
            Description: params.Description,
            Timeout: params.Timeout,
            MemorySize: params.MemorySize,
            Environment: params.Environment,
            LoggingConfig: params.LoggingConfig,
          }),
        );
        toast.success(
          `Function configuration for "${params.FunctionName}" updated successfully. Changes will be available in the next execution.`,
        );
        await fetchFunctions();
        return true;
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update function configuration");
        return false;
      }
    },
    [toast, fetchFunctions],
  );

  const updateFunctionCode = useCallback(
    async (functionName: string, zipFile: Uint8Array) => {
      try {
        await lambdaClient.send(
          new UpdateFunctionCodeCommand({
            FunctionName: functionName,
            ZipFile: zipFile,
          }),
        );
        toast.success(`Function code for "${functionName}" updated successfully`);
        await fetchFunctions();
        return true;
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update function code");
        return false;
      }
    },
    [toast, fetchFunctions],
  );

  const deleteFunction = useCallback(
    async (functionName: string) => {
      try {
        await lambdaClient.send(new DeleteFunctionCommand({ FunctionName: functionName }));
        toast.success(`Function "${functionName}" deleted successfully`);
        await fetchFunctions();
        return true;
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to delete function");
        return false;
      }
    },
    [toast, fetchFunctions],
  );
  const listEventSourceMappings = useCallback(
    async (functionName: string) => {
      try {
        const response = await lambdaClient.send(new ListEventSourceMappingsCommand({ FunctionName: functionName }));
        return response.EventSourceMappings || [];
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch event source mappings");
        return [];
      }
    },
    [toast],
  );

  const createEventSourceMapping = useCallback(
    async (params: CreateEventSourceMappingForm) => {
      try {
        await lambdaClient.send(
          new CreateEventSourceMappingCommand({
            FunctionName: params.FunctionName,
            EventSourceArn: params.EventSourceArn,
            BatchSize: params.BatchSize,
            Enabled: params.Enabled,
            StartingPosition: params.StartingPosition as any,
          }),
        );
        toast.success("Event source mapping created successfully");
        return true;
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create event source mapping");
        return false;
      }
    },
    [toast],
  );

  const deleteEventSourceMapping = useCallback(
    async (uuid: string) => {
      try {
        await lambdaClient.send(new DeleteEventSourceMappingCommand({ UUID: uuid }));
        toast.success("Event source mapping deleted successfully");
        return true;
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to delete event source mapping");
        return false;
      }
    },
    [toast],
  );

  const updateEventSourceMapping = useCallback(
    async (uuid: string, enabled: boolean) => {
      try {
        await lambdaClient.send(new UpdateEventSourceMappingCommand({ UUID: uuid, Enabled: enabled }));
        toast.success(`Event source mapping ${enabled ? "enabled" : "disabled"} successfully`);
        return true;
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update event source mapping");
        return false;
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchFunctions();
  }, [fetchFunctions]);

  const value = useMemo(
    () => ({
      functions,
      loading,
      fetchFunctions,
      getFunction,
      createFunction,
      invokeFunction,
      updateFunctionConfiguration,
      updateFunctionCode,
      deleteFunction,
      listEventSourceMappings,
      createEventSourceMapping,
      deleteEventSourceMapping,
      updateEventSourceMapping,
    }),
    [
      functions,
      loading,
      fetchFunctions,
      getFunction,
      createFunction,
      invokeFunction,
      updateFunctionConfiguration,
      updateFunctionCode,
      deleteFunction,
      listEventSourceMappings,
      createEventSourceMapping,
      deleteEventSourceMapping,
      updateEventSourceMapping,
    ],
  );

  return value;
};

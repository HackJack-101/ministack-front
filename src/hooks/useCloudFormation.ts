import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DescribeStacksCommand,
  DeleteStackCommand,
} from "@aws-sdk/client-cloudformation";
import type { Stack } from "@aws-sdk/client-cloudformation";
import { cloudFormationClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useCloudFormation = () => {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchStacks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cloudFormationClient.send(new DescribeStacksCommand({}));
      setStacks(response.Stacks || []);
    } catch (err) {
      console.error("Failed to fetch CloudFormation stacks", err);
      toast.error("Failed to fetch stacks");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteStack = useCallback(async (stackName: string) => {
    try {
      await cloudFormationClient.send(new DeleteStackCommand({ StackName: stackName }));
      toast.success(`Stack ${stackName} deletion initiated`);
      fetchStacks();
    } catch (err) {
      console.error("Failed to delete stack", err);
      toast.error("Failed to delete stack");
    }
  }, [toast, fetchStacks]);

  useEffect(() => {
    fetchStacks();
  }, [fetchStacks]);

  return useMemo(
    () => ({
      stacks,
      loading,
      refresh: fetchStacks,
      deleteStack,
    }),
    [stacks, loading, fetchStacks, deleteStack]
  );
};

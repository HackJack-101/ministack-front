import { useState, useCallback, useMemo, useEffect } from "react";
import {
  DescribeAutoScalingGroupsCommand,
  DeleteAutoScalingGroupCommand,
  type AutoScalingGroup,
} from "@aws-sdk/client-auto-scaling";
import { autoScalingClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useAutoScaling = () => {
  const toast = useToast();
  const [groups, setGroups] = useState<AutoScalingGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await autoScalingClient.send(new DescribeAutoScalingGroupsCommand({}));
      setGroups(response.AutoScalingGroups || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch Auto Scaling groups");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteGroup = useCallback(
    async (name: string) => {
      try {
        await autoScalingClient.send(
          new DeleteAutoScalingGroupCommand({ AutoScalingGroupName: name, ForceDelete: true }),
        );
        toast.success("Auto Scaling group deleted");
        await fetchGroups();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete Auto Scaling group");
      }
    },
    [fetchGroups, toast],
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return useMemo(
    () => ({
      groups,
      loading,
      fetchGroups,
      deleteGroup,
      refresh: fetchGroups,
    }),
    [groups, loading, fetchGroups, deleteGroup],
  );
};

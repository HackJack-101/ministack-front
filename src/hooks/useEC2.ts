import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DescribeInstancesCommand,
  TerminateInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
} from "@aws-sdk/client-ec2";
import type { Instance } from "@aws-sdk/client-ec2";
import { ec2Client } from "../services/awsClients";
import { useToast } from "./useToast";

export const useEC2 = () => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchInstances = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ec2Client.send(new DescribeInstancesCommand({}));
      const allInstances = response.Reservations?.flatMap((r) => r.Instances || []) || [];
      setInstances(allInstances);
    } catch (err) {
      console.error("Failed to fetch EC2 instances", err);
      toast.error("Failed to fetch instances");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const terminateInstance = useCallback(
    async (instanceId: string) => {
      try {
        await ec2Client.send(new TerminateInstancesCommand({ InstanceIds: [instanceId] }));
        toast.success(`Instance ${instanceId} termination initiated`);
        fetchInstances();
      } catch (err) {
        console.error("Failed to terminate instance", err);
        toast.error("Failed to terminate instance");
      }
    },
    [toast, fetchInstances],
  );

  const startInstance = useCallback(
    async (instanceId: string) => {
      try {
        await ec2Client.send(new StartInstancesCommand({ InstanceIds: [instanceId] }));
        toast.success(`Instance ${instanceId} starting`);
        fetchInstances();
      } catch (err) {
        console.error("Failed to start instance", err);
        toast.error("Failed to start instance");
      }
    },
    [toast, fetchInstances],
  );

  const stopInstance = useCallback(
    async (instanceId: string) => {
      try {
        await ec2Client.send(new StopInstancesCommand({ InstanceIds: [instanceId] }));
        toast.success(`Instance ${instanceId} stopping`);
        fetchInstances();
      } catch (err) {
        console.error("Failed to stop instance", err);
        toast.error("Failed to stop instance");
      }
    },
    [toast, fetchInstances],
  );

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  return useMemo(
    () => ({
      instances,
      loading,
      refresh: fetchInstances,
      terminateInstance,
      startInstance,
      stopInstance,
    }),
    [instances, loading, fetchInstances, terminateInstance, startInstance, stopInstance],
  );
};

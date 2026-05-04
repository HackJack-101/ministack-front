import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListClustersCommand,
  ListStepsCommand,
  TerminateJobFlowsCommand,
  CancelStepsCommand,
  type ClusterSummary,
  type StepSummary,
} from "@aws-sdk/client-emr";
import { emrClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useEMR = () => {
  const toast = useToast();
  const [clusters, setClusters] = useState<ClusterSummary[]>([]);
  const [steps, setSteps] = useState<StepSummary[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClusters = useCallback(async () => {
    setLoading(true);
    try {
      const listRes = await emrClient.send(new ListClustersCommand({}));
      setClusters(listRes.Clusters || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch EMR clusters");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchSteps = useCallback(
    async (clusterId: string) => {
      try {
        const res = await emrClient.send(new ListStepsCommand({ ClusterId: clusterId }));
        setSteps(res.Steps || []);
        setSelectedClusterId(clusterId);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch steps");
      }
    },
    [toast],
  );

  const terminateCluster = useCallback(
    async (id: string) => {
      try {
        await emrClient.send(new TerminateJobFlowsCommand({ JobFlowIds: [id] }));
        toast.success("Cluster termination requested");
        await fetchClusters();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to terminate cluster");
      }
    },
    [fetchClusters, toast],
  );

  const cancelStep = useCallback(
    async (clusterId: string, stepId: string) => {
      try {
        await emrClient.send(new CancelStepsCommand({ ClusterId: clusterId, StepIds: [stepId] }));
        toast.success("Step cancellation requested");
        await fetchSteps(clusterId);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to cancel step");
      }
    },
    [fetchSteps, toast],
  );

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  return useMemo(
    () => ({
      clusters,
      steps,
      selectedClusterId,
      loading,
      fetchSteps,
      terminateCluster,
      cancelStep,
      refresh: fetchClusters,
    }),
    [clusters, steps, selectedClusterId, loading, fetchSteps, terminateCluster, cancelStep, fetchClusters],
  );
};

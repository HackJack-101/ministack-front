import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ListClustersCommand,
  DeleteClusterCommand,
} from "@aws-sdk/client-ecs";
import { ecsClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useECS = () => {
  const [clusters, setClusters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchClusters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ecsClient.send(new ListClustersCommand({}));
      setClusters(response.clusterArns || []);
    } catch (err) {
      console.error("Failed to fetch ECS clusters", err);
      toast.error("Failed to fetch clusters");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteCluster = useCallback(async (clusterArn: string) => {
    try {
      await ecsClient.send(new DeleteClusterCommand({ cluster: clusterArn }));
      toast.success("Cluster deletion initiated");
      fetchClusters();
    } catch (err) {
      console.error("Failed to delete cluster", err);
      toast.error("Failed to delete cluster");
    }
  }, [toast, fetchClusters]);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  return useMemo(
    () => ({
      clusters,
      loading,
      refresh: fetchClusters,
      deleteCluster,
    }),
    [clusters, loading, fetchClusters, deleteCluster]
  );
};

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ListClustersCommand,
  DescribeClusterCommand,
  ListNodegroupsCommand,
  DescribeNodegroupCommand,
  DeleteClusterCommand,
  DeleteNodegroupCommand,
  type Cluster,
  type Nodegroup,
} from "@aws-sdk/client-eks";
import { eksClient } from "../services/awsClients";
import { useToast } from "./useToast";

export function useEKS() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [nodegroups, setNodegroups] = useState<Nodegroup[]>([]);
  const [selectedClusterName, setSelectedClusterName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchClusters = useCallback(async () => {
    setLoading(true);
    try {
      const listRes = await eksClient.send(new ListClustersCommand({}));
      const names = listRes.clusters ?? [];
      const details = await Promise.all(
        names.map((name) =>
          eksClient
            .send(new DescribeClusterCommand({ name }))
            .then((r) => r.cluster!)
            .catch(() => null),
        ),
      );
      setClusters(details.filter(Boolean) as Cluster[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to fetch EKS clusters");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchNodegroups = useCallback(
    async (clusterName: string) => {
      setSelectedClusterName(clusterName);
      setLoading(true);
      try {
        const listRes = await eksClient.send(new ListNodegroupsCommand({ clusterName }));
        const names = listRes.nodegroups ?? [];
        const details = await Promise.all(
          names.map((nodegroupName) =>
            eksClient
              .send(new DescribeNodegroupCommand({ clusterName, nodegroupName }))
              .then((r) => r.nodegroup!)
              .catch(() => null),
          ),
        );
        setNodegroups(details.filter(Boolean) as Nodegroup[]);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to fetch nodegroups");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  const deleteCluster = useCallback(
    async (name: string) => {
      try {
        await eksClient.send(new DeleteClusterCommand({ name }));
        toast.success(`Cluster "${name}" deleted`);
        await fetchClusters();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete cluster");
      }
    },
    [toast, fetchClusters],
  );

  const deleteNodegroup = useCallback(
    async (clusterName: string, nodegroupName: string) => {
      try {
        await eksClient.send(new DeleteNodegroupCommand({ clusterName, nodegroupName }));
        toast.success(`Nodegroup "${nodegroupName}" deleted`);
        await fetchNodegroups(clusterName);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete nodegroup");
      }
    },
    [toast, fetchNodegroups],
  );

  const refresh = useCallback(() => {
    fetchClusters();
  }, [fetchClusters]);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  return useMemo(
    () => ({
      clusters,
      nodegroups,
      selectedClusterName,
      loading,
      fetchNodegroups,
      deleteCluster,
      deleteNodegroup,
      refresh,
    }),
    [clusters, nodegroups, selectedClusterName, loading, fetchNodegroups, deleteCluster, deleteNodegroup, refresh],
  );
}

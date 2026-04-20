import { useState, useCallback, useMemo, useEffect } from "react";
import {
  DescribeCacheClustersCommand,
  DeleteCacheClusterCommand,
  type CacheCluster,
} from "@aws-sdk/client-elasticache";
import { elastiCacheClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useElastiCache = () => {
  const toast = useToast();
  const [clusters, setClusters] = useState<CacheCluster[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClusters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await elastiCacheClient.send(new DescribeCacheClustersCommand({}));
      setClusters(response.CacheClusters || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch clusters");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteCacheCluster = useCallback(
    async (clusterId: string) => {
      try {
        await elastiCacheClient.send(new DeleteCacheClusterCommand({ CacheClusterId: clusterId }));
        toast.success("Cache cluster deleted");
        await fetchClusters();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete cluster");
      }
    },
    [fetchClusters, toast],
  );

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  return useMemo(
    () => ({
      clusters,
      loading,
      fetchClusters,
      deleteCacheCluster,
      refresh: fetchClusters,
    }),
    [clusters, loading, fetchClusters, deleteCacheCluster],
  );
};

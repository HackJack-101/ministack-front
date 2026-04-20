import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListDistributionsCommand,
  DeleteDistributionCommand,
  CreateInvalidationCommand,
  type DistributionSummary,
} from "@aws-sdk/client-cloudfront";
import { cloudFrontClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useCloudFront = () => {
  const toast = useToast();
  const [distributions, setDistributions] = useState<DistributionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDistributions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cloudFrontClient.send(new ListDistributionsCommand({}));
      setDistributions(response.DistributionList?.Items || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch distributions");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteDistribution = useCallback(
    async (id: string, etag: string) => {
      try {
        await cloudFrontClient.send(new DeleteDistributionCommand({ Id: id, IfMatch: etag }));
        toast.success("Distribution deleted");
        await fetchDistributions();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete distribution");
      }
    },
    [fetchDistributions, toast],
  );

  const createInvalidation = useCallback(
    async (distributionId: string, paths: string[]) => {
      try {
        await cloudFrontClient.send(
          new CreateInvalidationCommand({
            DistributionId: distributionId,
            InvalidationBatch: {
              Paths: { Quantity: paths.length, Items: paths },
              CallerReference: `ministack-${Date.now()}`,
            },
          }),
        );
        toast.success("Invalidation created");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create invalidation");
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchDistributions();
  }, [fetchDistributions]);

  return useMemo(
    () => ({
      distributions,
      loading,
      fetchDistributions,
      deleteDistribution,
      createInvalidation,
      refresh: fetchDistributions,
    }),
    [distributions, loading, fetchDistributions, deleteDistribution, createInvalidation],
  );
};

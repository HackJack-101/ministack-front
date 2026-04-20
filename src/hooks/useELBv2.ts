import { useState, useCallback, useMemo, useEffect } from "react";
import {
  DescribeLoadBalancersCommand,
  DeleteLoadBalancerCommand,
  type LoadBalancer,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import { elbv2Client } from "../services/awsClients";
import { useToast } from "./useToast";

export const useELBv2 = () => {
  const toast = useToast();
  const [loadBalancers, setLoadBalancers] = useState<LoadBalancer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoadBalancers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await elbv2Client.send(new DescribeLoadBalancersCommand({}));
      setLoadBalancers(response.LoadBalancers || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch load balancers");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteLoadBalancer = useCallback(
    async (arn: string) => {
      try {
        await elbv2Client.send(new DeleteLoadBalancerCommand({ LoadBalancerArn: arn }));
        toast.success("Load balancer deleted");
        await fetchLoadBalancers();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete load balancer");
      }
    },
    [fetchLoadBalancers, toast],
  );

  useEffect(() => {
    fetchLoadBalancers();
  }, [fetchLoadBalancers]);

  return useMemo(
    () => ({
      loadBalancers,
      loading,
      fetchLoadBalancers,
      deleteLoadBalancer,
      refresh: fetchLoadBalancers,
    }),
    [loadBalancers, loading, fetchLoadBalancers, deleteLoadBalancer],
  );
};

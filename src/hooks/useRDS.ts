import { useState, useEffect, useCallback, useMemo } from "react";
import { DescribeDBInstancesCommand, DeleteDBInstanceCommand } from "@aws-sdk/client-rds";
import type { DBInstance } from "@aws-sdk/client-rds";
import { rdsClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useRDS = () => {
  const [instances, setInstances] = useState<DBInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchInstances = useCallback(async () => {
    setLoading(true);
    try {
      const response = await rdsClient.send(new DescribeDBInstancesCommand({}));
      setInstances(response.DBInstances || []);
    } catch (err) {
      console.error("Failed to fetch RDS instances", err);
      toast.error("Failed to fetch instances");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteInstance = useCallback(
    async (instanceId: string) => {
      try {
        await rdsClient.send(
          new DeleteDBInstanceCommand({
            DBInstanceIdentifier: instanceId,
            SkipFinalSnapshot: true,
          }),
        );
        toast.success(`DB Instance ${instanceId} deletion initiated`);
        fetchInstances();
      } catch (err) {
        console.error("Failed to delete DB instance", err);
        toast.error("Failed to delete DB instance");
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
      deleteInstance,
    }),
    [instances, loading, fetchInstances, deleteInstance],
  );
};

import { useState, useCallback, useMemo, useEffect } from "react";
import { ListWebACLsCommand, DeleteWebACLCommand, type WebACLSummary } from "@aws-sdk/client-wafv2";
import { wafv2Client } from "../services/awsClients";
import { useToast } from "./useToast";

export const useWAFv2 = () => {
  const toast = useToast();
  const [webACLs, setWebACLs] = useState<WebACLSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebACLs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await wafv2Client.send(new ListWebACLsCommand({ Scope: "REGIONAL" }));
      setWebACLs(response.WebACLs || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch Web ACLs");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createWebACL = useCallback(
    async (name: string) => {
      try {
        await wafv2Client.send({
          // Using any because of complex mandatory params in WAFv2
          Name: name,
          Scope: "REGIONAL",
          DefaultAction: { Allow: {} },
          VisibilityConfig: {
            SampledRequestsEnabled: true,
            CloudWatchMetricsEnabled: true,
            MetricName: name,
          },
          Rules: [],
        } as any);
        toast.success(`Web ACL ${name} created`);
        await fetchWebACLs();
      } catch (err: any) {
        toast.error(err.message || "Failed to create Web ACL");
      }
    },
    [fetchWebACLs, toast],
  );

  const deleteWebACL = useCallback(
    async (name: string, id: string, lockToken: string) => {
      try {
        await wafv2Client.send(
          new DeleteWebACLCommand({
            Name: name,
            Id: id,
            Scope: "REGIONAL",
            LockToken: lockToken,
          }),
        );
        toast.success("Web ACL deleted");
        await fetchWebACLs();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete Web ACL");
      }
    },
    [fetchWebACLs, toast],
  );

  useEffect(() => {
    fetchWebACLs();
  }, [fetchWebACLs]);

  return useMemo(
    () => ({
      webACLs,
      loading,
      fetchWebACLs,
      createWebACL,
      deleteWebACL,
      refresh: fetchWebACLs,
    }),
    [webACLs, loading, fetchWebACLs, createWebACL, deleteWebACL],
  );
};

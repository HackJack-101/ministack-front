import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ListDomainNamesCommand,
  DescribeDomainsCommand,
  DeleteDomainCommand,
  type DomainStatus,
} from "@aws-sdk/client-opensearch";
import { openSearchClient } from "../services/awsClients";
import { useToast } from "./useToast";

export function useOpenSearch() {
  const [domains, setDomains] = useState<DomainStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const listRes = await openSearchClient.send(new ListDomainNamesCommand({}));
      const names = (listRes.DomainNames ?? []).map((d) => d.DomainName!).filter(Boolean);
      if (names.length === 0) {
        setDomains([]);
        return;
      }
      const detailsRes = await openSearchClient.send(new DescribeDomainsCommand({ DomainNames: names }));
      setDomains(detailsRes.DomainStatusList ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to fetch OpenSearch domains");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteDomain = useCallback(
    async (domainName: string) => {
      try {
        await openSearchClient.send(new DeleteDomainCommand({ DomainName: domainName }));
        toast.success(`Domain "${domainName}" deleted`);
        await fetchDomains();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete domain");
      }
    },
    [toast, fetchDomains],
  );

  const refresh = useCallback(() => {
    fetchDomains();
  }, [fetchDomains]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  return useMemo(() => ({ domains, loading, deleteDomain, refresh }), [domains, loading, deleteDomain, refresh]);
}

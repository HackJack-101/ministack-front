import { useState, useCallback, useMemo } from "react";
import {
  ListHostedZonesCommand,
  CreateHostedZoneCommand,
  DeleteHostedZoneCommand,
  ListResourceRecordSetsCommand,
} from "@aws-sdk/client-route-53";
import type { HostedZone } from "@aws-sdk/client-route-53";
import { route53Client } from "../services/awsClients";
import { useToast } from "./useToast";

export const useRoute53 = () => {
  const [hostedZones, setHostedZones] = useState<HostedZone[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchHostedZones = useCallback(async () => {
    setLoading(true);
    try {
      const response = await route53Client.send(new ListHostedZonesCommand({}));
      setHostedZones(response.HostedZones || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch hosted zones");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchRecordSets = useCallback(
    async (hostedZoneId: string) => {
      try {
        const response = await route53Client.send(new ListResourceRecordSetsCommand({ HostedZoneId: hostedZoneId }));
        return response.ResourceRecordSets || [];
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch record sets");
        return [];
      }
    },
    [toast],
  );

  const createHostedZone = useCallback(
    async (name: string) => {
      try {
        await route53Client.send(
          new CreateHostedZoneCommand({
            Name: name,
            CallerReference: Date.now().toString(),
          }),
        );
        toast.success("Hosted zone created successfully");
        await fetchHostedZones();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create hosted zone");
      }
    },
    [fetchHostedZones, toast],
  );

  const deleteHostedZone = useCallback(
    async (hostedZoneId: string) => {
      try {
        await route53Client.send(new DeleteHostedZoneCommand({ Id: hostedZoneId }));
        toast.success("Hosted zone deleted successfully");
        await fetchHostedZones();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete hosted zone");
      }
    },
    [fetchHostedZones, toast],
  );

  return useMemo(
    () => ({
      hostedZones,
      loading,
      fetchHostedZones,
      fetchRecordSets,
      createHostedZone,
      deleteHostedZone,
    }),
    [hostedZones, loading, fetchHostedZones, fetchRecordSets, createHostedZone, deleteHostedZone],
  );
};

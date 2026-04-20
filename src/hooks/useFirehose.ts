import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ListDeliveryStreamsCommand,
  CreateDeliveryStreamCommand,
  DeleteDeliveryStreamCommand,
  DescribeDeliveryStreamCommand,
  type DeliveryStreamDescription,
} from "@aws-sdk/client-firehose";
import { firehoseClient } from "../services/awsClients";
import { useToast } from "./useToast";

export const useFirehose = () => {
  const toast = useToast();
  const [streams, setStreams] = useState<DeliveryStreamDescription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStreams = useCallback(async () => {
    setLoading(true);
    try {
      const listResponse = await firehoseClient.send(new ListDeliveryStreamsCommand({}));
      const names = listResponse.DeliveryStreamNames || [];
      const descriptions = await Promise.all(
        names.map(async (name) => {
          const detail = await firehoseClient.send(new DescribeDeliveryStreamCommand({ DeliveryStreamName: name }));
          return detail.DeliveryStreamDescription!;
        }),
      );
      setStreams(descriptions);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch delivery streams");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createStream = useCallback(
    async (name: string) => {
      try {
        await firehoseClient.send(
          new CreateDeliveryStreamCommand({
            DeliveryStreamName: name,
            DeliveryStreamType: "DirectPut",
          }),
        );
        toast.success("Delivery stream created successfully");
        await fetchStreams();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create delivery stream");
      }
    },
    [fetchStreams, toast],
  );

  const deleteStream = useCallback(
    async (name: string) => {
      try {
        await firehoseClient.send(new DeleteDeliveryStreamCommand({ DeliveryStreamName: name }));
        toast.success("Delivery stream deleted");
        await fetchStreams();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete delivery stream");
      }
    },
    [fetchStreams, toast],
  );

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  return useMemo(
    () => ({
      streams,
      loading,
      fetchStreams,
      createStream,
      deleteStream,
      refresh: fetchStreams,
    }),
    [streams, loading, fetchStreams, createStream, deleteStream],
  );
};
